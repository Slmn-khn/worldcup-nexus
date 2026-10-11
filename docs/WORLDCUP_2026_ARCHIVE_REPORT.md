# 2026 World Cup — canonical archive promotion report

Date: 2026-10-11 · Branch: `feat/world-cup-2026-complete-archive` ·
Input: `docs/worldcupnexus_2026_data` (manifest sha256 `952c69ad…74768a`).
Operations: [`RUNBOOK_2026_ARCHIVE.md`](./RUNBOOK_2026_ARCHIVE.md). Open data
issues: [`DATA_ISSUES.md`](./DATA_ISSUES.md) ISSUE-010…016.

## 1. Repository audit (before → after)

| Area | Found | 2026 impact | Change | Risk | Tests |
| --- | --- | --- | --- | --- | --- |
| Data model | Canonical archive (Fjelstul, 30 editions incl. 8 women's) + a **parallel quarantined** `WorldCup2026*` model; no group, extra-time, placing, attendance or award-rank fields | 2026 lived outside canonical queries, records, explorer, country/player pages | Additive migration `20261011055725`: `Match.groupName/extraTime`, `Tournament.third/fourthPlaceTeamId/attendance/hostCountries/sourceUrl/verificationStatus`, `Stadium.capacity/lat/long`, `Award.rank/sourceUrl/verificationStatus/details`, `RawSourceRecord` provenance columns, `DataImportRun` + `DataImportCheckpoint` | Low — nullable/additive, verified on a populated DB and a fresh DB | integration |
| Importer | `import-mominul-2026.ts` wrote only quarantine tables; previous failure was a single long interactive transaction | No canonical import existed; README demanded an approval gate | New pipeline `src/server/import/wc2026/` (extract → validate → stage → resolve → plan → load → verify) + CLI `scripts/2026/import-wc2026-bundle.ts` | Medium (data) — mitigated by gates, idempotent upserts, checkpoints | unit + integration |
| Stages | `Match.stage` is free text; 2014–2022 use lowercase plural forms | Round of 32 had no canonical home | `"round of 32"` first-class; bracket model is stage-ordered, not fixed to 16 teams | Low | unit, e2e |
| Tournament page | `/tournaments/[year]` short-circuited 2026 to `Wc2026Hub` reading quarantine tables (with xG, ELO, market values, unverified player stats) | Published fields the new policy blocks | New canonical `TournamentArchiveHub` for tournaments with group data; quarantine hub kept only as pre-promotion fallback | Low | e2e |
| Match pages | `/matches/[slug]` canonical; `/matches/2026/[id]` quarantine | Duplicate URLs for one match | Canonical page gains extra-time, group, outcome-incomplete and "not recorded" states; legacy routes redirect (streamed meta-refresh, sitemap removed) | Low | e2e |
| `/matches` | Lenient param parsing (no Zod); no 400 path | 2026 absent from the list | 2026 now included automatically; regression test for bad params | Low | e2e |
| Awards | Fjelstul awards, no rank/source | 2026 awards absent ("not included in dataset") | 9 FIFA-official awards with rank, source URL and published figures; awards section with text tiers | Low | integration, e2e |
| Search | Postgres FTS + pg_trgm; no accent folding; 2026 from quarantine docs | "Mbappe" didn't reliably find "Mbappé"; duplicate 2026 docs after promotion | Folded keyword per doc (once), country aliases from the reviewed table, venue docs, per-doc provenance; quarantine docs suppressed post-promotion | Low | unit, `search:verify` |
| Meilisearch | Removed from code/deps/env examples | — | None. **Live `MEILISEARCH_*` keys still sit in the untracked `.env.production.local` — rotate them.** | Security | — |
| SEO | DB sitemap, no canonical/JSON-LD | Duplicate 2026 URLs in sitemap | Sitemap lists canonical URLs only; `alternates.canonical` + `SportsEvent` JSON-LD on hub tournaments | Low | e2e |
| Copy | "1930–2022 / 2026 lives in the hub" hard-coded in 6 places | False after promotion | Computed from `Tournament` (`getCanonicalCoverage`) — correct before and after promotion | Low | e2e |
| Caching | Every page `force-dynamic`; sitemap `revalidate=86400` | — | Unchanged (no new caching layer introduced) | — | — |

Baseline divergences from the brief: Next.js is **16.2.12** (brief said 16.2.6); the archive includes women's World Cups (ISSUE-001), so archive totals include them.

## 2. Data imported vs withheld

| Data | Tier | Canonical target | Rows |
| --- | --- | --- | ---: |
| Tournament summary (dates, hosts, attendance 6,810,966, podium) | FIFA official | `Tournament` | 1 |
| Awards (Fair Play, Golden/Silver/Bronze Ball & Boot, Golden Glove, Young Player) | FIFA official | `Award` (+ official minutes/goals/assists in `details`) | 9 |
| Teams | candidate | `Team` (48) → `Country` (43 linked, 5 new: Curaçao, Cape Verde, Jordan, DR Congo, Uzbekistan) | 48 |
| Venues | candidate | `Stadium` (4 linked, 12 new) | 16 |
| Referees | candidate | `Referee` (17 linked, 11 new) | 28 |
| Players | candidate | `Player` (349 linked to existing profiles, 899 new) + `SquadPlayer` | 1,248 |
| Matches | candidate (final cross-checked with FIFA) | `Match` | 104 |
| Goals + own goals (assists folded into `assistPlayerId`) | candidate, reconciled with every scoreline | `Goal` | 308 |
| Shootout kicks (ordered) | candidate, reconciled with penalty scores | `PenaltyKick` (SHOOTOUT) | 30 |
| Every bundle row + identity decisions | raw | `RawSourceRecord` (source `wcn-2026-bundle`) | 8,926 |

Withheld (raw records only): bookings (47 — incomplete), VAR reviews (12), lineups/minutes (5,408 — conflict with FIFA), team match stats (208 — mixed fifa.com/sofascore provenance), player-of-the-match, all of `03_quarantine/` (cumulative player stats, market values, ELO/rankings, redundant match rows), xG.

## 3. Reconciliation decisions

- **Precedence**: FIFA official tier > existing canonical rows > candidate tier. Official rows are never silently overwritten: a later run whose official values differ from the DB reports the diff and keeps the DB value unless `--accept-official-changes` (key-order-insensitive comparison).
- **Identity**: `sourceSystem:externalId` keys (`mominul2026:match:104`, `fifa2026:award:golden-boot`, `fifa:CPV`). Countries via a reviewed FIFA-code table with alias guards (Türkiye, Côte d'Ivoire, IR Iran, Korea Republic, Czechia, Cabo Verde, Congo DR, USA). Players via own source id → reviewed override → DOB + nationality + shared name token (ambiguity blocks; cross-country look-alikes are reported, not merged). Stadiums only when name + city + country agree. Display names keep diacritics; matching folds them.
- **Names**: existing canonical names win for linked people; FIFA award names win for award winners (Pau Cubarsí, Unai Simón, Rodri). Truncated source names are not guessed (ISSUE-013).
- **Own goals** are credited to the beneficiary team (`Goal.teamId`, Fjelstul convention) and never count toward the scorer's goals.
- **Extra time**: AET/penalty results → `extraTime=true`; regular results → `false`; M96 → NULL with outcome flagged (ISSUE-016). Pre-2026 rows stay NULL (not recorded).
- **Group tables** are computed (3/1/0, GD, GF) and labelled unofficial; qualification marks come from actual Round-of-32 participation (24 + 8 best third-placed teams), so no tie-break rules are assumed.
- **Era naming**: DR Congo is a new country row beside 1974's Zaire (ISSUE-011).

## 4. Validation totals

- Bundle `prepare_bundle.py` (re-run in an isolated copy): **27/27** structural checks, regenerated files byte-identical to the shipped ones. Manifest: 34/35 files verified; `latest_validation_output.json` is a documented benign mismatch.
- Importer validation: **29 PASS, 1 KNOWN_CONFLICT (M96), 1 WARN** (duplicate display names "Ali Ahmed" ×2 and the truncated "Mc" ×7).
- Post-import verification (`pnpm data:2026:canonical:verify`): all mandatory invariants PASS — 48 teams, 12 groups A–L × 4, 1,248 squad players, 104 matches, 72/16/8/4/2/1/1, 16 venues, 308 scoreline goals = 308 `Goal` rows, shootouts reconcile, podium Spain/Argentina/England/France, final Spain 1–0 Argentina a.e.t. on 19 July 2026, 9 official awards linked, FIFA minutes 769/698 on the Boot awards, 0 substitutions/bookings fabricated, no duplicate identities, **historical fingerprint unchanged** (counts + content hashes of every pre-2026 tournament, match, player, stadium, referee and country). Knockout-outcome check: KNOWN_CONFLICT (M96 only).

## 5. Test evidence (2026-10-11, local)

| Command | Result |
| --- | --- |
| `pnpm typecheck` | exit 0 |
| `pnpm lint` | exit 0 |
| `pnpm test:unit` | 37 files, 426 tests passed |
| `pnpm test:integration` | 1 file, 9 tests passed (fresh DB, approval refusal, interrupted run → resume from checkpoint 300, award links to pre-existing Rodri without duplicates, idempotent re-run, official-conflict protection, historical fingerprint unchanged, production guard) |
| `pnpm build` (local DB env) | exit 0 |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 pnpm test:e2e` (production build) | 46 passed, 2 failed — both pre-existing on `main` (see below) |
| `pnpm data:verify`, `data:verify:queries`, `export:verify`, `public:verify`, `security:verify`, `prod:preflight`, `search:verify` | all passed (preflight: 1 documented warning) |
| `pnpm data:2026:canonical:write` ×3 (incl. after resume) | identical row counts — idempotent |

Pre-existing E2E failures, reproduced on an untouched `main` build against the same database: `responsive-layout.spec.ts` "footer brand, disclaimer, and attribution are visible" (strict-mode text match hits two elements) and "no horizontal overflow at /records" (the records page anchor nav overflows at 375 px). Neither file nor page is touched by this branch.

Dev-server note: in `pnpm dev` the streamed page content does not hydrate in this environment (same on `/tournaments/1986` on `main`), so interactive checks (bracket accordions, client navigation) were verified against the production build.

## 6. Remaining risks and gaps

- M96 outcome, 2026 bookings, substitutions, minutes, in-match penalty flags and six truncated player names need an official source (ISSUE-012…016).
- 899 new player profiles carry candidate-tier names/DOBs (FIFA names only for award winners); spot-check before production.
- Player-of-the-match, team stats and xG remain unpublished pending rights review.
- Legacy 2026 URLs redirect via Next's streamed meta-refresh (a `loading.tsx` boundary prevents a true 308); they are excluded from the sitemap.
- Year-only searches ("2026") rank individual matches above the tournament — existing behaviour shared by older years.
- Production: no migration, import, search rebuild, push or deploy has been performed.
