# Advanced AI Implementation Prompt — WorldCup Nexus 2026 Complete Archive

Copy this entire prompt into the coding agent that has access to the latest WorldCup Nexus repository and the extracted `worldcupnexus_2026_data` directory.

---

## Role

Act as a hands-on Senior/Principal Software Architect with more than 30 years of experience delivering high-availability data platforms, content-rich public websites, large database migrations and zero-regression production releases.

You are responsible for analysis, architecture, implementation, data engineering, testing, accessibility, performance, observability, security and a safe release plan. Do not behave like a code generator working from assumptions. Inspect the repository and prove every architectural conclusion from the code before modifying it.

## Mission

Update WorldCup Nexus with the completed FIFA World Cup 2026 tournament so that it has the same reliable archive coverage and connected navigation as the older World Cups, while correctly supporting the new 48-team and 104-match format.

Import verified 2026 data, reconcile candidate data, add the official awards, and expose the information through the existing website experience without breaking historical tournaments, routes, search, deployment, performance or visual consistency.

## Known project baseline

- Product: WorldCup Nexus, a source-backed FIFA World Cup archive covering 1930–2026.
- Framework: Next.js 16.2.6 App Router.
- UI: React 19.2.4 and Material UI 9.0.1.
- Language: strict TypeScript.
- Database: PostgreSQL/Supabase.
- ORM: Prisma 7.8.0.
- Validation: Zod 4.4.3.
- Tests: Vitest 4.1.7 and Playwright 1.60.0.
- Package manager: pnpm.
- Hosting: Vercel.
- Search direction: PostgreSQL full-text search plus `pg_trgm` and a normalized `SearchDocument`; paid Meilisearch is being retired.
- Core entities include Tournament, Country, Team, Player, Match, SquadPlayer, Stadium, Referee, RawSourceRecord, Goal, Booking, Substitution, PenaltyKick and Award.
- Known historical issue: `/matches` previously returned HTTP 400; confirm that no new work revives this defect.
- Known import failure: `pnpm data:2026:mominul:import:write -- --confirm-production` exceeded Prisma's 5,000 ms interactive transaction timeout while upserting 2026 teams. Do not repeat this transaction design.

Treat this baseline as context, not truth. The repository is authoritative. Report any divergence.

## Input package

The extracted data package contains:

- `01_verified_official/`: FIFA-confirmed tournament and award records.
- `02_import_candidates/`: normalized but reconciliation-required teams, venues, stages, referees, matches, players, events, lineups and match team statistics.
- `03_quarantine/`: fields explicitly blocked from automatic production import.
- `official_sources/`: FIFA's official 2026 awards PDF.
- `source/`: unmodified source snapshot.
- `validation/`: structural report and known conflicts.
- `source_manifest.csv`: SHA-256 manifest.
- `scripts/prepare_bundle.py`: deterministic preparation and validation script.

Run the validator before using the package. Abort the import if the manifest or structural checks fail.

## Non-negotiable safety rules

1. Read all repository instructions such as `AGENTS.md`, `CLAUDE.md`, README files and package scripts before changing code.
2. Inspect `git status` and preserve all unrelated or uncommitted user work. Never reset, discard or rewrite it.
3. Create a dedicated branch such as `feat/world-cup-2026-complete-archive` from the current intended base branch. Do not push, merge, deploy or write to production unless explicitly authorized.
4. Begin with read-only inspection. Do not alter the schema or database until the current architecture, migration state and existing 2026 implementation are understood.
5. Schema migrations must be additive and backward compatible. No table drops, column drops, destructive renames, database resets or rewriting historical IDs.
6. Never modify 1930–2022 records as a side effect of the 2026 import.
7. Never fabricate missing substitutions, events, statistics, standings, player minutes, images or narratives. Unknown data remains `NULL` or explicitly incomplete.
8. FIFA-confirmed records take precedence over candidate or third-party data.
9. Exclude market values, prediction features, heuristic ELO values and any unverified derived fields from canonical public records.
10. Keep media and logos out of the import unless the repository already has a lawful asset and attribution workflow.
11. All imports must be idempotent, restartable, auditable and scoped to the 2026 tournament plus a named source namespace.
12. Refuse production writes unless an explicit `--confirm-production`-style flag is supplied and the destination has been positively identified.
13. Do not solve a data mismatch by weakening a constraint, deleting old data or silently choosing one value.

