import { z } from "zod";

export const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20),
  password: z.string().min(6, "Password must be at least 6 characters").max(25),
});

export const deleteUserParamsSchema = z.object({
  id: z.coerce.number().int().positive("userId must be a positive number"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type CreateUserBody = z.infer<typeof createUserSchema>;
export type DeleteUserParams = z.infer<typeof deleteUserParamsSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
