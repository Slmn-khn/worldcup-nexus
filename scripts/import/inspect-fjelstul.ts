// Inspects the headers of the cached Fjelstul World Cup Database CSV files
// and writes a JSON report to data/sources/fjelstul/reports/headers.json.
// Inspection only — this script never writes to the database.
// Source: jfjelstul/worldcup (GitHub), CC-BY-SA 4.0 — see docs/DATA_SOURCES.md.
//
// Usage:
//   pnpm data:inspect   (run pnpm data:download first)

import { mkdir, open, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";
import {
  FJELSTUL_DATASETS,
  FJELSTUL_REPORTS_DIR,
  FJELSTUL_SOURCE_NAME,
} from "../../src/server/import/source-manifest";

const REPORT_PATH = path.resolve(FJELSTUL_REPORTS_DIR, "headers.json");

// Headers fit comfortably in the first 64 KiB; avoids reading whole files.
const HEADER_READ_BYTES = 64 * 1024;

type HeaderReportEntry = {
  key: string;
  filename: string;
  exists: boolean;
  columns: string[];
  columnCount: number;
  inspectedAt: string;
};

async function readHeaderLine(filePath: string): Promise<string | null> {
  let handle;
  try {
    handle = await open(filePath, "r");
  } catch {
    return null;
  }
  try {
    const buffer = Buffer.alloc(HEADER_READ_BYTES);
    const { bytesRead } = await handle.read(buffer, 0, HEADER_READ_BYTES, 0);
    if (bytesRead === 0) return null;
    const text = buffer.subarray(0, bytesRead).toString("utf8");
    const newlineIndex = text.indexOf("\n");
    const line = newlineIndex === -1 ? text : text.slice(0, newlineIndex);
    return line.replace(/\r$/, "");
  } finally {
    await handle.close();
  }
}

function parseHeader(line: string): string[] {
  const rows = parse(line, { bom: true }) as string[][];
  return rows[0] ?? [];
}

async function main() {
  console.log(`Inspecting cached source files: ${FJELSTUL_SOURCE_NAME}\n`);

  const inspectedAt = new Date().toISOString();
  const entries: HeaderReportEntry[] = [];
  let missingRequired = 0;

  for (const dataset of FJELSTUL_DATASETS) {
    const headerLine = await readHeaderLine(path.resolve(dataset.localPath));
    const columns = headerLine === null ? [] : parseHeader(headerLine);
    const exists = headerLine !== null;

    entries.push({
      key: dataset.key,
      filename: dataset.filename,
      exists,
      columns,
      columnCount: columns.length,
      inspectedAt,
    });

    if (exists) {
      console.log(
        `  ${dataset.key.padEnd(16)} ${String(columns.length).padStart(3)} columns`,
      );
    } else {
      console.log(
        `  ${dataset.key.padEnd(16)} MISSING (run pnpm data:download)`,
      );
      if (dataset.required) missingRequired += 1;
    }
  }

  await mkdir(path.resolve(FJELSTUL_REPORTS_DIR), { recursive: true });
  await writeFile(REPORT_PATH, `${JSON.stringify(entries, null, 2)}\n`, "utf8");

  console.log(
    `\nReport written to ${path.relative(process.cwd(), REPORT_PATH)}`,
  );
  console.log(
    `  inspected: ${entries.filter((e) => e.exists).length}/${entries.length} files`,
  );

  if (missingRequired > 0) {
    console.error(`  missing required files: ${missingRequired}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Inspection run failed:", error);
  process.exitCode = 1;
});
