// Recreates the disposable integration-test database and applies every
// migration. Refuses unless the target is a LOCAL host AND the database name
// ends in "_it" — it can never touch the development or production database.
//
//   pnpm test:integration   (runs this, then the integration suite)

import "dotenv/config";

import { execSync } from "node:child_process";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../src/generated/prisma/client";

import { classifyTarget } from "../../src/server/import/wc2026/target";
import { integrationDatabaseUrl } from "./integrationDb";

async function main() {
  const itUrl = integrationDatabaseUrl();
  const target = classifyTarget(itUrl);
  const url = new URL(itUrl);
  const database = url.pathname.replace(/^\//, "");
  if (target.kind !== "LOCAL" || !database.endsWith("_it") || !/^[a-z0-9_]+$/.test(database)) {
    throw new Error(`Refusing: integration DB must be LOCAL and named *_it (got ${target.redacted}).`);
  }
  const admin = new URL(itUrl);
  admin.pathname = "/postgres";
  // Database name is validated above (^[a-z0-9_]+_it$), so interpolation is safe.
  const client = new PrismaClient({ adapter: new PrismaPg(admin.toString()) });
  try {
    await client.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`);
    await client.$executeRawUnsafe(`CREATE DATABASE "${database}"`);
  } finally {
    await client.$disconnect();
  }
  execSync("npx prisma migrate deploy", { stdio: "inherit", env: { ...process.env, DATABASE_URL: itUrl } });
  console.log(`Integration database ready: ${target.redacted}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
