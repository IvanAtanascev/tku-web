import { z } from "zod";

export const createDeckSchema = z.object({
  name: z.string().min(1).max(40),
});

export const getDeckCardsParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const getDeckParamsSchema = getDeckCardsParamsSchema;

export const favoriteDeckParamsSchema = getDeckParamsSchema;

export const deleteDeckParamsSchema = getDeckParamsSchema;

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const deckSearchQuerySchema = paginationQuerySchema.extend({
  query: z.string().min(1).max(40).optional(),
  favorite: z.preprocess((val) => {
    if (typeof val === "boolean") return val;
    if (val === "true") return true;
    if (val === "false") return false;
    throw new Error("The string must be 'true' or 'false'");
  }, z.boolean()),
});

export const deckCardsSearchQuerySchema = paginationQuerySchema.extend({
  queryOriginal: z.string().min(1).max(80).optional(),
  queryTranslation: z.string().min(1).max(80).optional(),
  queryDescription: z.string().min(1).max(200).optional(),
});

export type CreateDeckBody = z.infer<typeof createDeckSchema>;
export type GetDeckCardsParams = z.infer<typeof getDeckCardsParamsSchema>;
export type GetDeckParams = z.infer<typeof getDeckParamsSchema>;
export type FavoriteDeckParams = z.infer<typeof favoriteDeckParamsSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type DeleteDeckParams = z.infer<typeof deleteDeckParamsSchema>;
export type DeckSearchQuery = z.infer<typeof deckSearchQuerySchema>;
export type DeckCardsSearchQuery = z.infer<typeof deckCardsSearchQuerySchema>;
