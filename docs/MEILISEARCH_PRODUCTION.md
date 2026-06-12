# WORLDCUP Nexus — Meilisearch Production Notes

Meilisearch Cloud or a self-hosted **private** instance (v1.15+, the
local Docker version). The search index is a derived artifact — it can
always be rebuilt from the database.

## Exposure rules

- **Never expose Meilisearch directly to the browser or the public
  internet without keys.** The app's browser code never talks to
  Meilisearch: all search flows through `/api/search`, which calls the
  server-side helper (`src/server/search/client.ts`) — so no key ever
  reaches the client.
- Use an **HTTPS/TLS endpoint** (`MEILISEARCH_HOST`).
- Self-hosted: run with `MEILI_ENV=production` (disables the dev
  dashboard and requires a master key); keep port 7700 off the public
  internet (private network / firewall) where possible.

## Key management

| Key | Where it lives | Used for |
| --- | --- | --- |
| Master/admin key | Vault + admin environment only | Creating scoped keys, `pnpm search:index` |
| Runtime search key (scoped, search-only) | App platform env (`MEILISEARCH_API_KEY`) | `/api/search` queries |

- Use the master/admin key **only** for administration and indexing —
  keep it out of the app runtime entirely when the deployment supports
  scoped keys (Meilisearch Cloud and self-hosted both do: create a key
  restricted to the `search` action on the `worldcup_atlas_search`
  index).
- The admin key must never appear in browser/client code, `NEXT_PUBLIC_*`
  variables, or committed files.

## Indexing workflow

From the admin environment, with `MEILISEARCH_API_KEY` set to the
**admin/indexing key**:

```bash
pnpm search:index     # rebuilds settings + documents, waits for completion
pnpm search:verify    # common queries through the same service the app uses
```

- Re-run `pnpm search:index` after **every** data import — the index is
  a snapshot of the database and does not update itself.
- Index documents are derived from the normalized database tables via
  the query layer only — **RawSourceRecord is never indexed** (and
  `pnpm export:verify` / `pnpm data:verify:queries` assert it never
  leaks elsewhere either).
- Index uid: `worldcup_atlas_search` (internal identifier; not
  user-facing).

## Failure behavior

If Meilisearch is unreachable, `/api/search` returns a 503 with a
generic message (no host details in production) and every page keeps
working — search is an enhancement, not a dependency.

## Rollback

- The index is rebuildable at any time from the database: re-run
  `pnpm search:index`.
- After a database restore, always reindex so search matches the data.
- Where the setup allows (e.g. indexing into a fresh index uid or a
  second instance), keep the previous index until the new one passes
  `pnpm search:verify`; with the current single-uid script, the
  fallback is simply re-running the indexer (takes minutes for this
  dataset).
