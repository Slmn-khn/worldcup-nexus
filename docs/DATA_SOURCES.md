# WORLDCUP Nexus — Data Sources

## Rule: no invented data

Historical data must never be invented or estimated. Every stat, score, goal, card, player name, and date must be traceable to a cited source. If a value cannot be verified, it must be omitted or flagged as unverified in the UI.

Temporary mock data is permitted only during UI development (Checkpoints 2–3) and must be:

- Clearly labeled in code with a `// MOCK` comment
- Never exposed in production routes that serve real data
- Replaced before Checkpoint 5 acceptance

---

## Primary source: Fjelstul World Cup Database

**Repository:** `jfjelstul/worldcup` (GitHub)
**Maintainer:** Joshua Fjelstul
**License:** CC-BY-SA 4.0

### Coverage

- All FIFA World Cup tournaments: 1930–2022 (as of original release)
- Tournaments, groups, stages, matches, teams, players, goals, cards, substitutions, penalty kicks, squads, manager records, stadium records, awards

### Key files (CSV-based dataset)

| File                       | Entity                                 |
| -------------------------- | -------------------------------------- |
| `tournaments.csv`          | Tournament metadata                    |
| `teams.csv`                | National teams                         |
| `players.csv`              | Player records                         |
| `matches.csv`              | Match results and metadata             |
| `goals.csv`                | Individual goal events                 |
| `bookings.csv`             | Yellow and red card events             |
| `substitutions.csv`        | Substitution events                    |
| `penalty_kicks.csv`        | Individual penalty kick outcomes       |
| `squads.csv`               | Tournament squad lists                 |
| `manager_appointments.csv` | Manager records by tournament          |
| `award_winners.csv`        | Golden Ball, Golden Boot, Golden Glove |

### Import strategy

- Import raw CSVs into staging tables (`raw_*`) first
- Validate and normalize into production tables
- Log any rows that fail validation in `docs/DATA_ISSUES.md`

### Local source acquisition (Checkpoint 4A)

Checkpoint 4A only downloads and inspects source files. It does **not**
normalize or import anything into the database — that happens in Checkpoint 4.

- **Manifest:** `src/server/import/source-manifest.ts` lists every selected
  dataset with its raw GitHub URL, local cache path, and required flag. The
  selected subset for the first import pipeline: tournaments, teams, players,
  stadiums, referees, qualified_teams, matches, squads, goals, penalty_kicks,
  bookings, substitutions, award_winners.
- **Download:** `pnpm data:download` fetches the CSVs from the repository's
  `data-csv` folder into `data/sources/fjelstul/raw/` (skips cached files;
  `--force` re-downloads).
- **Inspect:** `pnpm data:inspect` reads the header row of each cached CSV and
  writes `data/sources/fjelstul/reports/headers.json`.
- Downloaded CSVs and generated reports are git-ignored; only the cache folder
  structure is committed.
- Fjelstul remains the primary source and its CC-BY-SA 4.0 attribution
  requirements must be preserved end to end. OpenFootball remains secondary /
  reference only (see below).
- Any transformation applied to source data in later checkpoints must be
  documented (in import script comments and, for conflicts or corrections, in
  `docs/DATA_ISSUES.md`). Checkpoint 4A applies no transformations — files are
  cached byte-for-byte as downloaded.

---

## Secondary source: OpenFootball World Cup data

**Repository:** `openfootball/world-cup` (GitHub)
**License:** Public domain

### Purpose

- Cross-reference and verify match results, scores, and tournament bracket data
- Fill gaps in Fjelstul data for edge cases
- Not used as the primary import pipeline

### Usage rules

- Use OpenFootball data only when the Fjelstul dataset has a confirmed gap or conflict
- Document every case where OpenFootball data overrides Fjelstul in `docs/DATA_ISSUES.md`

---

## Live fixtures: 2026 schedule & scores

The 2026 schedule/scores feature uses a **separate** pipeline from the historical
Fjelstul archive (it lands in the `Fixture` table, never in `Match`). It is
source-attributed and synced into PostgreSQL before rendering — the browser
never calls these providers. See `docs/FEATURE_2026_SCHEDULE.md` for the full
design.

| Provider | Role | Priority (lower wins) | Trust |
| --- | --- | --- | --- |
| OpenFootball `worldcup.json` (2026) | Baseline schedule, venues, groups, basic results | 50 | Stable open data, not guaranteed live |
| worldcup26.ir API (optional) | Live scores / current status | 10 | Non-authoritative community source; fails gracefully |
| Official FIFA fixtures page | Manual verification reference only — **not scraped** | — | Reference only |

- OpenFootball is the **stable baseline** for 2026 fixtures, and the
  **production default** is `openfootball-only` — worldcup26 is not called at
  all unless explicitly enabled. The Fjelstul database stays the primary source
  for all **historical** (≤ 2022) data.
- worldcup26 is **optional**, used only for live/current updates when configured
  (`FIXTURE_SYNC_PROVIDER_MODE=openfootball-first` or `live-first` plus a
  `WORLDCUP26_API_BASE_URL`). Its endpoint is `…/get/games`. If it returns 404 /
  is unavailable, the sync logs a non-fatal warning and the app falls back to
  the OpenFootball baseline.
- External provider data is synced **server-side** into PostgreSQL; the frontend
  renders from our database, and no provider is ever called from the browser.
- Each provider's rows are stored separately; the canonical per-match view is
  computed at read time. Provider conflicts are resolved by `sourcePriority` and
  documented in `docs/FEATURE_2026_SCHEDULE.md` (and `docs/DATA_ISSUES.md` when a
  specific conflict is found).
- worldcup26.ir is community-maintained and non-authoritative; if it appears in
  production it is credited via the per-fixture source line, and its data is
  treated as provisional until verified against the official FIFA page.
- WorldCup Nexus / WorldCup Atlas is an independent archive and is **not
  affiliated with FIFA**; no official FIFA logos or branding are used.

## Additional reference sources

The following are acceptable as reference for verification only. They must not be used as automated import sources without documented review:

- Wikipedia match articles (for result verification)
- RSSSF (Rec.Sport.Soccer Statistics Foundation) historical records
- Official FIFA match reports (where publicly accessible)

---

## Attribution requirements

### In the product

- `/about` and `/data` pages must credit the Fjelstul World Cup Database with a link to the source repository and the CC-BY-SA 4.0 license
- OpenFootball must be credited if any of its data appears in production
- Attribution must be visible without requiring a user to navigate deep into the site

### In the codebase

- Import scripts must reference the source dataset in a top-level comment
- Any data file checked into the repo must include the source in its header or an adjacent `SOURCE.md`

---

## Data conflict handling

When source data conflicts are identified:

1. Document the conflict in `docs/DATA_ISSUES.md` using the issue template
2. Apply the Fjelstul value as default unless there is strong evidence it is incorrect
3. If the conflict cannot be resolved, mark the value as `disputed` in the database and surface a note in the UI where appropriate
4. Never silently pick one value without documentation
