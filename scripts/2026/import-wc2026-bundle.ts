// Canonical 2026 promotion CLI (worldcupnexus_2026_data bundle → canonical
// Tournament/Team/Match/Player/… tables). See docs/RUNBOOK_2026_ARCHIVE.md.
//
//   pnpm data:2026:canonical:validate   bundle checks only, no database
//   pnpm data:2026:canonical:dry-run    read-only reconciliation plan
//   pnpm data:2026:canonical:write      gated write + verify
//   pnpm data:2026:canonical:resume     continue a failed run from checkpoints
//   pnpm data:2026:canonical:verify     read-only post-import checks
//
// Flags: --bundle <dir>  --batch-size <n>  --transaction-timeout-ms <ms>
//        --confirm-production
//        --accept-official-changes  --simulate-failure-at <entity>:<rows>
// Reports: data/2026/reports/wc2026-canonical-<mode>.{json,md}. Credentials
// are never printed — only a redacted host/port/database summary.

import "dotenv/config";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { createScriptPrismaClient } from "../import/utils/db";
import { APPROVAL_FILE, DEFAULT_BUNDLE_DIR } from "../../src/server/import/wc2026/constants";
import { LOAD_ENTITIES, type LoadEntity } from "../../src/server/import/wc2026/load";
import { runWc2026Import, type RunMode, type RunReport } from "../../src/server/import/wc2026/run";

const MODES: RunMode[] = ["validate", "dry-run", "write", "resume", "verify"];
const REPORTS_DIR = path.join("data", "2026", "reports");
const OVERRIDES_FILE = path.join("data", "2026", "approved", "wc2026-identity-overrides.json");

function flagValue(args: string[], name: string): string | undefined {
  const inline = args.find((a) => a.startsWith(`${name}=`));
  if (inline !== undefined) return inline.slice(name.length + 1);
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (value === undefined || value.startsWith("--")) throw new Error(`${name} requires a value.`);
  return value;
}

