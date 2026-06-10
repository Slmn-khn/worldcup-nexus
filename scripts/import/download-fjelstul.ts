// Downloads the selected Fjelstul World Cup Database CSV files into the
// local cache (data/sources/fjelstul/raw). Acquisition only — this script
// never writes to the database.
// Source: jfjelstul/worldcup (GitHub), CC-BY-SA 4.0 — see docs/DATA_SOURCES.md.
//
// Usage:
//   pnpm data:download           # skips files already in the cache
//   pnpm data:download --force   # re-downloads everything

import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  FJELSTUL_DATASETS,
  FJELSTUL_RAW_DIR,
  FJELSTUL_REPORTS_DIR,
  FJELSTUL_SOURCE_NAME,
} from "../../src/server/import/source-manifest";

const force = process.argv.includes("--force");

type Outcome = "downloaded" | "skipped" | "failed";

async function fileExists(filePath: string): Promise<boolean> {
  try {
    const info = await stat(filePath);
    return info.isFile() && info.size > 0;
  } catch {
    return false;
  }
}

async function download(url: string, destination: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  const body = Buffer.from(await response.arrayBuffer());
  await writeFile(destination, body);
}

async function main() {
  console.log(`Downloading source files: ${FJELSTUL_SOURCE_NAME}`);
  console.log(`Cache folder: ${FJELSTUL_RAW_DIR}\n`);

  await mkdir(path.resolve(FJELSTUL_RAW_DIR), { recursive: true });
  await mkdir(path.resolve(FJELSTUL_REPORTS_DIR), { recursive: true });

  const results: {
    key: string;
    required: boolean;
    outcome: Outcome;
    detail?: string;
  }[] = [];

  for (const dataset of FJELSTUL_DATASETS) {
    const destination = path.resolve(dataset.localPath);

    if (!force && (await fileExists(destination))) {
      results.push({
        key: dataset.key,
        required: dataset.required,
        outcome: "skipped",
      });
      console.log(`  skipped     ${dataset.filename} (already cached)`);
      continue;
    }

    try {
      await download(dataset.url, destination);
      results.push({
        key: dataset.key,
        required: dataset.required,
        outcome: "downloaded",
      });
      console.log(`  downloaded  ${dataset.filename}`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      results.push({
        key: dataset.key,
        required: dataset.required,
        outcome: "failed",
        detail,
      });
      console.error(`  FAILED      ${dataset.filename} — ${detail}`);
    }
  }

  const downloaded = results.filter((r) => r.outcome === "downloaded");
  const skipped = results.filter((r) => r.outcome === "skipped");
  const failed = results.filter((r) => r.outcome === "failed");

  console.log("\nSummary");
  console.log(`  downloaded: ${downloaded.length}`);
  console.log(`  skipped:    ${skipped.length}`);
  console.log(`  failed:     ${failed.length}`);

  const requiredFailures = failed.filter((r) => r.required);
  if (requiredFailures.length > 0) {
    console.error(
      `\nRequired files failed to download: ${requiredFailures.map((r) => r.key).join(", ")}`,
    );
    process.exitCode = 1;
    return;
  }

  console.log("\nDone. Next step: pnpm data:inspect");
}

main().catch((error) => {
  console.error("Download run failed:", error);
  process.exitCode = 1;
});
