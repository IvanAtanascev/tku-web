import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import "dotenv/config";

declare global {
  var prisma: PrismaClient | undefined;
}

const dbPath = process.env.DATABASE_URL?.replace("file:", "") || "./dev.db";

const adapter = new PrismaBetterSqlite3({ url: dbPath });
export const prisma = globalThis.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;
