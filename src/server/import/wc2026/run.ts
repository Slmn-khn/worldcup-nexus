// Orchestrator for the canonical 2026 promotion import.
//
//   validate  filesystem + cross-file checks only (no database client)
//   dry-run   read-only reconciliation against the database → planned ops
//   write     gated write (approval + target + no blockers), then verify
//   resume    write that honours checkpoints from a failed run (same checksum)
//   verify    read-only post-import invariants + historical fingerprint
//
// Gates for write/resume, in order: bundle manifest + schema, cross-file
// BLOCKERs, identity conflicts, approval file (pinned to this snapshot and
// scoped to the target), production confirmation, concurrent-run guard.

import { readFile } from "node:fs/promises";

import { z } from "zod";

import type { Prisma, PrismaClient } from "../../../generated/prisma/client";
import { checkApproval, readApprovalFile } from "./approval";
import { BundleError, loadBundle, type ParsedBundle } from "./bundle";
import { DEFAULT_BATCH_SIZE, DEFAULT_TRANSACTION_TIMEOUT_MS, IMPORT_SOURCE, STALE_RUN_MS, TOURNAMENT_YEAR } from "./constants";
import { LOAD_ENTITIES, loadPlan, SimulatedFailure, type LoadEntity, type LoadResult } from "./load";
import { buildPlan, candidatePlayerSlugs, type ImportPlan } from "./plan";
import { findTakenPlayerSlugs, loadSnapshot, type IdentityOverrides } from "./resolve";
import { stageBundle, type StagedBundle } from "./stage";
import { classifyTarget, type TargetSummary } from "./target";
import { validateBundle, type ValidationCheck, type ValidationResult } from "./validate";
import { historicalFingerprint, verifyDatabase, type HistoricalFingerprint } from "./verify";

export type RunMode = "validate" | "dry-run" | "write" | "resume" | "verify";

export type RunOptions = {
  mode: RunMode;
  bundleDir: string;
  approvalFile: string;
  overridesFile: string;
  databaseUrl?: string;
  env?: { NODE_ENV?: string; IMPORT_TARGET?: string };
  confirmProduction?: boolean;
  acceptOfficialChanges?: boolean;
  batchSize?: number;
  transactionTimeoutMs?: number;
  simulateFailureAt?: { entity: LoadEntity; rows: number };
  log?: (line: string) => void;
};

export type RunReport = {
  mode: RunMode;
  ok: boolean;
  refusedBy: string | null;
  target: Omit<TargetSummary, "host"> & { host: string } | null;
  bundle: { manifestSha256: string; validationReportSha256: string } | null;
  validation: ValidationResult | null;
  plan: Pick<ImportPlan, "summary" | "conflicts" | "warnings"> | null;
  identity: { linkedPlayers: { srcId: number; candidateName: string; canonicalName: string; method: string }[]; incompleteNames: number[] } | null;
  withheld: StagedBundle["withheld"] | null;
  load: LoadResult | null;
  verification: { ok: boolean; checks: ValidationCheck[] } | null;
  runId: string | null;
  errors: string[];
  nextSteps: string[];
};

const overridesSchema = z.object({
  players: z
    .record(
      z.string().regex(/^\d+$/),
      z.object({
        canonicalPlayerSlug: z.string().optional(),
        displayName: z.string().min(3).optional(),
        evidenceUrl: z.url(),
        reviewedBy: z.string().min(1),
      }),
    )
    .optional(),
});

