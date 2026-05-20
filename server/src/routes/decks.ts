// src/routes/decks.ts
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

// 1. Import your schemas and types
import {
  createDeckSchema,
  getDeckCardsParamsSchema,
  getDeckParamsSchema,
  favoriteDeckParamsSchema,
  paginationQuerySchema,
  deleteDeckParamsSchema,
  deckSearchQuerySchema,
  deckCardsSearchQuerySchema,
  importDeckSchema,
} from "../schemas/decks.schemas";

import type {
  CreateDeckBody,
  GetDeckCardsParams,
  GetDeckParams,
  FavoriteDeckParams,
  PaginationQuery,
  DeleteDeckParams,
  DeckSearchQuery,
  DeckCardsSearchQuery,
  ImportDeckBody,
} from "../schemas/decks.schemas";

import {
  getAllDecks,
  getFavoriteDecks,
  getDeckCards,
  getDeck,
  createDeck,
  favoriteDeck,
  unfavoriteDeck,
  deleteDeck,
  searchDeck,
  importCsv,
} from "../controllers/decks";
import parseCsvToDeck from "../lib/utils/csvImport";

const deckRoutes: FastifyPluginAsyncZod = async (fastify, options) => {
  fastify.get<{ Querystring: PaginationQuery }>(
    "/",
    {
      preHandler: [fastify.authenticate],
      schema: { querystring: paginationQuerySchema },
    },
    getAllDecks,
  );

  fastify.get<{
    Params: GetDeckCardsParams;
    Querystring: DeckCardsSearchQuery;
  }>(
    "/:id/cards",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: getDeckCardsParamsSchema,
        querystring: deckCardsSearchQuerySchema,
      },
    },
    getDeckCards,
  );

  fastify.get<{ Params: GetDeckParams }>(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: { params: getDeckParamsSchema },
    },
    getDeck,
  );

  fastify.post<{ Body: CreateDeckBody }>(
    "/",
    {
      preHandler: [fastify.authenticate],
      schema: { body: createDeckSchema },
    },
    createDeck,
  );

  fastify.post<{ Params: FavoriteDeckParams }>(
    "/favorite/:id",
    {
      preHandler: [fastify.authenticate],
      schema: { params: favoriteDeckParamsSchema },
    },
    favoriteDeck,
  );

  fastify.delete<{ Params: FavoriteDeckParams }>(
    "/favorite/:id",
    {
      preHandler: [fastify.authenticate],
      schema: { params: favoriteDeckParamsSchema },
    },
    unfavoriteDeck,
  );

  fastify.delete<{ Params: DeleteDeckParams }>(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: { params: deleteDeckParamsSchema },
    },
    deleteDeck,
  );

  fastify.get<{ Querystring: DeckSearchQuery }>(
    "/search",
    {
      preHandler: [fastify.authenticate],
      schema: { querystring: deckSearchQuerySchema },
    },
    searchDeck,
  );

  fastify.post<{ Body: ImportDeckBody }>(
    "/import",
    {
      preHandler: [fastify.authenticate],
      schema: { body: importDeckSchema },
    },
    importCsv,
  );
};

export default deckRoutes;
