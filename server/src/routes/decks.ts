import { prisma } from "../lib/prisma";
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

const createDeckSchema = z.object({
  name: z.string().min(3).max(40),
});

const getDeckCardsParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const getDeckParamsSchema = getDeckCardsParamsSchema;

const favoriteDeckParamsSchema = getDeckParamsSchema;

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

const routes: FastifyPluginAsyncZod = async (fastify, options) => {
  fastify.get(
    "/",
    {
      preHandler: [fastify.authenticate],
      schema: { querystring: paginationQuerySchema },
    },
    async (request, reply) => {
      const { page, limit } = request.query;

      const skip = (page - 1) * limit;

      try {
        const [decks, totalDecks] = await prisma.$transaction([
          prisma.deck.findMany({
            skip: skip,
            take: limit,
            orderBy: { id: "asc" },
          }),
          prisma.deck.count(),
        ]);
        const totalPages = Math.ceil(totalDecks / limit);

        return reply.code(200).send({
          data: decks,
          meta: {
            totalRecords: totalDecks,
            totalPages: totalPages,
            currentPage: page,
            limit: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "failed to fetch decks" });
      }
    },
  );
  fastify.get(
    "/favorites",
    {
      preHandler: [fastify.authenticate],
      schema: { querystring: paginationQuerySchema },
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { page, limit } = request.query;

      const skip = (page - 1) * limit;

      try {
        const [decks, totalDecks] = await prisma.$transaction([
          prisma.deck.findMany({
            where: {
              favoritedBy: {
                some: {
                  id: userId,
                },
              },
            },
            skip: skip,
            take: limit,
            orderBy: { id: "asc" },
          }),
          prisma.deck.count({
            where: {
              favoritedBy: {
                some: {
                  id: userId,
                },
              },
            },
          }),
        ]);

        const totalPages = Math.ceil(totalDecks / limit);

        return reply.code(200).send({
          data: decks,
          meta: {
            totalRecords: totalDecks,
            totalPages: totalPages,
            currentPage: page,
            limit: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply
          .code(500)
          .send({ error: "failed to fetch favorite decks" });
      }
    },
  );
  fastify.get(
    "/:id/cards",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: getDeckCardsParamsSchema,
        querystring: paginationQuerySchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { page, limit } = request.query;

      const skip = (page - 1) * limit;

      try {
        const [cards, totalCards] = await prisma.$transaction([
          prisma.card.findMany({
            where: {
              deckId: id,
            },
            skip: skip,
            take: limit,
            orderBy: { id: "desc" },
          }),
          prisma.card.count({
            where: { deckId: id },
          }),
        ]);

        const totalPages = Math.ceil(totalCards / limit);

        return reply.code(200).send({
          data: cards,
          meta: {
            totalRecords: totalCards,
            totalPages: totalPages,
            currentPage: page,
            limit: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          error: `failed to fetch cards belonging to the deck with id: ${id}`,
        });
      }
    },
  );
  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: { params: getDeckParamsSchema },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        const deck = await prisma.deck.findUnique({
          where: {
            id: id,
          },
        });

        if (!deck) {
          return reply.code(404).send({ error: "deck not found" });
        }

        return reply.code(200).send(deck);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({});
      }
    },
  );
  fastify.post(
    "/",
    { preHandler: [fastify.authenticate], schema: { body: createDeckSchema } },
    async (request, reply) => {
      const { name } = request.body;
      const user = request.user as { id: number; username: string };

      try {
        const newDeck = await prisma.deck.create({
          data: {
            name: name,
            authorId: user.id,
            favoritedBy: {
              connect: {
                id: user.id,
              },
            },
          },
        });

        return reply.code(201).send(newDeck);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "failed to create deck" });
      }
    },
  );
  fastify.post(
    "/favorite/:id",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: favoriteDeckParamsSchema,
      },
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { id: deckId } = request.params;

      try {
        const favoriteDeck = await prisma.user.update({
          where: { id: userId },
          data: {
            favoritedDecks: {
              connect: {
                id: deckId
              }
            }
          }
        })

        return reply.code(200).send(favoriteDeck)
      } catch(error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: "failed to favorite deck" })
      }
    },
  );
};

export default routes;
