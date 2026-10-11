# 2026 approved data packs

This folder is the **approval gate** between the Phase 1 data steward pipeline
and any future import into the production archive.

## Phase 1 does not import

Phase 1 (`pnpm data:2026:collect` → `candidates` → `normalize` → `validate`)
only produces files under `data/2026/`. It never writes to the database and
never publishes anything. There is intentionally **no** import script yet.

## How approval will work (future phase)

Any future import script for finalized 2026 archive data MUST:

1. Refuse to run unless `data/2026/approved/approval.json` exists.
2. Verify that the approval matches the exact data pack being imported
   (by comparing `validationReportHash` against the sha256 of the current
   `data/2026/validation/validation-report.json`).
3. Refuse to run when `approvedForImport` is not `true`.
4. Never overwrite existing `Fixture`, `Match`, `Tournament`, `Team`,
   `Country`, or `Stadium` records.

## approval.json shape

```json
{
  "approvedBy": "human reviewer name",
  "approvedAt": "2026-XX-XXTXX:XX:XXZ",
  "dataPackVersion": "2026.1",
  "validationReportHash": "sha256:…",
  "approvedForImport": true
}
```

Do **not** create `approval.json` in Phase 1. It must be written by a human
reviewer after reading `data/2026/reports/2026-data-steward-report.md` and the
conflict reports — a report that says "NOT READY FOR IMPORT" means exactly
that.

## Canonical promotion import (implemented 2026-10-11)

`pnpm data:2026:canonical:*` (see `docs/RUNBOOK_2026_ARCHIVE.md`) imports the
`docs/worldcupnexus_2026_data` bundle into the canonical tables and enforces
this gate with an extended `approval.json`:

```json
{
  "approvedBy": "human reviewer name",
  "approvedAt": "2026-10-11T06:30:00Z",
  "dataPackVersion": "worldcupnexus_2026_data …",
  "validationReportHash": "sha256:<bundle validation/validation_report.json>",
  "bundleManifestHash": "sha256:<bundle source_manifest.csv>",
  "approvedForImport": true,
  "scope": "LOCAL"
}
```

`scope` is the highest target the approval covers (`LOCAL` < `STAGING` <
`PRODUCTION`); a changed bundle invalidates the approval. The approval in this
folder is scoped to the LOCAL development database only. Reviewed identity
decisions go in `wc2026-identity-overrides.json` (see the `.example.json`).

