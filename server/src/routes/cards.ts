import { prisma } from "../lib/prisma";
import { calculateReview } from "../lib/utils/spacedRepetition";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

const createCardSchema = z.object({
  original: z.string().min(1),
  translation: z.string().min(1),
  description: z.string().min(1),
  deckId: z.coerce.number().int().positive("Deck ID must be a positive number"),
});

const deleteCardParamsSchema = z.object({
  id: z.coerce.number().int().positive("Card ID must be a positive number"),
});

// separate it from delete card schema in case of future modifications
const getCardParamsSchema = deleteCardParamsSchema;
const postCardParamsSchema = deleteCardParamsSchema;

const updateCardParamsSchema = getCardParamsSchema;

const updateCardBodySchema = z.object({
  original: z.string().optional(),
  translation: z.string().optional(),
  description: z.string().optional(),
});

const studyParamsSchema = z.object({
  deckId: z.coerce.number().int(),
});

const studyQuerySchema = z.object({
  limit: z.coerce.number().int().positive().default(20),
});

const routes: FastifyPluginAsyncZod = async (fastify, options) => {
  fastify.get(
    "/",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const cards = await prisma.card.findMany();

        return reply.code(200).send(cards);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "failed to fetch cards" });
      }
    },
  );
  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: createCardSchema,
      },
    },

    async (request, reply) => {
      const { original, translation, description, deckId } = request.body;

      try {
        const newCard = await prisma.card.create({
          data: {
            original: original,
            translation: translation,
            description: description,
            deckId: deckId,
          },
        });

        return reply.code(201).send(newCard);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "failed to create card" });
      }
    },
  );
  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: { params: deleteCardParamsSchema },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        await prisma.card.delete({
          where: {
            id: id,
          },
        });

        return reply.code(204).send();
      } catch (error) {
        fastify.log.error(error);
        return reply
          .code(500)
          .send({ error: `failed to delete card with id: ${id}` });
      }
    },
  );
  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: { params: getCardParamsSchema },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        const card = await prisma.card.findUnique({
          where: {
            id: id,
          },
        });

        if (!card) {
          return reply.code(404).send({ error: "card not found" });
        }

        return reply.code(200).send(card);
      } catch (error) {
        fastify.log.error(error);
        return reply
          .code(500)
          .send({ error: `failed to get card with id: ${id}` });
      }
    },
  );
  fastify.patch(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: updateCardParamsSchema,
        body: updateCardBodySchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { original, translation, description } = request.body;

      try {
        const updatedCard = await prisma.card.update({
          where: { id: id },
          data: {
            original: original,
            translation: translation,
            description: description,
          },
        });

        return reply.code(200).send(updatedCard);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: `failed to update card ${id}` });
      }
    },
  );
  fastify.post(
    "/:id/review",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: postCardParamsSchema,
      },
    },
    async (request, reply) => {
      const { id: cardId } = request.params;
      const { grade } = request.body as {
        grade: "hard" | "normal" | "good" | "easy";
      };
      const user = request.user as { id: number; username: string };

      const currentProgress = await prisma.cardProgress.findUnique({
        where: { userId_cardId: { userId: user.id, cardId: cardId } },
      });

      const oldRepetitions = currentProgress?.repetitions || 0;
      const oldInterval = currentProgress?.interval || 0;
      const oldEase = currentProgress?.easeFactor || 2.5;

      const { newRepetitions, newInterval, newEase, newNextReviewDate } =
        calculateReview(grade, oldRepetitions, oldInterval, oldEase);

      try {
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
        fastify.log.error(error);
        return reply
          .code(500)
          .send({ error: "couldnt update card progress data " });
      }
    },
  );
  fastify.get(
    "/:deckId/study",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: studyParamsSchema,
        querystring: studyQuerySchema,
      },
    },
    async (request, reply) => {
      const { deckId } = request.params;
      const { limit } = request.query;
      const user = request.user;

      try {
        const cardsToStudy = await prisma.card.findMany({
          where: {
            deckId: deckId,
            OR: [
              {
                progresses: {
                  some: {
                    userId: user.id,
                    nextReviewDate: {
                      lte: new Date(),
                    },
                  },
                },
              },
              {
                progresses: {
                  none: {
                    userId: user.id,
                  },
                },
              },
            ],
          },
          take: limit,
          include: {
            progresses: {
              where: { userId: user.id },
            },
          },
        });
        return reply.code(200).send(cardsToStudy);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "failed to fetch study session" });
      }
    },
  );
};

export default routes;
