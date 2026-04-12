// src/routes/decks.ts
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

// 1. Import your schemas and types
import {
  createDeckSchema,
  getDeckCardsParamsSchema,
  getDeckParamsSchema,
  favoriteDeckParamsSchema,
  paginationQuerySchema,
} from "../schemas/decks.schemas";

import type {
  CreateDeckBody,
  GetDeckCardsParams,
  GetDeckParams,
  FavoriteDeckParams,
  PaginationQuery,
} from "../schemas/decks.schemas";

// 2. Import your newly separated controllers
import {
  getAllDecks,
  getFavoriteDecks,
  getDeckCards,
  getDeck,
  createDeck,
  favoriteDeck,
  unfavoriteDeck
} from "../controllers/decks";

const deckRoutes: FastifyPluginAsyncZod = async (fastify, options) => {
  
  fastify.get<{ Querystring: PaginationQuery }>(
    "/",
    {
      preHandler: [fastify.authenticate],
      schema: { querystring: paginationQuerySchema },
    },
    getAllDecks
  );

  fastify.get<{ Querystring: PaginationQuery }>(
    "/favorites",
    {
      preHandler: [fastify.authenticate],
      schema: { querystring: paginationQuerySchema },
    },
    getFavoriteDecks
  );

  fastify.get<{ Params: GetDeckCardsParams; Querystring: PaginationQuery }>(
    "/:id/cards",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: getDeckCardsParamsSchema,
        querystring: paginationQuerySchema,
      },
    },
    getDeckCards
  );

  fastify.get<{ Params: GetDeckParams }>(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: { params: getDeckParamsSchema },
    },
    getDeck
  );

  fastify.post<{ Body: CreateDeckBody }>(
    "/",
    { 
      preHandler: [fastify.authenticate], 
      schema: { body: createDeckSchema } 
    },
    createDeck
  );

  fastify.post<{ Params: FavoriteDeckParams }>(
    "/favorite/:id",
    {
      preHandler: [fastify.authenticate],
      schema: { params: favoriteDeckParamsSchema },
    },
    favoriteDeck
  );

  fastify.delete<{ Params: FavoriteDeckParams }>(
    "/favorite/:id",
    {
      preHandler: [fastify.authenticate],
      schema: { params: favoriteDeckParamsSchema },
    },
    unfavoriteDeck
  );
};

export default deckRoutes;
