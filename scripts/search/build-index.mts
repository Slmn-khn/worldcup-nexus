// Builds the Meilisearch index from normalized database tables.
// Source of truth is PostgreSQL — RawSourceRecord is never indexed.
// ESM (.mts) because meilisearch v0.58 is an ESM-only package.
//
// Usage: pnpm search:index

import "dotenv/config";

import { prisma } from "@/server/db/prisma";
import {
  getSearchClient,
  SEARCH_INDEX_UID,
  SEARCH_INDEX_SETTINGS,
} from "@/server/search/client";
import { buildAllSearchDocuments } from "@/server/search/documents";
import type { Meilisearch } from "meilisearch";

const BATCH_SIZE = 2000;

async function waitOk(
  client: Meilisearch,
  enqueued: { taskUid: number },
  label: string,
): Promise<void> {
  const task = await client.tasks.waitForTask(enqueued.taskUid, {
    timeout: 120_000,
  });
  if (task.status !== "succeeded") {
    throw new Error(`${label} failed: ${task.error?.message ?? task.status}`);
  }
  console.log(`  ${label}: task ${enqueued.taskUid} ${task.status}`);
}

async function main() {
  console.log("WORLDCUP Nexus — building search index\n");

  const client = getSearchClient();
  await client.health();

  console.log("Building documents from normalized tables...");
  const documents = await buildAllSearchDocuments();
  const countsByType = new Map<string, number>();
  for (const document of documents) {
    countsByType.set(document.type, (countsByType.get(document.type) ?? 0) + 1);
  }
  for (const [type, count] of [...countsByType.entries()].sort()) {
    console.log(`  ${type.padEnd(12)} ${count}`);
  }
  console.log(`  total        ${documents.length}\n`);

  console.log(`Updating index "${SEARCH_INDEX_UID}"...`);
  const index = client.index(SEARCH_INDEX_UID);

  // Settings update auto-creates the index ("id" is inferred as primary key
  // from the documents). Existing settings are replaced.
  await waitOk(
    client,
    await index.updateSettings(SEARCH_INDEX_SETTINGS),
    "settings",
  );

  // Full rebuild: clear stale documents, then add fresh ones.
  await waitOk(client, await index.deleteAllDocuments(), "clear documents");
  const batchTasks = await index.addDocumentsInBatches(documents, BATCH_SIZE);
  for (const [batchIndex, taskPromise] of batchTasks.entries()) {
    await waitOk(
      client,
      await taskPromise,
      `add batch ${batchIndex + 1}/${batchTasks.length}`,
    );
  }

  const stats = await index.getStats();
  console.log(`\nIndex ready: ${stats.numberOfDocuments} documents.`);
  console.log("Next: pnpm search:verify");
}

main()
  .catch((error) => {
    console.error(
      "\nIndexing failed:",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
