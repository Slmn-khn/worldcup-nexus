// Deduplicates raw rows by a stable key, reporting skips through a callback.

import type { RawRow } from "./csv";

export function dedupeRows(
  dataset: string,
  rows: RawRow[],
  keyOf: (row: RawRow) => string | null,
  onSkip: (dataset: string, reason: string) => void,
): RawRow[] {
  const byKey = new Map<string, RawRow>();
  for (const row of rows) {
    const key = keyOf(row);
    if (key === null) {
      onSkip(dataset, "missing source identifier");
      continue;
    }
    if (byKey.has(key)) {
      onSkip(dataset, `duplicate source id ${key}`);
      continue;
    }
    byKey.set(key, row);
  }
  return [...byKey.values()];
}
