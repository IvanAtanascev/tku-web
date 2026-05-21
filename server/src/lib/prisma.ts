import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

declare global {
  var prisma: PrismaClient | undefined;
}

const dbPath = process.env.DATABASE_URL;

const adapter = new PrismaPg({ connectionString: dbPath });
export const prisma = globalThis.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;
