import type { FastifyRequest, FastifyReply } from "fastify";
import type { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import "dotenv/config";

import type {
  CreateUserBody,
  DeleteUserParams,
  GetAllUsersQuery,
  LoginBody,
  UpdateUserBody,
  UpdateUserParams,
  UpdateUserSettingsBody,
} from "../schemas/user.schemas";

export const createDevAdmin = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("admin", saltRounds);
    const newAdmin = await prisma.user.create({
      data: {
        username: "admin",
        password: hashedPassword,
        role: "ADMIN",
        settings: {},
      },
    });
    return reply.code(201).send(newAdmin);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: "couldn't create admin" });
  }
};

export const updateUserRole = async (
  request: FastifyRequest<{
    Body: UpdateUserBody;
    Params: UpdateUserParams;
  }>,
  reply: FastifyReply,
) => {
  const { role } = request.body;
  const { id: userId } = request.params;

  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: role,
      },
    });
    return reply.code(200).send(updatedUser);
  } catch (error) {
    request.log.error(error);
    return reply
      .code(500)
      .send({ error: `couldn't update user with id: ${userId}` });
  }
};

export const getAllUsers = async (
  request: FastifyRequest<{ Querystring: GetAllUsersQuery }>,
  reply: FastifyReply,
) => {
  const { page, limit, username, userId } = request.query;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {
    AND: [
      ...(userId ? [{ id: userId }] : []),
      ...(username
        ? [
            {
              username: {
                contains: username,
              },
            },
          ]
        : []),
    ],
  };
  try {
    const [users, totalUsers] = await prisma.$transaction([
      prisma.user.findMany({
        where: where,
        skip: skip,
        take: limit,
        orderBy: { id: "asc" },
      }),
      prisma.user.count({
        where: where,
      }),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    return reply.code(200).send({
      data: users,
      meta: {
        totalRecords: totalUsers,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: "couldn't fetch users" });
  }
};

export const registerUser = async (
  request: FastifyRequest<{ Body: CreateUserBody }>,
  reply: FastifyReply,
) => {
  const { username, password } = request.body;
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  try {
    const newUser = await prisma.user.create({
      data: { username, password: hashedPassword, settings: {} },
    });
    const { password: _, ...userWithoutPassword } = newUser;
    return reply.code(201).send(userWithoutPassword);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: "failed to create user" });
  }
};

export const deleteUser = async (
  request: FastifyRequest<{ Params: DeleteUserParams }>,
  reply: FastifyReply,
) => {
  const { id } = request.params;
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user === null) {
      return reply.code(404).send({ message: "this user does not exist" });
    }
    if (user.role === "ADMIN") {
      return reply
        .code(403)
        .send({ message: "ADMIN users can not be deleted" });
    }
    await prisma.user.delete({ where: { id } });
    return reply.code(204).send({ message: "deleted user successfully" });
  } catch (error) {
    request.log.error(error);
    return reply
      .code(500)
      .send({ error: `failed to delete user with id: ${id}` });
  }
};

export const login = async (
  request: FastifyRequest<{ Body: LoginBody }>,
  reply: FastifyReply,
) => {
  const { username, password } = request.body;

  try {
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return reply.code(401).send({ error: "invalid username or password" });
    }

    const token = request.server.jwt.sign({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    return reply
      .code(200)
      .setCookie("token", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
      })
      .send({
        message: "login successful",
        user: { id: user.id, username: user.username, role: user.role },
      });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: "login process failed" });
  }
};

export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
  return reply
    .clearCookie("token", { path: "/" })
    .code(200)
    .send({ message: "logged out successfully" });
};

export const getMe = async (request: FastifyRequest, reply: FastifyReply) => {
  return reply.code(200).send({ user: request.user });
};

export const updateUserSettings = async (
  request: FastifyRequest<{ Body: UpdateUserSettingsBody }>,
  reply: FastifyReply,
) => {
  const { uiLang, theme } = request.body;
  const user = request.user;

  try {
    const updatedUserSettings = await prisma.userSettings.update({
      where: { userId: user.id },
      data: {
        uiLang: uiLang,
        theme: theme,
      },
    });

    return reply.code(200).send(updatedUserSettings);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: "failed to update user settings" });
  }
};

export const getUserSettings = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const user = request.user;

  try {
    const userSettings = await prisma.userSettings.findFirst({
      where: { userId: user.id },
    });
    return reply.code(200).send(userSettings);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: "failed to fetch user settings" });
  }
};
