import Fastify from "fastify";
import cors from "@fastify/cors";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import "dotenv/config";

import authPlugin from "./plugins/auth";

import usersRoutes from "./routes/users";
import cardRoutes from "./routes/cards";
import deckRoutes from "./routes/decks";

const fastify = Fastify({
  logger: process.env.NODE_ENV === "production" ? false : true,
});

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

fastify.register(cors, {
  origin: process.env.NODE_ENV === "production" 
    ? process.env.CORS_DOMAIN 
    : "http://localost:5173",
  credentials: true,
});

fastify.register(authPlugin);

fastify.register(usersRoutes, { prefix: "/users" });
fastify.register(cardRoutes, { prefix: "/cards" });
fastify.register(deckRoutes, { prefix: "/decks" });

fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
