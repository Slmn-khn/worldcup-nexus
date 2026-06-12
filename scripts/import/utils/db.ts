// Prisma client factory for import/verify scripts. Mirrors the Prisma 7
// driver-adapter setup in src/server/db/prisma.ts, but uses relative imports
// so the scripts run under tsx without path-alias resolution.

import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../src/generated/prisma/client";

export function createScriptPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and start the local database (docker compose up -d).",
    );
  }
  const adapter = new PrismaPg(url);
  return new PrismaClient({ adapter, log: ["error"] });
}

export type ScriptPrismaClient = ReturnType<typeof createScriptPrismaClient>;
