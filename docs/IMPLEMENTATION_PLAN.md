# WorldCup Atlas — Implementation Plan

## Rule: one checkpoint at a time

Do not start the next checkpoint until the current one's acceptance criteria are fully met. Each checkpoint must be independently deployable or at minimum independently verifiable.

---

## Checkpoint 1 — Next.js + MUI app running

**Status: complete**

**Summary:** Next.js + MUI frontend app runs.

### Acceptance criteria

- `pnpm dev` starts without errors
- App renders at `localhost:3000`
- MUI theme provider is wired up (`src/theme/theme.ts`)
- Dark navy/gold palette is applied
- TypeScript compiles clean (`pnpm typecheck`)
- ESLint passes (`pnpm lint`)

---

## Checkpoint 2 — Local data backbone

**Status: complete**

**Summary:** Docker Compose, PostgreSQL, Meilisearch, Prisma 7 config, initial schema, Prisma client helper, placeholder scripts, and `/api/health` are set up.

### Deliverables

- `docker-compose.yml` with PostgreSQL and Meilisearch services
- `.env.example` with all required env vars documented
- Prisma initial schema (`prisma/schema.prisma`)
- Prisma client singleton helper (`src/lib/prisma.ts`)
- `/api/health` route handler returning DB and search service status

### Acceptance criteria

- `docker compose up` starts PostgreSQL and Meilisearch without errors
- `pnpm prisma migrate dev` applies schema to local DB without errors
- `GET /api/health` returns `200` with `{ db: "ok", search: "ok" }`
- `.env.example` documents every variable used in the app
- No hardcoded credentials in source

---

## Checkpoint 3 — Static app shell

**Status: complete**

**Summary:** Static WorldCup Atlas app shell is built with `AppShell`, `Navbar`, `Footer`, `PageContainer`, `SectionHeading`, `StatCard`, `GlobalSearch` placeholder, entity cards (tournament, match, country, player, record), a clearly labeled mock-data file, and the homepage shell.

### Deliverables

Component library under `src/components/`:

- `AppShell` — wraps all pages with Navbar + Footer + main content area
- `Navbar` — site-wide navigation with logo and links
- `Footer` — data attribution, legal disclaimer, links
- `PageContainer` — max-width constrained content wrapper
- `SectionHeading` — consistent section title with optional subtitle
- `StatCard` — key stat display (e.g. "22 tournaments", "2,548 goals")
- `TournamentCard` — clickable card with year, host, winner
- `MatchCard` — score display with teams, date, round
- `CountryCard` — flag placeholder, country name, appearances count
- `PlayerCard` — name, nationality, position, key stat
- `GlobalSearch` — search input placeholder (not wired to data yet)

### Acceptance criteria

- All components render in a Storybook story or a `/dev/components` page (mock data allowed, must be clearly labeled)
- No real historical data hardcoded in component defaults
- TypeScript passes
- ESLint passes
- All components use MUI only (no Tailwind, no raw CSS files)
- Visual style matches `docs/UI_STYLE_GUIDE.md`

---

## Checkpoint 4A — Data source audit and downloader

**Status: complete**

**Summary:** Source manifest (`src/server/import/source-manifest.ts`), downloader (`pnpm data:download`), header inspection (`pnpm data:inspect`), local cache under `data/sources/fjelstul/`, and attribution notes in `docs/DATA_SOURCES.md`.

### Deliverables

- Inspection notes on the Fjelstul World Cup Database structure (files, entities, relationships)
- Source manifest documenting each selected source file: origin URL, entity, license
- Data download/cache folder for source files (kept out of version control as appropriate)
- Downloader that fetches the selected source CSV files into the cache folder
- Header inspection of each downloaded CSV, documented
- Attribution and source notes recorded per `docs/DATA_SOURCES.md`

### Constraints

- Do not normalize or import into the database yet
- Do not invent data

### Acceptance criteria

- Selected Fjelstul CSV files are downloaded into the local cache folder
- Source manifest lists every downloaded file with origin and license (CC BY 4.0)
- CSV headers are inspected and documented
- No database writes occur
- Attribution and source notes are documented

---

