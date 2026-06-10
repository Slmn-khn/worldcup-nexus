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

**Status: in progress — 5A complete**

### Checkpoint 5A — DB-backed home and tournaments list (complete)

- `/` now renders from `getHomePageData()`: real archive stats, latest
  tournaments, recent finals, top nations, top scorers, and record
  leaderboard previews. Empty sections render an honest `EmptyState`
  instead of fake data.
- `/tournaments` renders from `getTournamentCards()` with loading and error
  states.
- `src/lib/mock-data.ts` deleted — no mock or hardcoded historical values
  remain in production pages.

### Checkpoint 5B — Tournament detail page (complete)

- `/tournaments/[year]` renders from `getTournamentByYear(year)`: hero
  (name, host, dates, champions/runners-up/final chips, breadcrumb), stat
  grid (teams, matches, goals, cards, substitutions, shootouts, shootout
  kicks, awards), anchor section nav, teams grid, stage-grouped match list
  (linking to future `/matches/[slug]` routes), top scorers, awards, and
  penalty shootout section.
- Invalid or missing years render a `not-found` state; route has skeleton
  loading and a client error boundary.
- Group standings / knockout bracket views are deliberately deferred until
  standings/bracket queries exist (honest placeholder text, no invented
  standings).

### Checkpoint 5C — Match detail page (complete)

- `/matches/[idOrSlug]` renders from `getMatchByIdOrSlug` (accepts database
  id, slug, or source id): hero with scoreline, penalty score, winner/draw
  chips and breadcrumb; match info grid (date, stage, stadium, location,
  match number — referee/attendance render only when imported data exists);
  chronological event timeline (goals, own goals, penalty goals, cards,
  one-sided substitution records); per-category event breakdown; penalty
  shootout view grouped by team (✓/✕ per kick, honest note when shootout
  rows are missing); related links to the tournament and both nations.
- Lineups/formations deliberately deferred (honest placeholder note — no
  invented lineups). Route has skeleton loading, client error boundary, and
  a not-found state.

### Checkpoint 5D — Countries index and country profile (complete)

- `/countries` renders from `getCountryCards()`: nation grid with
  tournaments/matches/goals/titles counts.
- `/countries/[slug]` renders from `getCountryProfile(slug)`: hero (titles,
  finals, W/D/L chips), all-time record stat grid (tournaments, titles,
  finals, matches, W/D/L, goals for/against, goal difference), tournament
  timeline (Champions/Runners-up from tournament fields only — no invented
  finishes), finals list (won/lost from the match winner), top scorers, and
  a recent-matches list with W/D/L chips linking to match pages.
- Derivations: titles via `Tournament.winnerTeamId` (counts 1950 correctly,
  which had no final); W/D/L via match winner (shootout wins count as wins);
  per-tournament finish beyond champions/runners-up is NOT derived (the
  source `performance` column is not normalized). Squad data is never
  labeled "appearances".
- Country links from match pages and the homepage now resolve.

### Checkpoint 5E — Players index and player profile (complete)

- `/players` renders from `getPlayerCards()` + `getPlayerCount()`: first 60
  players alphabetically with squads/goals/awards counts and an honest
  "showing N of total" note (search/filters arrive with global search).
- `/players/[slug]` renders from `getPlayerProfile(slug)`: hero (country
  link, position, date of birth, squads/goals/cards/penalties/awards
  chips), World Cup Record stat grid, **World Cup Squads** (squad
  selections — explicitly NOT appearances), goals, cards, penalty kicks,
  substitutions (in/out), and awards — every event row links to its match.
- Data honesty: no appearances, caps, minutes, assists, or lineups are
  derived (not in source). Opponent is omitted for own goals (ambiguous).
- Player links from tournament/country/match pages now resolve.

### Checkpoint 5F — Records page (complete)

- `/records` renders from the restructured `getRecordsOverview()`: hero with
  a data-driven scope note ("All imported tournaments" — counts of men's and
  women's editions computed from actual tournament names), four highlight
  record cards, and six categories: Team (titles, goals, wins, matches by
  nation), Player (top scorers, most awards), Match (highest-scoring,
  biggest wins, most goals by one team), Tournament (goals/matches/teams),
  Penalty (longest shootouts, most converted, most missed-or-saved), and
  Discipline (cards by player/nation/match).
- Every record item links to its real player/country/match/tournament page
  via an explicit `href` (null when no slug exists). Not implemented because
  the data is absent: appearances/caps, minutes, assists, clean sheets.
- Homepage records preview adapted to the new categorized shape.

### Checkpoint 5F.1 — Matches index page (complete)

- `/matches` (previously an unrouted navbar link) renders from the new
  `getMatchCards()` query: newest tournaments first, 60 most recent match
  cards with an honest "showing N of total" note, loading/error states.
  Query supports page/pageSize/tournamentYear for later use; advanced
  filters arrive with the data explorer.

### Checkpoint 5G — Data Explorer shell (complete)

- `/explorer` renders from the new `getExplorerData()` query: matches,
  goals, bookings, substitutions, penalty kicks, and awards normalized into
  one `ExplorerRowDto` shape, browsable in an MUI X Data Grid (Community)
  with server-side pagination. Event-type and tournament-year filters and
  page size are URL query params (shareable links); rows link to match,
  player, and tournament pages.
- Combined-view pagination merges identically-sorted windows from each
  event table (year desc, date desc, minute asc — matches sort before their
  own events). Raw source rows are not exposed (stated on the page and
  checked by the verify script).
- Deferred: full-text search (Meilisearch checkpoint), country/player
  filters, CSV/JSON export.

- Remaining for 5H+: Meilisearch-backed global search; then Checkpoint 7
  polish (about/data attribution pages, deployment).

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
