# Runbook — 2026 canonical archive import

How to validate, import, verify, resume, abandon and roll back the
promotion of the completed 2026 World Cup into the canonical archive tables
(`Tournament`, `Team`, `Match`, `Player`, `SquadPlayer`, `Goal`,
`PenaltyKick`, `Award`, …). Design and decisions are in
[`WORLDCUP_2026_ARCHIVE_REPORT.md`](./WORLDCUP_2026_ARCHIVE_REPORT.md).

## Inputs

| Path | Role |
| --- | --- |
| `docs/worldcupnexus_2026_data/` | The data bundle (official tier, candidate tier, quarantine, raw snapshot, SHA-256 manifest). Pinned by the sha256 of `source_manifest.csv`. |
| `data/2026/approved/approval.json` | Human approval, pinned to the bundle's manifest + validation-report hashes and scoped to `LOCAL`, `STAGING` or `PRODUCTION`. |
| `data/2026/approved/wc2026-identity-overrides.json` | Optional reviewed identity decisions (names/links with evidence). See the `.example.json`. |

## Commands

```bash
pnpm data:2026:canonical:validate   # bundle + cross-file checks only (no DB)
pnpm data:2026:canonical:dry-run    # read-only reconciliation plan vs the DB
pnpm data:2026:canonical:write      # gated write, then verification
pnpm data:2026:canonical:resume     # continue a failed run from checkpoints
pnpm data:2026:canonical:verify     # read-only post-import checks
pnpm search:index && pnpm search:verify   # ONLY after verify is OK
```

Flags: `--bundle <dir>`, `--batch-size <1-500>` (default 50),
`--transaction-timeout-ms <5000-600000>` (default 120000 — each batch is one
short transaction; Prisma's own 5 s default is too short for a 50-row batch
against a distant database such as Supabase ap-northeast-1),
`--confirm-production`, `--accept-official-changes`,
`--simulate-failure-at <entity>:<rows>` (LOCAL only, for testing resume).

Reports are written to `data/2026/reports/wc2026-canonical-<mode>.{md,json}`
and every write is recorded as a `DataImportRun` row with per-entity
`DataImportCheckpoint`s. The CLI prints only a redacted target
(`postgresql://***@host:port/db`) — never credentials.

## Write gates (in order)

1. Manifest: every file's sha256/size must match `source_manifest.csv`
   (`latest_validation_output.json` is a known benign mismatch — stdout
   captured after the manifest was written; it is not read).
2. Zod schemas for every file, then cross-file invariants. Any BLOCKER fails
   the run; reviewed known conflicts (M96) are reported but do not block.
3. Identity resolution: any ambiguous player/stadium match blocks the run.
4. `approval.json` must match this snapshot and cover the target kind.
5. PRODUCTION targets (Supabase/managed hosts, `NODE_ENV=production` or
   `IMPORT_TARGET=production`) also need `--confirm-production`.
6. Concurrency: refuses while another run for the same source has a
   heartbeat newer than 10 minutes.

## Local (done 2026-10-11)

```bash
docker compose up -d postgres
pnpm db:deploy                       # additive migration 20261011055725
pnpm data:2026:canonical:dry-run
pnpm data:2026:canonical:write
pnpm data:2026:canonical:verify
pnpm search:index && pnpm search:verify
```

## Staging

1. Back up the staging database (provider snapshot or
   `pg_dump -Fc`), and record the backup id.
2. `pnpm db:deploy` against staging (additive only; safe on populated DBs).
3. Write a new `approval.json` with `"scope": "STAGING"` (the owner signs it;
   the hashes stay the same for this bundle).
4. With `DATABASE_URL` pointing at staging and `IMPORT_TARGET=staging` if the
   host would otherwise be classified as production:
   `pnpm data:2026:canonical:dry-run`, review the report, then
   `pnpm data:2026:canonical:write` and `pnpm data:2026:canonical:verify`.
5. `pnpm search:index && pnpm search:verify`.
6. Acceptance: `/tournaments/2026`, `/matches?tournamentYear=2026`, a shootout
   match, the final, M96, `/players/pau-cubarsi`, search for "Mbappe" and
   "Cubarsi", and `PLAYWRIGHT_BASE_URL=<staging-url> pnpm test:e2e`.

Expected duration: the local write takes ~10 s (1,248 players, 1,248 squad
rows, 104 matches, 308 goals, 30 kicks, 9 awards, ~8,900 raw rows) in 50-row
batches; budget a few minutes against a remote database.

## Production (requires explicit owner approval — not done)

1. Owner approval in writing, then a fresh backup (record the id).
2. `pnpm db:deploy` with the **direct** connection (port 5432, not the 6543
   transaction pooler).
3. `approval.json` with `"scope": "PRODUCTION"` signed by the owner.
4. `pnpm data:2026:canonical:dry-run` → review → 
   `pnpm data:2026:canonical:write -- --confirm-production` →
   `pnpm data:2026:canonical:verify`.
5. Only if verify is OK: `pnpm search:index && pnpm search:verify`.
6. Deploy the application build. Until the import runs, production keeps
   rendering 2026 from the quarantined `WorldCup2026*` tables (the pages fall
   back automatically), so code can ship before or after the data.

## Resume, abandon, roll back

- **Interrupted run**: the run is marked `FAILED` with committed checkpoints
  and the list of entities not completed — it is partial, never reported as
  atomic. Fix the cause and run `pnpm data:2026:canonical:resume`; completed
  entities are skipped and the partial entity restarts at its checkpoint.
  A plain `write` also converges (every write is an upsert on a namespaced
  key), just without skipping.
- **Abandon**: nothing reads half-imported data as "complete" — verification
  fails and search must not be rebuilt. Leave the rows (they are namespaced:
  `sourceId` prefixes `mominul2026:`, `fifa2026:`, `fifa:`) and re-run later.
- **Roll back**: restore the pre-import backup. The importer never deletes
  canonical rows and there is deliberately no destructive "un-import"
  command. `prisma/migrations/20261011055725_*/down.sql.txt` documents the
  manual schema rollback for an abandoned promotion only.

## Pitfall: `.env.production.local`

`next build` / `next start` load `.env.production.local`, which points at the
**production** database. Running a local production build without overriding
`DATABASE_URL` makes the build's static sitemap and every rendered page READ
from production. Export the local URLs first:

```bash
set -a; source <(grep -E '^(DATABASE_URL|DIRECT_URL)=' .env); set +a
pnpm build && pnpm start
```

The tsx CLIs (`pnpm data:*`, `pnpm search:*`) only load `.env`.

## Tests

```bash
pnpm test:unit            # pure tests (bundle, stage, validate, resolve, model, search)
pnpm test:integration     # recreates the disposable <db>_it database, runs import scenarios
pnpm test:e2e             # dev server; or PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 against a build
```