function renderMarkdown(report: RunReport, generatedAt: string): string {
  const lines = [
    `# 2026 canonical import — ${report.mode}`,
    "",
    `- Generated: ${generatedAt}`,
    `- Outcome: ${report.ok ? "OK" : `NOT OK${report.refusedBy !== null ? ` (gate: ${report.refusedBy})` : ""}`}`,
    `- Target: ${report.target?.redacted ?? "none (no database)"}${report.target !== null ? ` — ${report.target.kind}` : ""}`,
    `- Bundle manifest sha256: \`${report.bundle?.manifestSha256 ?? "n/a"}\``,
    `- Import run: ${report.runId ?? "none (no writes)"}`,
    "",
  ];
  if (report.validation !== null) {
    lines.push("## Validation", "", "| Status | Check | Detail |", "| --- | --- | --- |");
    for (const c of report.validation.checks) lines.push(`| ${c.status} | ${c.description} | ${(c.detail ?? "").replaceAll("|", "\\|")} |`);
    lines.push("", "## Known conflicts and decisions", "");
    for (const k of report.validation.knownConflicts) lines.push(`- **${k.id}** — ${k.record}: candidate ${k.candidateValue}; official ${k.officialValue}. Decision: ${k.decision}`);
    lines.push("");
  }
  if (report.withheld !== null) {
    lines.push("## Withheld from canonical tables", "", "| Data | Rows | Reason |", "| --- | ---: | --- |");
    for (const [key, w] of Object.entries(report.withheld)) lines.push(`| ${key} | ${w.rows} | ${w.reason} |`);
    lines.push("");
  }
  if (report.plan !== null) {
    lines.push("## Planned operations", "", "| Entity | Operations |", "| --- | --- |");
    for (const [entity, ops] of Object.entries(report.plan.summary)) lines.push(`| ${entity} | ${Object.entries(ops).map(([k, v]) => `${k}: ${v}`).join(", ")} |`);
    lines.push("");
    if (report.plan.conflicts.length > 0) lines.push("## Identity conflicts (blocking)", "", ...report.plan.conflicts.map((c) => `- ${c}`), "");
    if (report.plan.warnings.length > 0) lines.push("## Warnings", "", ...report.plan.warnings.map((w) => `- ${w}`), "");
  }
  if (report.identity !== null) {
    lines.push(`## Identity resolution`, "", `${report.identity.linkedPlayers.length} candidate players linked to existing canonical profiles (no duplicates created); ${report.identity.incompleteNames.length} truncated source names stored as "Unidentified …" pending review.`, "");
  }
  if (report.load !== null) {
    lines.push("## Written", "", "| Entity | Written | Skipped (checkpoint/present) | Linked existing |", "| --- | ---: | ---: | ---: |");
    for (const [entity, c] of Object.entries(report.load.counts)) lines.push(`| ${entity} | ${c.written} | ${c.skippedByCheckpoint} | ${c.linked} |`);
    lines.push("");
  }
  if (report.verification !== null) {
    lines.push("## Post-import verification", "", "| Status | Check | Detail |", "| --- | --- | --- |");
    for (const c of report.verification.checks) lines.push(`| ${c.status} | ${c.description} | ${(c.detail ?? "").replaceAll("|", "\\|")} |`);
    lines.push("");
  }
  if (report.errors.length > 0) lines.push("## Errors", "", ...report.errors.map((e) => `- ${e}`), "");
  if (report.nextSteps.length > 0) lines.push("## Next steps", "", ...report.nextSteps.map((s) => `- \`${s}\``), "");
  return lines.join("\n");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const mode = args.find((a) => !a.startsWith("--")) as RunMode | undefined;
  if (mode === undefined || !MODES.includes(mode)) {
    throw new Error(`Usage: import-wc2026-bundle.ts <${MODES.join("|")}> [flags]`);
  }
  const batchRaw = flagValue(args, "--batch-size");
  const batchSize = batchRaw === undefined ? undefined : Number(batchRaw);
  if (batchSize !== undefined && (!Number.isSafeInteger(batchSize) || batchSize < 1 || batchSize > 500)) {
    throw new Error("--batch-size must be an integer between 1 and 500.");
  }
  const timeoutRaw = flagValue(args, "--transaction-timeout-ms");
  const transactionTimeoutMs = timeoutRaw === undefined ? undefined : Number(timeoutRaw);
  if (transactionTimeoutMs !== undefined && (!Number.isSafeInteger(transactionTimeoutMs) || transactionTimeoutMs < 5_000 || transactionTimeoutMs > 600_000)) {
    throw new Error("--transaction-timeout-ms must be an integer between 5000 and 600000.");
  }
  const failRaw = flagValue(args, "--simulate-failure-at");
  let simulateFailureAt: { entity: LoadEntity; rows: number } | undefined;
  if (failRaw !== undefined) {
    const [entity, rows] = failRaw.split(":");
    if (!LOAD_ENTITIES.includes(entity as LoadEntity) || !Number.isSafeInteger(Number(rows))) {
      throw new Error("--simulate-failure-at must look like players:200");
    }
    simulateFailureAt = { entity: entity as LoadEntity, rows: Number(rows) };
  }

  console.log(`WORLDCUP Nexus — 2026 canonical import (${mode})\n`);
  const prisma = mode === "validate" ? null : createScriptPrismaClient();
  let report: RunReport;
  try {
    report = await runWc2026Import(prisma, {
      mode,
      bundleDir: flagValue(args, "--bundle") ?? DEFAULT_BUNDLE_DIR,
      approvalFile: APPROVAL_FILE,
      overridesFile: OVERRIDES_FILE,
      databaseUrl: process.env.DATABASE_URL,
      env: { NODE_ENV: process.env.NODE_ENV, IMPORT_TARGET: process.env.IMPORT_TARGET },
      confirmProduction: args.includes("--confirm-production"),
      acceptOfficialChanges: args.includes("--accept-official-changes"),
      ...(batchSize !== undefined ? { batchSize } : {}),
      ...(transactionTimeoutMs !== undefined ? { transactionTimeoutMs } : {}),
      ...(simulateFailureAt !== undefined ? { simulateFailureAt } : {}),
      log: (line) => console.log(line),
    });
  } finally {
    await prisma?.$disconnect();
  }

  const failing = [...(report.validation?.checks ?? []), ...(report.verification?.checks ?? [])].filter((c) => c.status !== "PASS");
  for (const c of failing) console.log(`  [${c.status}] ${c.id}: ${c.detail ?? ""}`);
  for (const c of report.plan?.conflicts ?? []) console.log(`  [CONFLICT] ${c}`);
  for (const e of report.errors) console.error(`  [ERROR] ${e}`);
  console.log(`\nOutcome: ${report.ok ? "OK" : `NOT OK (${report.refusedBy ?? "unknown"})`}`);

  const generatedAt = new Date().toISOString();
  await mkdir(REPORTS_DIR, { recursive: true });
  const base = path.join(REPORTS_DIR, `wc2026-canonical-${mode}`);
  await writeFile(`${base}.json`, `${JSON.stringify({ generatedAt, ...report }, null, 2)}\n`, "utf8");
  await writeFile(`${base}.md`, renderMarkdown(report, generatedAt), "utf8");
  console.log(`Report: ${base}.md`);
  for (const step of report.nextSteps) console.log(`Next: ${step}`);
  if (!report.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error("\n2026 canonical import failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
