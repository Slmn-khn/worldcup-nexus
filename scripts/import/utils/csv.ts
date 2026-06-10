// CSV reading helpers for the Fjelstul import pipeline.
// Reads only from the local cache (data/sources/fjelstul/raw) — never downloads.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import type { FjelstulDataset } from "../../../src/server/import/source-manifest";

export type RawRow = Record<string, string>;

export class MissingColumnError extends Error {
  constructor(datasetKey: string, missing: string[]) {
    super(
      `Dataset "${datasetKey}" is missing required column(s): ${missing.join(", ")}. ` +
        `The source format may have changed — re-run pnpm data:download --force and pnpm data:inspect, ` +
        `then update the import mappers.`,
    );
    this.name = "MissingColumnError";
  }
}

/**
 * Reads and parses a cached dataset CSV. Throws with a clear message if the
 * file is missing (run `pnpm data:download`), if parsing fails, or if any
 * required column is absent.
 */
export function readDataset(
  dataset: FjelstulDataset,
  requiredColumns: string[],
): RawRow[] {
  const filePath = path.resolve(dataset.localPath);
  if (!existsSync(filePath)) {
    throw new Error(
      `Cached source file not found: ${dataset.localPath}. Run: pnpm data:download`,
    );
  }

  // csv-parse throws on malformed input; do not swallow parse errors.
  const rows = parse(readFileSync(filePath, "utf8"), {
    columns: true,
    bom: true,
    skip_empty_lines: true,
    trim: true,
  }) as RawRow[];

  if (rows.length === 0) {
    throw new Error(
      `Dataset "${dataset.key}" parsed to zero rows (${dataset.localPath}).`,
    );
  }

  const presentColumns = new Set(Object.keys(rows[0]));
  const missing = requiredColumns.filter(
    (column) => !presentColumns.has(column),
  );
  if (missing.length > 0) {
    throw new MissingColumnError(dataset.key, missing);
  }

  return rows;
}

export function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/** Runs `fn` over items with bounded concurrency, preserving completion of all items. */
export async function forEachLimit<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let next = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (next < items.length) {
        const index = next;
        next += 1;
        await fn(items[index]);
      }
    },
  );
  await Promise.all(workers);
}
