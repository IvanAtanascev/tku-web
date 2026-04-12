import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma";
import { calculateReview } from "../lib/utils/spacedRepetition";

import type {
  CreateCardBody,
  DeleteCardParams,
  GetCardParams,
  UpdateCardParams,
  UpdateCardBody,
  PostCardParams,
  ReviewCardBody,
  StudyParams,
  StudyQuery,
} from "../schemas/card.schemas";

export const getAllCards = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const cards = await prisma.card.findMany();
    return reply.code(200).send(cards);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: "failed to fetch cards" });
  }
};

export const createCard = async (
  request: FastifyRequest<{ Body: CreateCardBody }>,
  reply: FastifyReply,
) => {
  const { original, translation, description, deckId } = request.body;
  const user = request.user as { id: number; username: string };

  try {
    const authorIdCheck = await prisma.deck.findUnique({
      where: { id: deckId },
      select: { id: true, authorId: true },
    });

    if (authorIdCheck === null || authorIdCheck.authorId !== user.id) {
      return reply
        .code(403)
        .send({ error: "you can't add cards to this deck" });
    }

    const newCard = await prisma.card.create({
      data: { original, translation, description, deckId },
    });

    return reply.code(201).send(newCard);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: "failed to create card" });
  }
};

export const deleteCard = async (
  request: FastifyRequest<{ Params: DeleteCardParams }>,
  reply: FastifyReply,
) => {
  const { id } = request.params;
  const user = request.user as { id: number; username: string };

  try {
    const authorIdCheck = await prisma.card.findUnique({
      where: { id: id },
      select: { id: true, deck: { select: { authorId: true } } },
    });

    if (authorIdCheck === null || authorIdCheck.deck.authorId !== user.id) {
      return reply.code(403).send({ error: "you can't delete this card" });
    }

    await prisma.card.delete({ where: { id: id } });
    return reply.code(204).send();
  } catch (error) {
    request.log.error(error);
    return reply
      .code(500)
      .send({ error: `failed to delete card with id: ${id}` });
  }
};

export const getCard = async (
  request: FastifyRequest<{ Params: GetCardParams }>,
  reply: FastifyReply,
) => {
  const { id } = request.params;

  try {
    const card = await prisma.card.findUnique({ where: { id: id } });
    if (!card) return reply.code(404).send({ error: "card not found" });
    return reply.code(200).send(card);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: `failed to get card with id: ${id}` });
  }
};

export const updateCard = async (
  request: FastifyRequest<{ Params: UpdateCardParams; Body: UpdateCardBody }>,
  reply: FastifyReply,
) => {
  const { id } = request.params;
  const { original, translation, description } = request.body;
  const user = request.user as { id: number; username: string };

  try {
    const authorIdCheck = await prisma.card.findUnique({
      where: { id: id },
      select: { id: true, deck: { select: { authorId: true } } },
    });

    if (authorIdCheck === null || authorIdCheck.deck.authorId !== user.id) {
      return reply.code(403).send({ error: "you can't change this card" });
    }

    const updatedCard = await prisma.card.update({
      where: { id: id },
      data: { original, translation, description },
    });

    return reply.code(200).send(updatedCard);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: `failed to update card ${id}` });
  }
};

export const reviewCard = async (
  request: FastifyRequest<{ Params: PostCardParams; Body: ReviewCardBody }>,
  reply: FastifyReply,
) => {
  const { id: cardId } = request.params;
  const { grade } = request.body;
  const user = request.user as { id: number; username: string };

  try {
    const currentProgress = await prisma.cardProgress.findUnique({
      where: { userId_cardId: { userId: user.id, cardId: cardId } },
    });

    const oldRepetitions = currentProgress?.repetitions || 0;
    const oldInterval = currentProgress?.interval || 0;
    const oldEase = currentProgress?.easeFactor || 2.5;

    const { newRepetitions, newInterval, newEase, newNextReviewDate } =
      calculateReview(grade, oldRepetitions, oldInterval, oldEase);

    const updatedProgress = await prisma.cardProgress.upsert({
      where: { userId_cardId: { userId: user.id, cardId: cardId } },
      update: {
        repetitions: newRepetitions,
        interval: newInterval,
        easeFactor: newEase,
        nextReviewDate: newNextReviewDate,
      },
      create: {
        userId: user.id,
        cardId: cardId,
        repetitions: newRepetitions,
        interval: newInterval,
        easeFactor: newEase,
        nextReviewDate: newNextReviewDate,
      },
    });

    return reply.code(200).send(updatedProgress);
  } catch (error) {
    request.log.error(error);
    return reply
      .code(500)
      .send({ error: "couldnt update card progress data " });
  }
};

export const getCardsToStudy = async (
  request: FastifyRequest<{ Params: StudyParams; Querystring: StudyQuery }>,
  reply: FastifyReply,
) => {
  const { deckId } = request.params;
  const { limit } = request.query;
  const user = request.user as { id: number; username: string };

  try {
    const cardsToStudy = await prisma.card.findMany({
      where: {
        deckId: deckId,
        OR: [
          {
            progresses: {
              some: { userId: user.id, nextReviewDate: { lte: new Date() } },
            },
          },
          { progresses: { none: { userId: user.id } } },
        ],
      },
      take: limit,
      include: {
        progresses: { where: { userId: user.id } },
      },
    });
    return reply.code(200).send(cardsToStudy);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: "failed to fetch study session" });
  }
};