## Phase 0 — Evidence-based repository audit

Before implementation, inspect and summarize:

- Current branch, working tree, package manager and supported runtime versions.
- Prisma schema, migrations, seeds and tournament-related constraints/indexes.
- Every 2026 importer, validator, mapping file and npm/pnpm script.
- Existing services/repositories/queries for tournaments, matches, teams, players, stadiums, referees, events and awards.
- Existing routes and components for tournament detail, groups, bracket, matches, match detail, teams, player profiles, awards/records, search and homepage modules.
- Any hard-coded assumptions for 32 teams, 8 groups, 64 matches, a round-of-16 entry point, or one/two hosts.
- Search implementation and whether Meilisearch removal is complete in code, dependencies, environment variables and deployment configuration.
- Current test coverage and fixtures for older tournaments.
- Caching/revalidation rules, API pagination and DTO boundaries.
- Existing source provenance model and admin/moderation conventions.
- Current 2026 database state, if a safe read-only connection is available.

Produce a concise audit table containing: area, current implementation, 2026 impact, proposed change, risk and tests. Then proceed unless a destructive ambiguity or unavailable required credential genuinely blocks the work.

Do not create a parallel 2026-only architecture merely because old scripts do so. Prefer the canonical entities used by older World Cups unless code evidence establishes a justified exception.

## Source-of-truth hierarchy

Apply this precedence order:

1. Official FIFA tournament and awards records.
2. Official FIFA match reports or FIFA match centre records.
3. Existing WorldCup Nexus canonical records already verified and carrying provenance.
4. Candidate relational dataset records with explicit source metadata.
5. Derived values calculated deterministically from verified canonical records.

When two sources differ, preserve both raw records, select the higher-priority value for the canonical field, record the reconciliation decision and add a regression test.

## Mandatory 2026 invariants

The implementation must enforce and test:

- Tournament year: 2026.
- Hosts: Canada, Mexico and United States.
- 48 participating teams.
- 12 groups, A through L.
- 1,248 registered squad players in the source snapshot.
- 104 completed matches.
- Stage distribution: 72 group, 16 round of 32, 8 round of 16, 4 quarter-finals, 2 semi-finals, 1 third-place match and 1 final.
- 16 venues.
- 308 total scoreline goals.
- Champion Spain; runner-up Argentina; third England; fourth France.
- Final: Spain 1–0 Argentina after extra time on 19 July 2026.
- Every match has two distinct teams, one stage and one venue.
- Knockout draws have a valid extra-time or shootout outcome.
- Goal plus own-goal events reconcile with match scorelines.
- Shootout kicks do not inflate ordinary match goals or Golden Boot totals.
- All foreign keys resolve and all import natural keys are unique.

Official awards that must be present:

- FIFA Fair Play Trophy: Netherlands.
- Golden Boot: Kylian Mbappé, France, shirt 10, 10 goals, 4 assists, 769 official minutes.
- Silver Boot: Lionel Messi, Argentina, shirt 10, 8 goals, 4 assists.
- Bronze Boot: Jude Bellingham, England, shirt 10, 7 goals, 1 assist, 698 official minutes.
- Golden Glove: Unai Simón, Spain, shirt 23.
- Golden Ball: Rodri, Spain, shirt 16.
- Silver Ball: Lionel Messi, Argentina, shirt 10.
- Bronze Ball: Kylian Mbappé, France, shirt 10.
- Young Player Award: Pau Cubarsí, Spain, shirt 22.

## Identity resolution

Do not identify records by display name alone.

- Introduce or reuse a `sourceSystem + externalId` mapping strategy.
- Resolve teams through stable FIFA code plus historical country identity.
- Normalize aliases without losing display names: Korea Republic/South Korea, United States/USA, Cabo Verde/Cape Verde, Côte d'Ivoire/Ivory Coast, Congo DR/DR Congo and similar cases found in the data.
- Preserve Unicode/diacritics. Use search-normalized fields separately from display fields.
- Resolve players using source ID, team, date of birth and tournament context; names alone are insufficient.
- Resolve venues through source ID plus city/country; do not merge stadiums solely by a marketing name.
- Keep source IDs out of public URLs when the existing application uses stable slugs.
- Detect and report ambiguous matches instead of silently creating duplicates.

