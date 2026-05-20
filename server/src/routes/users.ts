import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import "dotenv/config";
import {
  createUserSchema,
  deleteUserParamsSchema,
  getAllUsersQuerySchema,
  loginSchema,
  updateUserParamsSchema,
  updateUserSchema,
  updateUserSettingsSchema,
} from "../schemas/user.schemas";
import type {
  CreateUserBody,
  DeleteUserParams,
  GetAllUsersQuery,
  LoginBody,
  UpdateUserBody,
  UpdateUserParams,
  UpdateUserSettingsBody,
} from "../schemas/user.schemas";
import {
  createDevAdmin,
  getAllUsers,
  registerUser,
  deleteUser,
  login,
  logout,
  getMe,
  updateUserRole,
  updateUserSettings,
  getUserSettings,
} from "../controllers/users";

const userRoutes: FastifyPluginAsyncZod = async (fastify, options) => {
  if (process.env.NODE_ENV === "dev") {
    fastify.post("/devc", createDevAdmin);
  }

  fastify.get<{ Querystring: GetAllUsersQuery }>(
    "/",
    {
      preHandler: [fastify.requireAdmin],
      schema: { querystring: getAllUsersQuerySchema },
    },
    getAllUsers,
  );

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

  fastify.post("/logout", { preHandler: [fastify.authenticate] }, logout);

  fastify.get("/me", { preHandler: [fastify.authenticate] }, getMe);

  fastify.patch<{ Body: UpdateUserBody; Params: UpdateUserParams }>(
    "/:id",
    {
      preHandler: [fastify.requireAdmin],
      schema: { body: updateUserSchema, params: updateUserParamsSchema },
    },
    updateUserRole,
  );

  fastify.patch<{ Body: UpdateUserSettingsBody }>(
    "/settings",
    {
      preHandler: [fastify.authenticate],
      schema: { body: updateUserSettingsSchema },
    },
    updateUserSettings,
  );

  fastify.get(
    "/settings",
    { preHandler: [fastify.authenticate] },
    getUserSettings,
  );
};

export default userRoutes;
