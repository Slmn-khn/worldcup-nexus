// Search verification (Checkpoint 6A) — runs common queries against the
// Meilisearch index through the same service the app uses.
// ESM (.mts) because meilisearch v0.58 is an ESM-only package.
//
// Usage: pnpm search:verify

import "dotenv/config";

import { searchWorldCupAtlas } from "@/server/search/search";

const EXPECTED_QUERIES = ["maradona", "brazil", "1986", "argentina france"];

type Check = { query: string; passed: boolean; detail: string };

async function main() {
  console.log("WORLDCUP Nexus — search verification\n");

  const checks: Check[] = [];
  for (const query of EXPECTED_QUERIES) {
    const response = await searchWorldCupAtlas(query, { limit: 10 });
    const groupSummary = Object.entries(response.groups)
      .filter(([, items]) => items.length > 0)
      .map(([group, items]) => `${group} ${items.length}`)
      .join(", ");
    const top = Object.values(response.groups).flat()[0];
    checks.push({
      query,
      passed: response.total > 0,
      detail:
        response.total > 0
          ? `${response.total} results (${groupSummary}); top: ${top?.title ?? "?"}`
          : "no results",
    });
  }

  console.log("Checks");
  let failures = 0;
  for (const { query, passed, detail } of checks) {
    if (!passed) failures += 1;
    console.log(`  [${passed ? "PASS" : "FAIL"}] "${query}" — ${detail}`);
  }

  if (failures > 0) {
    console.error(
      `\n${failures} expected search(es) returned no results. ` +
        "If the index is empty, run: pnpm search:index",
    );
    process.exitCode = 1;
  } else {
    console.log("\nAll search checks passed.");
  }
}

main().catch((error) => {
  console.error(
    "\nSearch verification could not run:",
    error instanceof Error ? error.message : error,
  );
  console.error("Run: docker compose up -d  and  pnpm search:index");
  process.exitCode = 1;
});