## Import architecture

Implement or repair a staged pipeline with explicit boundaries:

1. `extract`: read the packaged files without mutating the database.
2. `validate`: parse with Zod, validate enums/dates/numbers and run cross-file invariants.
3. `stage`: map source rows into internal DTOs and produce a dry-run reconciliation report.
4. `resolve`: map external identities to canonical IDs and list create/update/skip/conflict counts.
5. `load`: write in dependency order using bounded, retryable batches.
6. `verify`: query the database independently and rerun invariants.
7. `index`: rebuild or incrementally update PostgreSQL search documents only after verification.
8. `publish`: enable UI discovery only after staging verification and tests pass.

Dependency order should normally be:

Tournament/Countries → Teams → Stadiums/Referees → Players → SquadPlayers → Matches → Goals/Bookings/PenaltyKicks → verified Awards → optional reconciled statistics → search documents.

Substitutions are blocked until a trusted source provides player-in, player-out and minute. Do not infer them from total minutes.

### Transaction and restart strategy

- Do not wrap all 2026 operations in one Prisma interactive transaction.
- Use deterministic batches appropriate to the existing schema, typically 25–100 records.
- Keep each transaction short and bounded.
- Record an import run ID, source checksum, started/completed timestamps, counts and failures using the existing audit mechanism; add an additive import-run model only if no equivalent exists.
- Create checkpoints by entity and source offset so a failed run can resume.
- Re-running the same source checksum must converge to the same state without duplicates.
- A partial failure must report what committed and what remains; it must not claim atomic success.
- Use a database/advisory lock or equivalent to prevent concurrent 2026 imports if supported by the current architecture.
- Do not automatically delete canonical rows missing from a later source snapshot.

### CLI safety

Provide commands with distinct modes, adapted to repository conventions:

- `validate`: filesystem and cross-file validation only.
- `dry-run`: read-only database reconciliation and planned operations.
- `write`: local/staging write.
- `verify`: post-import database checks.
- `resume`: continue a failed run from its checkpoint.

Print a redacted database target summary before writes. Refuse obvious production hosts unless the explicit production confirmation flag is present. Never print credentials.

## Data-specific reconciliation requirements

- Preserve raw source rows in `RawSourceRecord` or the existing equivalent, including URL, checksum, retrieved date and payload.
- `01_verified_official` may become canonical after schema mapping and identity validation.
- `02_import_candidates` may be staged and reconciled; it must not bypass trust status.
- Never import `03_quarantine/player_stats_2026_unverified.csv` into public cumulative player statistics until conflicts are resolved.
- Use FIFA's official award minutes for award presentation.
- Treat zero-minute non-starters in the lineup candidate as unused squad members.
- Team statistics must retain `data_source` and `last_updated`; omit values whose provenance or usage rights cannot be established.
- Do not import candidate market values, predictions, betting data, rankings or ELO fields.
- Use `NULL`, not zero, for unavailable statistics.
- Distinguish ordinary penalties from penalty-shootout kicks.
- Own goals must count toward the team score but not a player's ordinary goal total.
- Do not model assists as independent goal events if the existing Goal entity supports an assister relationship; transform according to the canonical schema.
- Validate red/yellow card semantics against the existing Booking model.
- Keep VAR reviews only if the schema supports them without distorting other event types.

## Schema evolution

First adapt to the current schema. Add fields/tables only when the 48-team format or provenance cannot be represented correctly.

Any migration must:

- Be additive and safe on a populated production database.
- Include indexes for actual 2026 queries and unique constraints supporting idempotency.
- Preserve old API contracts or introduce backward-compatible DTO fields.
- Include a down/rollback strategy appropriate to the repository's migration tooling, without deleting imported data automatically.
- Avoid tournament-year-specific column names.
- Support future tournaments rather than only 2026.

