# WorldCup Atlas

**Every World Cup. Every Nation. Every Match.**

WorldCup Atlas is an independent historical archive of the FIFA World Cup:
every imported tournament, nation, player, match, goal, card, substitution,
and penalty — browsable, searchable, and exportable.

> WorldCup Atlas is an independent project and is **not affiliated with
> FIFA**.

## Tech stack

- Next.js (App Router) + TypeScript
- MUI (+ MUI X Data Grid Community)
- Prisma 7 + PostgreSQL
- Meilisearch (global search)
- Docker Compose (local infrastructure)
- pnpm, Vitest, Playwright, ESLint, Prettier

## Quickstart

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:generate
pnpm prisma migrate dev
pnpm data:download
pnpm data:import -- --reset
pnpm search:index
pnpm dev
```

Open http://localhost:3000.

## Key commands

| Command                    | Purpose                               |
| -------------------------- | ------------------------------------- |
| `pnpm dev` / `build`       | Run / build the app                   |
| `pnpm data:download`       | Cache source CSVs                     |
| `pnpm data:import`         | Normalize source data into PostgreSQL |
| `pnpm search:index`        | Build the Meilisearch index           |
| `pnpm data:verify`         | Data integrity checks                 |
| `pnpm data:verify:queries` | Page query layer checks               |
| `pnpm search:verify`       | Search checks                         |
| `pnpm export:verify`       | Export (CSV/JSON) checks              |
| `pnpm public:verify`       | Public route / SEO file checks        |

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production notes.

## Recommended local validation

```bash
pnpm public:verify && pnpm export:verify && pnpm search:verify
pnpm data:verify:queries && pnpm data:verify
pnpm typecheck && pnpm lint && pnpm build
pnpm test:e2e
```

## Status

Checkpoints 1–7A complete: app shell, data pipeline (download → import →
verify), query layer, DB-backed pages (home, tournaments, matches,
countries, players, records, explorer), Meilisearch global search, explorer
filters + CSV/JSON export, and SEO/attribution polish. Remaining roadmap:
standings/bracket views, source reconciliation, deployment.

See [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) for the full
checkpoint log.

## Data source and attribution

All historical data comes from the
[Fjelstul World Cup Database](https://www.github.com/jfjelstul/worldcup) by
Joshua C. Fjelstul, Ph.D. — © 2023 Joshua C. Fjelstul, Ph.D., published
under the
[CC-BY-SA 4.0 license](https://creativecommons.org/licenses/by-sa/4.0/legalcode).
WorldCup Atlas normalizes the original CSVs into a relational database and
derives display fields and aggregates; modifications are documented in
[docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) and
[docs/DATA_ISSUES.md](docs/DATA_ISSUES.md). Attribution details are also on
the in-app [Sources page](http://localhost:3000/sources).
