import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma";

// Import your inferred types from your schema file!
import type {
  PaginationQuery,
  GetDeckParams,
  GetDeckCardsParams,
  FavoriteDeckParams,
  CreateDeckBody,
  DeleteDeckParams,
} from "../schemas/decks.schemas";

export const getAllDecks = async (
  request: FastifyRequest<{ Querystring: PaginationQuery }>,
  reply: FastifyReply,
) => {
  const { page, limit } = request.query;
  const userId = request.user.id;
  const skip = (page - 1) * limit;

  try {
    const [decks, totalDecks] = await prisma.$transaction([
      prisma.deck.findMany({
        where: { NOT: { favoritedBy: { some: { id: userId } } } },
        skip: skip,
        take: limit,
        orderBy: { id: "asc" },
      }),
      prisma.deck.count({
        where: { NOT: { favoritedBy: { some: { id: userId } } } },
      }),
    ]);

    const totalPages = Math.ceil(totalDecks / limit);

    return reply.code(200).send({
      data: decks,
      meta: {
        totalRecords: totalDecks,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: "failed to fetch decks" });
  }
};

export const getFavoriteDecks = async (
  request: FastifyRequest<{ Querystring: PaginationQuery }>,
  reply: FastifyReply,
) => {
  const userId = request.user.id;
  const { page, limit } = request.query;
  const skip = (page - 1) * limit;

  try {
    const [decks, totalDecks] = await prisma.$transaction([
      prisma.deck.findMany({
        where: { favoritedBy: { some: { id: userId } } },
        skip: skip,
        take: limit,
        orderBy: { id: "asc" },
      }),
      prisma.deck.count({
        where: { favoritedBy: { some: { id: userId } } },
      }),
    ]);

    const totalPages = Math.ceil(totalDecks / limit);

    return reply.code(200).send({
      data: decks,
      meta: {
        totalRecords: totalDecks,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: "failed to fetch favorite decks" });
  }
};

export const getDeckCards = async (
  request: FastifyRequest<{
    Params: GetDeckCardsParams;
    Querystring: PaginationQuery;
  }>,
  reply: FastifyReply,
) => {
  const { id } = request.params;
  const { page, limit } = request.query;
  const skip = (page - 1) * limit;

  try {
    const [cards, totalCards] = await prisma.$transaction([
      prisma.card.findMany({
        where: { deckId: id },
        skip: skip,
        take: limit,
        orderBy: { id: "desc" },
      }),
      prisma.card.count({ where: { deckId: id } }),
    ]);

    const totalPages = Math.ceil(totalCards / limit);

    return reply.code(200).send({
      data: cards,
      meta: {
        totalRecords: totalCards,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      error: `failed to fetch cards belonging to the deck with id: ${id}`,
    });
  }
};

export const getDeck = async (
  request: FastifyRequest<{ Params: GetDeckParams }>,
  reply: FastifyReply,
) => {
  const { id } = request.params;

  try {
    const deck = await prisma.deck.findUnique({ where: { id } });
    if (!deck) return reply.code(404).send({ error: "deck not found" });
    return reply.code(200).send(deck);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: `couldn't fetch deck ${id}`});
  }
};

export const createDeck = async (
  request: FastifyRequest<{ Body: CreateDeckBody }>,
  reply: FastifyReply,
) => {
  const { name } = request.body;
  const user = request.user as { id: number; username: string };

  try {
    const newDeck = await prisma.deck.create({
      data: {
        name,
        authorId: user.id,
        favoritedBy: { connect: { id: user.id } },
      },
    });
    return reply.code(201).send(newDeck);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: "failed to create deck" });
  }
};

export const favoriteDeck = async (
  request: FastifyRequest<{ Params: FavoriteDeckParams }>,
  reply: FastifyReply,
) => {
  const userId = request.user.id;
  const { id: deckId } = request.params;

  try {
    const favoritedDeck = await prisma.user.update({
      where: { id: userId },
      data: { favoritedDecks: { connect: { id: deckId } } },
    });
    return reply.code(200).send(favoritedDeck);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: "failed to favorite deck" });
  }
};

export const unfavoriteDeck = async (
  request: FastifyRequest<{ Params: FavoriteDeckParams }>,
  reply: FastifyReply,
) => {
  const userId = request.user.id;
  const { id: deckId } = request.params;

  try {
    const unfavoritedDeck = await prisma.user.update({
      where: { id: userId },
      data: { favoritedDecks: { disconnect: { id: deckId } } },
    });
    return reply.code(200).send(unfavoritedDeck);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: "failed to unfavorite deck" });
  }
};

export const deleteDeck = async (
  request: FastifyRequest<{ Params: DeleteDeckParams }>,
  reply: FastifyReply,
) => {
  const user = request.user;
  const { id: deckId } = request.params;
  //custom auth check
  try {
    if (user.role !== "ADMIN") {
      const authorIdCheck = await prisma.deck.findUnique({
        where: { id: deckId },
        select: { id: true, authorId: true },
      });

      if (authorIdCheck === null || authorIdCheck.authorId !== user.id) {
        return reply.code(403).send({ error: "you can't delete this deck" });
      }
    }
    await prisma.deck.delete({ where: { id: deckId } });
    return reply.code(204).send();
  } catch (error) {
    request.log.error(error);
    return reply
      .code(500)
      .send({ error: `failed to delete deck with id: ${deckId}` });
  }
};
