import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import "dotenv/config";
import {
  createUserSchema,
  deleteUserParamsSchema,
  loginSchema,
} from "../schemas/user.schemas";
import type {
  CreateUserBody,
  DeleteUserParams,
  LoginBody,
} from "../schemas/user.schemas";
import {
  createDevAdmin,
  getAllUsers,
  registerUser,
  deleteUser,
  login,
  logout,
  getMe,
} from "../controllers/users";

const userRoutes: FastifyPluginAsyncZod = async (fastify, options) => {
  if (process.env.NODE_ENV === "dev") {
    fastify.post("/devc", createDevAdmin);
  }

  fastify.get("/", { preHandler: [fastify.requireAdmin] }, getAllUsers);

  fastify.post<{ Body: CreateUserBody }>(
    "/",
    { schema: { body: createUserSchema } },
    registerUser,
  );

  fastify.delete<{ Params: DeleteUserParams }>(
    "/:id",
    {
      preHandler: [fastify.requireAdmin],
      schema: { params: deleteUserParamsSchema },
    },
    deleteUser,
  );

  fastify.post<{ Body: LoginBody }>(
    "/login",
    { schema: { body: loginSchema } },
    login,
  );

  fastify.post("/logout", logout);

  fastify.get("/me", { preHandler: [fastify.authenticate] }, getMe);
};

export default userRoutes;
