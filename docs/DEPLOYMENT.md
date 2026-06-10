# WorldCup Atlas — Deployment

## Required environment variables

| Variable               | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string (Prisma driver adapter) |
| `MEILISEARCH_HOST`     | Meilisearch server URL                               |
| `MEILISEARCH_API_KEY`  | Meilisearch API/master key                           |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (metadata, sitemap, robots)       |

Copy `.env.example` to `.env` for local development. Never commit secrets —
`.env` is git-ignored.

## Local development

```bash
docker compose up -d          # PostgreSQL + Meilisearch
pnpm install
pnpm db:generate              # generate the Prisma client (src/generated/)
pnpm prisma migrate dev       # apply schema migrations
pnpm data:download            # cache source CSVs (Fjelstul World Cup Database)
pnpm data:import -- --reset   # normalize into PostgreSQL
pnpm search:index             # build the Meilisearch index
pnpm dev                      # http://localhost:3000
```

Verification suite:

```bash
pnpm data:verify
pnpm data:verify:queries
pnpm search:verify
pnpm export:verify
pnpm public:verify
pnpm typecheck && pnpm lint && pnpm build
```

## Production notes

1. **Database** — a hosted PostgreSQL provider is required. Set
   `DATABASE_URL`, then run migrations: `pnpm prisma migrate deploy`.
2. **Search** — a hosted or self-hosted Meilisearch instance is required.
   Set `MEILISEARCH_HOST` / `MEILISEARCH_API_KEY` (use a scoped API key in
   production, not the master key, if the host supports it).
3. **Data pipeline** — run once against the production database:
   `pnpm data:download && pnpm data:import -- --reset && pnpm data:verify`.
4. **Search index** — run `pnpm search:index` after every data import
   (the index is a snapshot of the database).
5. **Site URL** — set `NEXT_PUBLIC_SITE_URL` to the production URL before
   building; metadata, Open Graph URLs, sitemap, and robots all derive from
   it.
6. **Build** — the generated Prisma client lives in `src/generated/` and is
   git-ignored: run `pnpm db:generate` before `pnpm build` in CI/CD.
7. **Pages are dynamic** — all data pages render server-side per request
   (`force-dynamic`), so the app server needs database connectivity at
   runtime, not just at build time.

## Non-negotiables

- No secrets committed to the repository.
- Source attribution must remain visible: the footer links to `/sources`,
  which carries the CC-BY-SA 4.0 attribution required by the Fjelstul World
  Cup Database license. Removing it would violate the data license.
- The independent-project disclaimer ("not affiliated with FIFA") must
  remain visible in the footer and on `/sources` and `/about`.
