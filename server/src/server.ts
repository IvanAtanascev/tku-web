import Fastify from "fastify";
import type { FastifyRequest, FastifyReply } from "fastify";
import usersRoutes from "./routes/users.ts";
import cardRoutes from "./routes/cards.ts";
import deckRoutes from "./routes/decks.ts";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import cors from "@fastify/cors";
import "@fastify/jwt";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      id: number;
      username: string;
      role: string;
    };
  }
}

declare module "fastify" {
  export interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
    requireAdmin: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}

const fastify = Fastify({
  logger: process.env.NODE_ENV === "production" ? false : true,
});

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error("no jwt secret key")
  process.exit(1)
}

fastify.register(cors, {
  origin:
    process.env.NODE_ENV == "production"
      ? process.env.CORS_DOMAIN
      : "http://localhost:5173",
});

fastify.register(fastifyCookie);

fastify.register(fastifyJwt, {
  secret: jwtSecret,
  cookie: {
    cookieName: "token",
    signed: false,
  },
});

fastify.decorate(
  "authenticate",
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (error) {
      return reply.code(401).send({ error: "unauthorized" });
    }
  },
);

fastify.decorate(
  "requireAdmin",
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (error) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    if (request.user.role !== "ADMIN") {
      return reply.code(403).send({ error: "forbidden" });
    }
  },
);

fastify;

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

fastify.register(usersRoutes, { prefix: "/users" });
fastify.register(cardRoutes, { prefix: "/cards" });
fastify.register(deckRoutes, { prefix: "/decks" });

fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
