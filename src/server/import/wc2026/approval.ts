// Approval gate for canonical 2026 writes (data/2026/approved/README.md).
// The approval file must be written by a human reviewer and pins the exact
// bundle snapshot: a different manifest or validation report invalidates it.

import { readFile } from "node:fs/promises";

import { z } from "zod";

import type { TargetKind } from "./target";

export const approvalSchema = z.object({
  approvedBy: z.string().trim().min(1),
  approvedAt: z.iso.datetime(),
  dataPackVersion: z.string().trim().min(1),
  /** "sha256:<hex>" of the bundle's validation/validation_report.json. */
  validationReportHash: z.string().regex(/^sha256:[0-9a-f]{64}$/),
  /** "sha256:<hex>" of the bundle's source_manifest.csv. */
  bundleManifestHash: z.string().regex(/^sha256:[0-9a-f]{64}$/),
  approvedForImport: z.boolean(),
  /** Highest target this approval covers: LOCAL < STAGING < PRODUCTION. */
  scope: z.enum(["LOCAL", "STAGING", "PRODUCTION"]),
  notes: z.string().optional(),
});

export type Approval = z.infer<typeof approvalSchema>;

const RANK: Record<TargetKind, number> = { LOCAL: 0, STAGING: 1, PRODUCTION: 2 };

export type ApprovalCheck = { ok: true; approval: Approval } | { ok: false; reason: string };

export function checkApproval(
  raw: unknown,
  expected: { manifestSha256: string; validationReportSha256: string; target: TargetKind },
): ApprovalCheck {
  const parsed = approvalSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: `approval file is malformed: ${parsed.error.issues.map((i) => i.path.join(".")).join(", ")}` };
  }
  const approval = parsed.data;
  if (!approval.approvedForImport) return { ok: false, reason: "approvedForImport is not true" };
  if (approval.bundleManifestHash !== `sha256:${expected.manifestSha256}`) {
    return { ok: false, reason: "approval is for a different bundle snapshot (manifest hash mismatch)" };
  }
  if (approval.validationReportHash !== `sha256:${expected.validationReportSha256}`) {
    return { ok: false, reason: "approval is for a different validation report (hash mismatch)" };
  }
  if (RANK[expected.target] > RANK[approval.scope]) {
    return { ok: false, reason: `approval scope ${approval.scope} does not cover a ${expected.target} target` };
  }
  return { ok: true, approval };
}

export async function readApprovalFile(file: string): Promise<unknown | null> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as unknown;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw new Error(`approval file ${file} could not be read as JSON`);
  }
}