## Checkpoint 4 — First database seed and import

**Status: split into 4B (complete) and 4C (complete)**

### Scope split

**Checkpoint 4B — core normalized import (complete):** imports the core
foundation data from cached Fjelstul CSVs: raw source records, tournaments,
countries, teams, players, stadiums, referees, matches, and squads
(`pnpm data:import`, verified by `pnpm data:verify`).

**Checkpoint 4C — event and awards import (complete):** imports event-level
data from cached Fjelstul CSVs: goals, bookings (cards), substitutions,
penalty kicks (shootouts), and awards. Also resolves source-backed
`Tournament.goalsCount` and `runnerUpTeamId` (losing finalist of the decided
final). Raw source records now cover all 13 selected datasets. Source quirks
are logged in `docs/DATA_ISSUES.md` (ISSUE-006…008).

**Checkpoint 4D — query layer and stats foundation (complete):** typed
server-side query layer under `src/server/queries/` (home, tournaments,
matches, countries, players, records) returning frontend-friendly DTOs
(`types.ts`) — no raw Prisma models or `RawSourceRecord` payloads reach
pages. Includes a records/leaderboard foundation computed strictly from
imported data, a dev-only `/api/dev/data-summary` route, and a page-query
verification script (`pnpm data:verify:queries`).

**Next:** Checkpoint 5 builds DB-backed pages on top of these query
functions (`getHomePageData`, `getTournamentByYear`, `getMatchByIdOrSlug`,
`getCountryProfile`, `getPlayerProfile`, `getRecordsOverview`).

### Deliverables

- Import scripts under `scripts/import/`
- Source data downloaded or documented for download from Fjelstul World Cup Database
- Prisma seed script (`prisma/seed.ts`) that runs the import pipeline
- Basic data verification scripts under `scripts/verify/`

### Acceptance criteria

- `pnpm prisma db seed` completes without errors
- All tournaments (1930–present) have records in the database
- At least one tournament (1986) has full match, goal, card, and squad data
- Verification scripts report no critical data errors
- No invented data — all values traceable to a source
- Any source conflicts logged in `docs/DATA_ISSUES.md`

---

## Checkpoint 5 — First real vertical slice

**Status: not started**

### Deliverables

Pages wired to live database:

- `/` — Home with real stats and featured tournament
- `/tournaments` — All tournaments list from DB
- `/tournaments/1986` — 1986 tournament detail
- `/tournaments/1986/matches/[matchId]` — 1986 final match detail
- `/countries/brazil` — Brazil country page
- `/players/diego-maradona` — Diego Maradona player page

### Acceptance criteria

- All six pages render without errors using real DB data
- No mock data labels visible in production paths
- Meilisearch index populated; search returns results for "Maradona" and "Brazil"
- TypeScript passes
- ESLint passes
- Build passes (`pnpm build`)
- No official FIFA branding or affiliation claims

---

## Checkpoint 6 — Search and data explorer

**Status: not started**

### Deliverables

- `/search` — Full global search page with Meilisearch integration
- `/explorer` — Data explorer with MUI X Data Grid, filters, and pagination
- Search index covers: tournaments, matches, countries, players
- Explorer covers: matches, goals, cards

### Acceptance criteria

- Search returns relevant results across all indexed entities
- Explorer renders large datasets without performance degradation
- Filters work correctly with URL state (shareable URLs)
- TypeScript passes
- ESLint passes
- Build passes

---

## Checkpoint 7 — Full MVP polish and deployment

**Status: not started**

### Deliverables

- All MVP pages from `docs/MVP_SCOPE.md` complete
- `/about` and `/data` pages with attribution and legal copy
- Performance audit (Core Web Vitals acceptable)
- `README.md` updated with setup instructions
- Deployment configuration (Vercel or equivalent)
- Environment variable documentation complete

### Acceptance criteria

- All MVP pages listed in `docs/MVP_SCOPE.md` render without errors
- Lighthouse performance score ≥ 80 on key pages
- No TypeScript errors
- No ESLint errors
- Build passes
- Deployment succeeds
- Data attribution is visible and accurate
- No official FIFA branding introduced
