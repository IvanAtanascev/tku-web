import { z } from "zod";

export const createCardSchema = z.object({
  original: z.string().min(1),
  translation: z.string().min(1),
  description: z.string().min(1),
  deckId: z.coerce.number().int().positive("Deck ID must be a positive number"),
});

export const deleteCardParamsSchema = z.object({
  id: z.coerce.number().int().positive("Card ID must be a positive number"),
});

export const getCardParamsSchema = deleteCardParamsSchema;
export const postCardParamsSchema = deleteCardParamsSchema;
export const updateCardParamsSchema = deleteCardParamsSchema;

export const updateCardBodySchema = z.object({
  original: z.string().optional(),
  translation: z.string().optional(),
  description: z.string().optional(),
});

export const studyParamsSchema = z.object({
  deckId: z.coerce.number().int(),
});

export const studyQuerySchema = z.object({
  limit: z.coerce.number().int().positive().default(20),
});

export const reviewCardBodySchema = z.object({
  grade: z.enum(["hard", "normal", "good", "easy"]),
});

export type CreateCardBody = z.infer<typeof createCardSchema>;
export type DeleteCardParams = z.infer<typeof deleteCardParamsSchema>;
export type GetCardParams = z.infer<typeof getCardParamsSchema>;
export type PostCardParams = z.infer<typeof postCardParamsSchema>;
export type UpdateCardParams = z.infer<typeof updateCardParamsSchema>;
export type UpdateCardBody = z.infer<typeof updateCardBodySchema>;
export type StudyParams = z.infer<typeof studyParamsSchema>;
export type StudyQuery = z.infer<typeof studyQuerySchema>;
export type ReviewCardBody = z.infer<typeof reviewCardBodySchema>;
