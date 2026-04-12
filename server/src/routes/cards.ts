import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import {
  createCardSchema,
  deleteCardParamsSchema,
  getCardParamsSchema,
  updateCardParamsSchema,
  updateCardBodySchema,
  postCardParamsSchema,
  reviewCardBodySchema,
  studyParamsSchema,
  studyQuerySchema,
} from "../schemas/card.schemas";

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

import {
  getAllCards,
  createCard,
  deleteCard,
  getCard,
  updateCard,
  reviewCard,
  getCardsToStudy,
} from "../controllers/cards";

const cardRoutes: FastifyPluginAsyncZod = async (fastify, options) => {
  fastify.get(
    "/",
    { preHandler: [fastify.authenticate, fastify.requireAdmin] },
    getAllCards,
  );

  fastify.post<{ Body: CreateCardBody }>(
    "/",
    {
      preHandler: [fastify.authenticate],
      schema: { body: createCardSchema },
    },
    createCard,
  );

  fastify.delete<{ Params: DeleteCardParams }>(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: { params: deleteCardParamsSchema },
    },
    deleteCard,
  );

  fastify.get<{ Params: GetCardParams }>(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: { params: getCardParamsSchema },
    },
    getCard,
  );

  fastify.patch<{ Params: UpdateCardParams; Body: UpdateCardBody }>(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: updateCardParamsSchema,
        body: updateCardBodySchema,
      },
    },
    updateCard,
  );

  fastify.post<{ Params: PostCardParams; Body: ReviewCardBody }>(
    "/:id/review",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: postCardParamsSchema,
        body: reviewCardBodySchema,
      },
    },
    reviewCard,
  );

  fastify.get<{ Params: StudyParams; Querystring: StudyQuery }>(
    "/:deckId/study",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: studyParamsSchema,
        querystring: studyQuerySchema,
      },
    },
    getCardsToStudy,
  );
};

export default cardRoutes;
