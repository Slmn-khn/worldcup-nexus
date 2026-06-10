# WorldCup Atlas — Implementation Plan

## Rule: one checkpoint at a time

Do not start the next checkpoint until the current one's acceptance criteria are fully met. Each checkpoint must be independently deployable or at minimum independently verifiable.

---

## Checkpoint 1 — Next.js + MUI app running

**Status: complete**

### Acceptance criteria
- `pnpm dev` starts without errors
- App renders at `localhost:3000`
- MUI theme provider is wired up (`src/theme/theme.ts`)
- Dark navy/gold palette is applied
- TypeScript compiles clean (`pnpm typecheck`)
- ESLint passes (`pnpm lint`)

---

## Checkpoint 2 — Local data backbone

**Status: not started**

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

**Status: not started**

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

## Checkpoint 4 — First database seed and import

**Status: not started**

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
