import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import type { FastifyRequest, FastifyReply } from "fastify";

export default fp(async (fastify) => {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    console.error("no jwt secret key");
    process.exit(1);
  }

  fastify.register(fastifyCookie);
  fastify.register(fastifyJwt, {
    secret: jwtSecret,
    cookie: {
      cookieName: "token",
      signed: false,
    },
  });

  fastify.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (error) {
      return reply.code(401).send({ error: "unauthorized" });
    }
  });

  fastify.decorate("requireAdmin", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (error) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    if (request.user.role !== "ADMIN") {
      return reply.code(403).send({ error: "forbidden" });
    }
  });
});
