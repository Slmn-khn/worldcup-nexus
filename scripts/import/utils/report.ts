// Writes the import summary report (gitignored alongside other reports).

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { FJELSTUL_REPORTS_DIR } from "../../../src/server/import/source-manifest";

export type ImportSummary = {
  importedAt: string;
  source: string;
  counts: Record<string, number>;
  skippedByDataset: Record<string, number>;
  warnings: string[];
};

export async function writeImportSummary(
  summary: ImportSummary,
): Promise<string> {
  const reportPath = path.resolve(FJELSTUL_REPORTS_DIR, "import-summary.json");
  await mkdir(path.resolve(FJELSTUL_REPORTS_DIR), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  return reportPath;
}
