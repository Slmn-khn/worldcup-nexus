// Export verification (Checkpoint 6B) — exercises the export query and CSV
// helper directly (the same code paths /api/export/explorer uses).
//
// Usage: pnpm export:verify

import "dotenv/config";

import { prisma } from "@/server/db/prisma";
import { toCsv, toCsvValue } from "@/server/exports/csv";
import {
  EXPLORER_EXPORT_CAP,
  getExplorerExport,
} from "@/server/queries/explorer";

const EXPECTED_COLUMNS = [
  "eventType",
  "tournamentYear",
  "tournamentName",
  "date",
  "stage",
  "matchLabel",
  "teamName",
  "playerName",
  "minute",
  "detail",
  "value",
  "href",
];

type Check = { name: string; passed: boolean; detail: string };
const checks: Check[] = [];

function check(name: string, passed: boolean, detail: string): void {
  checks.push({ name, passed, detail });
}

async function main() {
  console.log("WORLDCUP Nexus — export verification\n");

  // Filtered export (Goal) — the common case.
  const goalExport = await getExplorerExport({
    eventType: "Goal",
    tournamentYear: 1986,
  });
  const exportRows: Record<string, unknown>[] = goalExport.rows.map((row) => ({
    eventType: row.eventType,
    tournamentYear: row.tournamentYear,
    tournamentName: row.tournamentName,
    date: row.date,
    stage: row.stage,
    matchLabel: row.matchLabel,
    teamName: row.teamName,
    playerName: row.playerName,
    minute: row.minute,
    detail: row.detail,
    value: row.outcome,
    href: row.href,
  }));
  const csv = toCsv(
    EXPECTED_COLUMNS.map((column) => ({ key: column, label: column })),
    exportRows,
  );
  const [headerLine] = csv.split("\r\n");

  check(
    "filtered export respects eventType=Goal",
    goalExport.rows.length > 0 &&
      goalExport.rows.every((row) => row.eventType === "Goal"),
    `${goalExport.rows.length} rows (1986 goals), total ${goalExport.total}, cap ${EXPLORER_EXPORT_CAP}`,
  );
  check(
    "CSV has expected header row",
    headerLine === EXPECTED_COLUMNS.join(","),
    headerLine ?? "no header",
  );
  check(
    "CSV has data rows",
    csv.trim().split("\r\n").length === goalExport.rows.length + 1,
    `${csv.trim().split("\r\n").length - 1} data lines`,
  );
  check(
    "CSV escaping helper works",
    toCsv([{ key: "v", label: "v" }], [{ v: 'a,"b"\nc' }]).includes(
      '"a,""b""\nc"',
    ),
    "quotes/commas/newlines escaped",
  );

  // Spreadsheet formula injection is neutralized (Checkpoint 8B, P0.3):
  // synthetic hostile cells must gain a leading single quote.
  const HOSTILE_CELLS: { input: string; expected: string }[] = [
    { input: "=cmd()", expected: "'=cmd()" },
    { input: "+SUM(A1:A2)", expected: "'+SUM(A1:A2)" },
    { input: "-10+20", expected: "'-10+20" },
    { input: "@evil", expected: "'@evil" },
  ];
  const hostileFailures = HOSTILE_CELLS.filter(
    ({ input, expected }) => toCsvValue(input) !== expected,
  );
  check(
    "formula-injection cells are neutralized",
    hostileFailures.length === 0 &&
      toCsvValue("\ttab-start").startsWith("'") &&
      toCsv([{ key: "v", label: "v" }], [{ v: "=cmd()" }]).includes("'=cmd()"),
    hostileFailures.length === 0
      ? `${HOSTILE_CELLS.length} hostile cells prefixed with ' (plus tab/CR starts)`
      : `unneutralized: ${hostileFailures.map(({ input }) => input).join(", ")}`,
  );
  check(
    "normal cells are unaffected by formula guard",
    toCsvValue("Diego Maradona") === "Diego Maradona" &&
      toCsvValue("3–2") === "3–2" &&
      toCsvValue(52) === "52" &&
      toCsvValue("") === "",
    "plain text, en-dash scores, and numbers unchanged",
  );

  const jsonExport = {
    exportedAt: new Date().toISOString(),
    filters: goalExport.activeFilters,
    total: goalExport.total,
    count: goalExport.rows.length,
    cap: EXPLORER_EXPORT_CAP,
    rows: exportRows,
  };
  check(
    "JSON export shape can be created",
    typeof jsonExport.exportedAt === "string" &&
      jsonExport.count === jsonExport.rows.length &&
      jsonExport.cap === EXPLORER_EXPORT_CAP,
    `count ${jsonExport.count}, total ${jsonExport.total}`,
  );
  const serialized = JSON.stringify(jsonExport);
  check(
    "no RawSourceRecord payload in export",
    !serialized.includes('"payload"') &&
      !serialized.toLowerCase().includes("rawsourcerecord"),
    `${serialized.length} chars serialized`,
  );

  console.log("Checks");
  let failures = 0;
  for (const { name, passed, detail } of checks) {
    if (!passed) failures += 1;
    console.log(`  [${passed ? "PASS" : "FAIL"}] ${name} — ${detail}`);
  }

  if (failures > 0) {
    console.error(`\n${failures} export check(s) failed.`);
    process.exitCode = 1;
  } else {
    console.log("\nAll export checks passed.");
  }
}

main()
  .catch((error) => {
    console.error(
      "\nExport verification failed:",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