Pay special attention to whether stages and brackets are modeled as fixed enums. The round of 32 must be first-class, not shoehorned into round of 16.

## Website and visualization requirements

Use existing design tokens, typography, layouts and reusable components. The result should feel native to WorldCup Nexus, not like a microsite pasted on top.

### Tournament overview

Enhance the existing 2026 tournament route with:

- Champion hero showing Spain, final score, host nations, dates and verified headline statistics.
- Tournament summary: 48 teams, 104 matches, 308 goals, 16 venues and attendance 6,810,966.
- Clear source/last-verified metadata.
- Navigation to groups, bracket, matches, teams, players, stadiums, awards and records.

### Groups

- Render all 12 groups A–L.
- Support the eight best third-placed teams without hard-coded bracket assumptions.
- Reuse the existing table component where possible.
- If official final group ranking is not independently verified, calculate a provisional table from verified results but do not label it official; document unimplemented tie-break dimensions.

### Knockout bracket

- Support Round of 32 → Round of 16 → quarter-finals → semi-finals → third-place → final.
- Render a usable responsive bracket on desktop and a round-by-round card/accordion experience on narrow screens.
- Clearly show extra time and shootout results without adding shootout goals to the normal score.
- Preserve keyboard navigation and screen-reader labels.

### Matches and match details

- Add 2026 to the existing filters and newest-to-oldest timeline.
- Ensure the 104-match set is paginated or virtualized according to the current architecture.
- Match detail should reuse canonical components for score, venue, referee, lineups, goals, cards and shootouts.
- Display an explicit incomplete-data state where substitutions or unverified advanced statistics are unavailable.
- Do not hide missing fields with fabricated zeros.
- Add regression coverage for the prior `/matches` HTTP 400 issue.

### Awards

- Create or extend an awards section using the official records.
- Visually distinguish Golden/Silver/Bronze Ball and Boot, Golden Glove, Young Player and Fair Play.
- Link player and team recipients to canonical profiles.
- Use tasteful motion consistent with the site's reduced-motion behavior; avoid expensive continuous animation.
- Include accessible text labels rather than relying on medal colors alone.

### Teams, players and stadiums

- Connect 2026 squad participation to canonical player profiles without duplicating existing people.
- Show tournament-specific squad number/position and appearance data only when verified.
- Add host/stadium exploration using the existing map capability if present; do not add a second mapping library.
- Preserve source attribution and media credits.

### Homepage and discovery

- Update archive counts dynamically from canonical data.
- Feature the completed 2026 tournament without removing existing historical modules.
- Add source-backed 2026 records/facts to Discovery Vault only after verification.
- Avoid hard-coded champion/award content in UI components; fetch it through the normal query/service layer.

### Search and SEO

- Index the 2026 tournament, teams, matches, players, venues and awards through PostgreSQL search.
- Do not reintroduce a runtime dependency on paid Meilisearch.
- Verify accent-insensitive and alias searches such as `Mbappe` → `Mbappé` and `Cubarsi` → `Cubarsí`.
- Add canonical metadata, structured data and sitemap entries through existing SEO utilities.
- Do not duplicate URLs or create conflicting slugs.

## API, rendering and performance requirements

- Preserve DTO boundaries; never expose raw ingestion payloads.
- Validate filters, page sizes, years and IDs with Zod.
- Avoid N+1 queries on 48-team squads, 104 matches and event timelines.
- Select only required columns and use database indexes proven by query plans where appropriate.
- Prefer Server Components for data-heavy archive views; isolate only interactive controls as client components.
- Use streaming/loading states consistent with the current app.
- Keep animations compositor-friendly and honor `prefers-reduced-motion`.
- Avoid shipping the full tournament dataset to the browser.
- Define cache/revalidation behavior explicitly. Completed historical data can be cached aggressively after import versioning.
- Existing 1930–2022 page performance must not regress materially.

## Testing strategy

### Data/unit tests

- Zod parsing for every input file.
- Identity alias and diacritic normalization.
- Scoreline/event reconciliation.
- Extra-time and shootout semantics.
- Own-goal and assist transformations.
- Idempotent upsert keys.
- Official source precedence over conflicting candidates.
- Null handling versus zero.

