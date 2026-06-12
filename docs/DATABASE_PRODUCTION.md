# WORLDCUP Nexus — PostgreSQL Production Notes

The app needs PostgreSQL 16+ (matches local Docker). Supabase PostgreSQL
is the recommended provider; Neon, RDS, or any hosted PostgreSQL works.
The Prisma schema is **not** modified for deployment.

## Provider setup

1. Create the database with strong, unique credentials (nothing
   resembling the local `worldcup`/`worldcup` development values).
2. Restrict network access to the app platform and the admin
   environment if the provider supports IP allowlists/private
   networking.
3. Enable automated backups from day one; test one restore before
   launch.

## Connection strings

- `DATABASE_URL` — what the app runtime uses. With a pooled provider
  (e.g. Supabase's PgBouncer endpoint, Neon's pooler), point this at the
  **pooled** endpoint: serverless platforms run many short-lived
  function instances and can exhaust direct connection slots.
- `DIRECT_URL` — the direct (non-pooled) endpoint, intended for
  migrations and bulk import, which need session-level features and
  long transactions that poolers in transaction mode don't support.
- **Current code note:** `prisma.config.ts` and the runtime adapter read
  only `DATABASE_URL` today; `DIRECT_URL` is reserved in the env
  templates. Until it is wired into `prisma.config.ts`, run migrations
  and import from the admin environment with `DATABASE_URL` temporarily
  set to the **direct** endpoint for those commands.
- Include `?schema=public` (as in the local template) unless the
  provider dictates otherwise; add `sslmode=require` if the provider
  needs it explicitly.

## Migrations

```bash
pnpm db:deploy        # prisma migrate deploy
```

- `prisma migrate deploy` is the production/staging migration command:
  it applies committed migrations in order, generates nothing, never
  resets, and fails loudly on drift.
- Avoid `prisma migrate dev` against production — it is a development
  command that can create migrations and offer destructive resets; use
  `pnpm db:deploy` instead.
- Run `pnpm db:generate` before `pnpm build` wherever the app is built
  (the generated client in `src/generated/` is git-ignored).
- Apply migrations deliberately from the admin environment — never
  automatically on boot or deploy.

## Connection pooling considerations

- The Prisma `pg` driver adapter owns a connection pool per app
  instance. On serverless (Vercel functions) each warm instance holds
  connections — watch the provider's connection count after launch.
- If connections climb: use the provider's pooled endpoint for
  `DATABASE_URL`, and/or cap pool size via the connection string
  (`?connection_limit=`-style options per provider).

## Backup strategy

- Automated daily snapshots minimum (most hosted providers default to
  this) plus a manual snapshot **immediately before any production
  re-import or migration**.
- The dataset is fully reproducible from source
  (`pnpm data:download && pnpm data:import -- --reset`), so backups are
  about restore *speed*, not data survival — but test the restore path
  anyway.

## Restore strategy

1. Restore the snapshot via the provider.
2. Re-run `pnpm search:index` (the search index must match the DB).
3. `pnpm data:verify && pnpm search:verify`.

## Least-privilege roles (recommended)

- **Migration/import role** — full DDL/DML; used only by the admin
  environment for `db:deploy` and `data:import`.
- **Runtime app role** — ideally **read-only** (`SELECT` on app tables):
  the app has no write paths, so a read-only role turns any future
  injection-class bug into a no-op.
- **Status: not implemented yet** — the app currently uses one role.
  This is a documented launch-hardening follow-up (also tracked in
  SECURITY_HARDENING_PLAN.md P0.4): create the read-only role in the
  provider, grant SELECT on all app tables, and point the platform's
  `DATABASE_URL` at it once verified.
