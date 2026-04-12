import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import "dotenv/config";

import type {
  CreateUserBody,
  DeleteUserParams,
  LoginBody,
} from "../schemas/user.schemas";

export const createDevAdmin = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("admin", saltRounds);
    const newAdmin = await prisma.user.create({
      data: { username: "admin", password: hashedPassword, role: "ADMIN" },
    });
    return reply.code(201).send(newAdmin);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: "couldn't create admin" });
  }
};

export const getAllUsers = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const users = await prisma.user.findMany();
    return reply.code(200).send(users);
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
      data: { username, password: hashedPassword },
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