async function readOverrides(file: string): Promise<IdentityOverrides> {
  let text: string;
  try {
    text = await readFile(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }
  return overridesSchema.parse(JSON.parse(text));
}

function emptyReport(mode: RunMode): RunReport {
  return {
    mode, ok: false, refusedBy: null, target: null, bundle: null, validation: null, plan: null,
    identity: null, withheld: null, load: null, verification: null, runId: null, errors: [], nextSteps: [],
  };
}

/** Baseline = fingerprint captured by the earliest WRITE run for this source. */
async function earliestBaseline(prisma: PrismaClient): Promise<HistoricalFingerprint | null> {
  const run = await prisma.dataImportRun.findFirst({
    where: { source: IMPORT_SOURCE, mode: { in: ["WRITE", "RESUME"] } },
    orderBy: { startedAt: "asc" },
    select: { counts: true },
  });
  const counts = run?.counts as { historicalBefore?: HistoricalFingerprint } | null | undefined;
  return counts?.historicalBefore ?? null;
}

export async function runWc2026Import(prisma: PrismaClient | null, options: RunOptions): Promise<RunReport> {
  const log = options.log ?? (() => {});
  const report = emptyReport(options.mode);
  const refuse = (gate: string, message: string) => {
    report.refusedBy = gate;
    report.errors.push(message);
    return report;
  };

  // 1. Extract + validate (no database) -----------------------------------
  let bundle: ParsedBundle;
  try {
    bundle = await loadBundle(options.bundleDir);
  } catch (error) {
    if (error instanceof BundleError) {
      report.errors.push(error.message, ...error.details.slice(0, 50));
      return refuse("bundle", "Bundle extraction failed.");
    }
    throw error;
  }
  report.bundle = { manifestSha256: bundle.manifestSha256, validationReportSha256: bundle.validationReportSha256 };
  const staged = stageBundle(bundle);
  const validation = validateBundle(bundle, staged);
  report.validation = validation;
  report.withheld = staged.withheld;
  log(`Bundle ${bundle.manifestSha256.slice(0, 12)}… — ${validation.checks.filter((c) => c.status === "PASS").length}/${validation.checks.length} checks pass, ${validation.blockers.length} blocker(s)`);
  if (options.mode === "validate") {
    report.ok = validation.ok;
    if (!validation.ok) report.refusedBy = "validation";
    report.nextSteps.push("pnpm data:2026:canonical:dry-run");
    return report;
  }

  // 2. Database target --------------------------------------------------------
  if (prisma === null) return refuse("database", "A database client is required for this mode.");
  let target: TargetSummary;
  try {
    target = classifyTarget(options.databaseUrl, options.env ?? {});
  } catch (error) {
    return refuse("target", (error as Error).message);
  }
  report.target = target;
  log(`Target: ${target.redacted} (${target.kind})`);

  if (options.mode === "verify") {
    const verification = await verifyDatabase(prisma, { baseline: await earliestBaseline(prisma) });
    report.verification = verification;
    report.ok = verification.ok;
    if (!verification.ok) report.refusedBy = "verification";
    else report.nextSteps.push("pnpm search:index", "pnpm search:verify");
    return report;
  }

  // 3. Resolve + plan (read-only) -------------------------------------------
  let overrides: IdentityOverrides;
  try {
    overrides = await readOverrides(options.overridesFile);
  } catch (error) {
    return refuse("overrides", `Identity overrides file is invalid: ${(error as Error).message}`);
  }
  const overrideSlugs = Object.values(overrides.players ?? {}).flatMap((o) => (o.canonicalPlayerSlug !== undefined ? [o.canonicalPlayerSlug] : []));
  const snapshot = await loadSnapshot(prisma, staged, overrideSlugs);
  snapshot.takenPlayerSlugs = await findTakenPlayerSlugs(prisma, candidatePlayerSlugs(staged));
  const plan = buildPlan(staged, snapshot, overrides);
  report.plan = { summary: plan.summary, conflicts: plan.conflicts, warnings: plan.warnings };
  report.identity = {
    linkedPlayers: plan.players.flatMap((p) => (p.op === "link" && p.playerId !== "" ? [{ srcId: p.srcId, candidateName: p.candidateName, canonicalName: p.canonicalName, method: p.method }] : [])),
    incompleteNames: plan.players.flatMap((p) => (p.op === "upsert" && p.nameIncomplete ? [p.srcId] : [])),
  };
  if (options.mode === "dry-run") {
    report.ok = validation.ok && plan.conflicts.length === 0;
    if (!validation.ok) report.refusedBy = "validation";
    else if (plan.conflicts.length > 0) report.refusedBy = "identity-conflicts";
    report.nextSteps.push("pnpm data:2026:canonical:write");
    return report;
  }

  // 4. Write gates ------------------------------------------------------------
  if (!validation.ok) return refuse("validation", `${validation.blockers.length} blocking validation check(s) failed.`);
  if (plan.conflicts.length > 0) return refuse("identity-conflicts", `${plan.conflicts.length} identity conflict(s) must be resolved (see plan.conflicts).`);
  const approval = checkApproval(await readApprovalFile(options.approvalFile), {
    manifestSha256: bundle.manifestSha256,
    validationReportSha256: bundle.validationReportSha256,
    target: target.kind,
  });
  if (!approval.ok) return refuse("approval", `Approval gate (${options.approvalFile}): ${approval.reason}`);
  if (target.kind === "PRODUCTION" && options.confirmProduction !== true) {
    return refuse("production", "Production target detected — re-run with --confirm-production after taking a backup.");
  }
  if (options.simulateFailureAt !== undefined && target.kind !== "LOCAL") {
    return refuse("simulate", "--simulate-failure-at is only allowed against a LOCAL database.");
  }
  const active = await prisma.dataImportRun.findFirst({
    where: { source: IMPORT_SOURCE, status: "RUNNING", updatedAt: { gt: new Date(Date.now() - STALE_RUN_MS) } },
  });
  if (active !== null) return refuse("concurrency", `Another import run (${active.id}) is RUNNING; wait for it or let it go stale (${STALE_RUN_MS / 60000} min).`);

  // 5. Load -------------------------------------------------------------------
  const resume = options.mode === "resume";
  const historicalBefore = await historicalFingerprint(prisma);
  const run = await prisma.dataImportRun.create({
    data: {
      source: IMPORT_SOURCE,
      tournamentYear: TOURNAMENT_YEAR,
      sourceChecksum: bundle.manifestSha256,
      mode: resume ? "RESUME" : "WRITE",
      status: "RUNNING",
      targetSummary: `${target.redacted} (${target.kind})`,
      counts: { historicalBefore, planned: plan.summary } as Prisma.InputJsonValue,
      warnings: plan.warnings as Prisma.InputJsonValue,
    },
  });
  report.runId = run.id;
  log(`Import run ${run.id} (${resume ? "resume" : "write"}, batch ${options.batchSize ?? DEFAULT_BATCH_SIZE}, tx timeout ${options.transactionTimeoutMs ?? DEFAULT_TRANSACTION_TIMEOUT_MS} ms)`);

  try {
    report.load = await loadPlan({
      prisma, bundle, staged, plan, runId: run.id,
      batchSize: options.batchSize ?? DEFAULT_BATCH_SIZE,
      transactionTimeoutMs: options.transactionTimeoutMs ?? DEFAULT_TRANSACTION_TIMEOUT_MS,
      resume,
      acceptOfficialChanges: options.acceptOfficialChanges === true,
      ...(options.simulateFailureAt !== undefined ? { simulateFailureAt: options.simulateFailureAt } : {}),
      log,
    });
  } catch (error) {
    const checkpoints = await prisma.dataImportCheckpoint.findMany({
      where: { source: IMPORT_SOURCE, sourceChecksum: bundle.manifestSha256 },
      select: { entity: true, rowsCompleted: true, completed: true },
    });
    const committed = Object.fromEntries(checkpoints.map((c) => [c.entity, c]));
    const remaining = LOAD_ENTITIES.filter((e) => committed[e]?.completed !== true);
    await prisma.dataImportRun.update({
      where: { id: run.id },
      data: {
        status: error instanceof SimulatedFailure ? "FAILED_SIMULATED" : "FAILED",
        finishedAt: new Date(),
        errors: [String((error as Error).message)] as Prisma.InputJsonValue,
        counts: { historicalBefore, planned: plan.summary, committed, remaining } as Prisma.InputJsonValue,
      },
    });
    report.errors.push(`Run ${run.id} stopped: ${(error as Error).message}`);
    report.errors.push(`Committed checkpoints: ${checkpoints.map((c) => `${c.entity}=${c.rowsCompleted}${c.completed ? "✓" : ""}`).join(", ") || "none"}`);
    report.errors.push(`Not completed: ${remaining.join(", ")} — this run is PARTIAL, not atomic.`);
    report.refusedBy = "load";
    report.nextSteps.push("pnpm data:2026:canonical:resume");
    return report;
  }

  // 6. Verify -----------------------------------------------------------------
  const verification = await verifyDatabase(prisma, { baseline: historicalBefore });
  report.verification = verification;
  const officialConflicts = report.load.officialConflicts;
  const status = !verification.ok ? "VERIFY_FAILED" : officialConflicts.length > 0 ? "COMPLETED_WITH_CONFLICTS" : "COMPLETED";
  await prisma.dataImportRun.update({
    where: { id: run.id },
    data: {
      status,
      finishedAt: new Date(),
      counts: { historicalBefore, planned: plan.summary, written: report.load.counts } as Prisma.InputJsonValue,
      errors: [...officialConflicts, ...verification.checks.filter((c) => c.status === "FAIL").map((c) => `${c.id}: ${c.detail ?? ""}`)] as Prisma.InputJsonValue,
    },
  });
  report.ok = verification.ok;
  if (!verification.ok) report.refusedBy = "verification";
  if (officialConflicts.length > 0) report.errors.push(...officialConflicts);
  report.nextSteps.push(...(verification.ok ? ["pnpm search:index", "pnpm search:verify"] : ["Inspect the failed verification checks before indexing search."]));
  return report;
}