### Integration tests

- Fresh database import.
- Re-run of identical snapshot produces zero duplicates.
- Interrupted batch resumes correctly.
- Conflicting snapshot generates a report and does not silently overwrite official data.
- Older tournament counts remain unchanged.
- Search documents are created only after verification.
- Production guard refuses writes without explicit confirmation.

### UI tests

- 2026 tournament overview.
- Twelve group tables.
- Round-of-32 responsive bracket.
- Match list filters and pagination.
- Match with regular finish, extra time and penalty shootout.
- Awards section and profile links.
- Missing substitution/advanced-stat state.
- Search for accent and alias variants.
- Mobile widths 375/390, tablet 768 and desktop 1280/1440.
- Keyboard navigation, focus order, landmarks, contrast and reduced motion.

### Regression gates

Run the repository's exact commands for:

- TypeScript/typecheck.
- Lint.
- Unit tests.
- Integration tests.
- Production build.
- Playwright E2E.
- Database validation.
- Search verification.

Add focused regression tests for at least two older tournaments, including one with a penalty shootout, to prove the generalized 2026 changes did not alter historical behavior.

## Observability and operations

- Log import run ID, entity, batch number, inserted/updated/skipped/conflict counts and elapsed time.
- Redact connection strings and secrets.
- Add structured errors that identify source row and validation rule.
- Expose data freshness/source status through an internal health or verification command, following existing conventions.
- If the app already uses Sentry or another error platform, add contextual tags without sending raw source payloads or personal data.
- Document how to resume, verify and safely abandon an incomplete import.

## Rollout plan

1. Validate source package and manifest locally.
2. Run repository audit and implement on the feature branch.
3. Run dry-run against an empty/local database.
4. Import locally and validate all invariants.
5. Run the full regression suite and visual checks.
6. Take or confirm a recoverable staging database backup.
7. Import to staging using short batches; verify counts, samples, routes and search.
8. Enable the 2026 UI in staging and complete acceptance testing.
9. Produce a production change plan with exact commands, estimated duration and rollback checkpoints.
10. Stop for explicit approval before any production database write, push, merge or deployment.
11. After approved production import, verify the database before rebuilding search and enabling public discovery.

## Required deliverables

Create or update, following repository conventions:

- Repository audit and current-vs-proposed architecture report.
- Data mapping and reconciliation report.
- Additive Prisma migration only if needed.
- Validated, idempotent, resumable importer.
- Dry-run/verify/resume commands.
- Source provenance records.
- 2026 UI and visualizations integrated into existing components.
- PostgreSQL search update.
- Unit, integration and E2E regression tests.
- Operations runbook with staging and production commands.
- Rollback/recovery plan.
- Final implementation report listing files changed, decisions, remaining data gaps and test evidence.

## Definition of done

Do not declare completion unless all of the following are true:

- All mandatory 2026 invariants pass against the post-import database.
- The official award set is correct and linked to canonical entities.
- Import re-run is idempotent.
- Historical tournament data is unchanged.
- No unresolved duplicate team/player/stadium identities exist.
- Quarantined player minutes and missing substitutions are not represented as verified facts.
- 2026 works through existing APIs and shared UI architecture.
- Groups A–L and the Round of 32 render correctly across mobile and desktop.
- Regular, extra-time and shootout matches display correctly.
- Search returns 2026 entities without requiring paid Meilisearch.
- Typecheck, lint, tests, production build and Playwright pass, or every pre-existing failure is proven and documented.
- No production write, push, merge or deploy occurred without explicit authorization.

## Required final response format

Return:

1. Executive outcome.
2. Repository architecture discovered.
3. Data imported and data intentionally withheld.
4. Schema and code changes with file paths.
5. UI/visualization changes.
6. Validation totals and reconciliation decisions.
7. Test/build evidence with exact commands and results.
8. Staging rollout instructions.
9. Production plan requiring explicit approval.
10. Remaining risks or source gaps.

Be precise. Never say “all tests pass” without listing the commands and observed results. Never call candidate data “official” unless its value is independently confirmed by an official source.

---

