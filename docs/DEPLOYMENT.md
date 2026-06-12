# WORLDCUP Nexus — Deployment

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

Verification suite (recommended before any deploy):

```bash
pnpm data:verify
pnpm data:verify:queries
pnpm search:verify
pnpm export:verify
pnpm public:verify
pnpm security:verify
pnpm audit
pnpm typecheck && pnpm lint && pnpm build
pnpm test:e2e          # Playwright smoke tests (needs DB + app running or webServer)
```

## Known caveats

- **Detail-route not-found pages return HTTP 200.** Dynamic detail routes
  (`/tournaments/[year]`, `/matches/[idOrSlug]`, `/countries/[slug]`,
  `/players/[slug]`) stream through a `loading.tsx` boundary, so when an
  entity is missing the not-found UI renders correctly but the HTTP status
  is 200 (the shell was already sent). Mitigation in place: the fallback
  metadata for those pages sets `robots: noindex`, so crawlers will not
  index them. The global catch-all not-found returns a true 404. A full fix
  would mean removing the skeleton loading states from those routes —
  deliberately not done; revisit only if SEO audits demand it.

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
   runtime, not just at build time. Exception: the sitemap revalidates
   daily (`revalidate = 86400`, Checkpoint 8B) and is generated at build
   time — the build environment also needs database connectivity.

## Security hardening (Checkpoint 8B)

The application ships with the following baked in (see
`docs/SECURITY_HARDENING_PLAN.md` for the full status table):

- **Security headers** on every route via `next.config.ts`: nosniff,
  Referrer-Policy, X-Frame-Options DENY, Permissions-Policy, COOP/CORP,
  and a **Report-Only** CSP. **HSTS**
  (`max-age=63072000; includeSubDomains; preload`) is emitted only when
  `NODE_ENV=production` — confirm the deployed site is HTTPS-only before
  go-live, since HSTS pins browsers to HTTPS for two years.
- **Report-Only CSP**: observe violation reports in browser consoles /
  platform tooling for 1–2 weeks, then switch to enforcement (plan P2.1).
- **API rate limiting** (in-memory, fixed-window, per IP):
  search/explorer 60 req/min, export 6 req/min, health 120 req/min,
  returning 429 + `Retry-After`. **This is per process/instance** —
  counters reset on redeploy and are not shared across instances. For
  serious traffic, add platform/WAF or shared-store rate limiting and
  treat the in-app limiter as defense-in-depth. Client identity comes
  from `x-forwarded-for` / `x-real-ip` / `cf-connecting-ip`; ensure the
  platform/proxy sets one of these (otherwise all clients share one
  "unknown" bucket).
- **Production-safe API errors**: routes log full errors server-side and
  return only stable public messages; the `detail` field exists in
  development only.
- **CSV export** neutralizes spreadsheet formula injection and is capped
  at 5,000 rows; the download is `worldcup-nexus-explorer.csv`.

### Deployment-time guarantees (plan P0.4 — not code)

- [ ] `NODE_ENV=production` on the platform (gates the dev endpoint,
      enables HSTS).
- [ ] Scoped **search-only** Meilisearch key for the app; master key
      vaulted; Meilisearch on a private network, port 7700 not public;
      `MEILI_ENV=production`.
- [ ] Least-privilege Postgres **runtime role (SELECT-only)**; separate
      role for migrations/import.
- [ ] All env vars set in the platform: `DATABASE_URL`,
      `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY`, `NEXT_PUBLIC_SITE_URL`.
- [ ] HTTPS enforced; verify HSTS header appears after deploy.
- [ ] Automated DB backups with tested restore.
- [ ] Logs/alerts wired: monitor 5xx and 429 rates and `/api/export`
      volume.

## Non-negotiables

- No secrets committed to the repository.
- Source attribution must remain visible: the footer links to `/sources`,
  which carries the CC-BY-SA 4.0 attribution required by the Fjelstul World
  Cup Database license. Removing it would violate the data license.
- The independent-project disclaimer ("not affiliated with FIFA") must
  remain visible in the footer and on `/sources` and `/about`.
