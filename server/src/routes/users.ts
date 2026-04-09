import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import "dotenv/config";

const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20),
  password: z.string().min(6, "Password must be at least 6 characters").max(25),
});

const deleteUserParamsSchema = z.object({
  id: z.coerce.number().int().positive("userId must be a positive number"),
});

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const routes: FastifyPluginAsyncZod = async (fastify, options) => {
  if (process.env.NODE_ENV === "dev") {
    fastify.post("/devc", async (request, reply) => {
      console.log("devc hit\n\n\n\n\n\n");
      try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash("admin", saltRounds);
        const newAdmin = await prisma.user.create({
          data: {
            username: "admin",
            password: hashedPassword,
            role: "ADMIN",
          },
        });

        return reply.code(201).send(newAdmin);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "couldnt' create" });
      }
    });
  }
  fastify.get(
    "/",
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      try {
        const users = await prisma.user.findMany();

        return reply.code(200).send(users);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "couldn't fetch users" });
      }
    },
  );
  fastify.post(
    "/",
    {
      schema: {
        body: createUserSchema,
      },
    },
    async (request, reply) => {
      const { username, password } = request.body;

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      try {
        const newUser = await prisma.user.create({
          data: {
            username: username,
            password: hashedPassword,
          },
        });

        const { password: _, ...userWithoutPassword } = newUser;

        return reply.code(201).send(userWithoutPassword);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "failed to create user" });
      }
    },
  );
  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.requireAdmin],
      schema: { params: deleteUserParamsSchema },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        await prisma.user.delete({
          where: {
            id: id,
          },
        });

        return reply.code(204);
      } catch (error) {
        fastify.log.error(error);
        return reply
          .code(500)
          .send({ error: `failed to delete user with id: ${id}` });
      }
    },
  );
  fastify.post(
    "/login",
    { schema: { body: loginSchema } },
    async (request, reply) => {
      const { username, password } = request.body;

      try {
        const user = await prisma.user.findUnique({
          where: { username: username },
        });

        if (!user) {
          return reply
            .code(401)
            .send({ error: "invalid username or password" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
          return reply
            .code(401)
            .send({ error: "invalid username or password" });
        }

        const token = fastify.jwt.sign({
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
        fastify.log.error(error);
        return reply.code(500).send({ error: "login process failed" });
      }
    },
  );
  fastify.post("/logout", async (request, reply) => {
    return reply
      .clearCookie("token", { path: "/" })
      .code(200)
      .send({ message: "logged out successfully" });
  });
  fastify.get(
    "/me",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      return reply.code(200).send({ user: request.user });
    },
  );
};

export default routes;
