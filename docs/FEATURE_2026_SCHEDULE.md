# Feature: 2026 World Cup Schedule & Scores

The "Latest Matches / 2026 Schedule & Scores" feature adds a live-ish,
database-backed view of the 2026 FIFA World Cup: the homepage shows latest /
live / today / recent / upcoming fixtures, and `/schedule/2026` shows the full
fixture list grouped by date.

> WORLDCUP Nexus is an independent historical archive and is **not affiliated
> with FIFA**. No official FIFA logos or branding are used.

## Why the data is stored in the database before rendering

External fixture data is **never** fetched from the browser, and **never**
fetched inside a React render. The flow is strictly:

```
external provider
  → server-side fetch (timeout + Zod validation)
  → normalize to a shared internal shape
  → upsert into PostgreSQL (one row per [source, sourceId])
  → render from the database
  → refresh via a protected cron / manual sync route
```

This keeps the UI fast and resilient (a provider outage never breaks a page
render), keeps provider URLs/secrets server-side, lets us validate and attribute
every value, and gives us an audit trail (`FixtureSyncLog`, `rawPayload`).

## Providers

| Provider | Role | Key | Priority | Trust |
| --- | --- | --- | --- | --- |
| **OpenFootball** `worldcup.json` | Stable baseline: schedule, venues, groups, basic results. **This is all production needs.** | none | 50 | Stable open data, not guaranteed live |
| **worldcup26.ir** API | Optional live/current scores. Disabled by default; only enabled after endpoint verification | none | 10 | Non-authoritative community source; must fail gracefully |
| Official FIFA fixtures page | Manual verification reference only | — | — | Not scraped |

Lower `sourcePriority` wins when both providers describe the same logical match
(see canonical selection below). The official FIFA page is a **human**
verification reference only — it is never scraped by this code.

### worldcup26 endpoint

When enabled, the games endpoint is built from `WORLDCUP26_API_BASE_URL` by
appending `/get/games` (trailing slashes on the base are normalized):

```
WORLDCUP26_API_BASE_URL="https://worldcup26.ir"  →  https://worldcup26.ir/get/games
```

Set the base URL to the **host only** — never include `/api`, `/matches`, or the
`/get/games` path yourself. The URL is built by `buildWorldcup26GamesUrl()`.

### Provider modes (`FIXTURE_SYNC_PROVIDER_MODE`)

| Mode | Behaviour |
| --- | --- |
| `openfootball-only` | **Default.** Only OpenFootball runs. worldcup26 is never called. |
| `openfootball-first` | OpenFootball, then worldcup26 if configured. A worldcup26 failure is a non-fatal warning — the baseline is kept. |
| `live-first` | worldcup26 first if configured, with OpenFootball as the always-present baseline fallback. |
| `worldcup26-only` | worldcup26 only — **debugging only.** |

A missing or invalid `FIXTURE_SYNC_PROVIDER_MODE` falls back to
`openfootball-only` (`parseFixtureProviderMode()`), so the pipeline is always
deployment-safe. When a mode would include worldcup26 but
`WORLDCUP26_API_BASE_URL` is unset, that provider is **skipped** (not failed).

## Source priority & canonical selection

Each provider row is stored separately (`Fixture.source` + `Fixture.sourceId`).
The canonical view per logical match is computed at **read time** in
`src/server/fixtures/normalize.ts` (`selectCanonicalFixtures`):

- Rows are grouped by a logical-match key (kick-off date + team slugs +
  stage/group).
- The primary row is the lowest `sourcePriority` (live provider wins), tie-broken
  toward rows that already have a score, then most-recently synced.
- Null display fields on the primary are backfilled from the other rows, so the
  live provider's scores combine with the baseline provider's venue/group data.

**Limitation:** matching is heuristic. If two providers name the same teams
differently, the rows may not merge and a duplicate can appear. That is a
visible duplicate, never corrupted data. This is intentionally simple for the
first implementation.

## Sync frequency

Configured in `vercel.json` (`/api/cron/sync-2026-fixtures`).

- **During the tournament:** every 15–30 minutes is reasonable (default:
  `0,30 * * * *`, i.e. every 30 min).
- **Outside live windows:** daily is plenty.
- **OpenFootball-only mode:** does not need frequent syncs — the baseline rarely
  changes between match windows.

Pick a cadence that respects the free/open providers; do not hammer them.

## How to sync locally

1. Copy env: `cp .env.example .env` and keep the fixture defaults.
2. Start the database: `docker compose up -d` then `pnpm db:migrate`.
3. Run a sync: `pnpm fixtures:sync`.

The script prints the resolved mode and a per-provider summary, and exits
non-zero **only if every provider that actually ran failed** (so an
OpenFootball-only run is a pass, and an OpenFootball success with a worldcup26
warning is still a pass). Lines read `[OK]`, `[WARN]` (optional provider
unavailable — falling back to the baseline), `[SKIP]` (disabled by mode or not
configured), or `[FAIL]` (the baseline failed).

With the default `openfootball-only` mode:

```
Mode: openfootball-only
Providers: 1/1 succeeded
Records fetched:  104
Records upserted: 104

  [OK]   openfootball — 104 upserted
  [SKIP] worldcup26 — disabled by FIXTURE_SYNC_PROVIDER_MODE=openfootball-only
```

With `openfootball-first` and worldcup26 unreachable:

```
Mode: openfootball-first
Providers: 1/2 succeeded
Records fetched:  104
Records upserted: 104

  [OK]   openfootball — 104 upserted
  [WARN] worldcup26 unavailable — falling back to OpenFootball baseline.
```

## Manual / cron sync route

`GET|POST /api/cron/sync-2026-fixtures`

- Protected by `CRON_SECRET` via `Authorization: Bearer <secret>` (Vercel Cron
  sets this automatically when `CRON_SECRET` is configured) or `?secret=<secret>`.
- Missing/invalid secret → `401`. With no secret configured the route is
  disabled (fail closed).
- Returns a JSON summary. Provider errors are sanitized (URLs stripped) so no
  host/secret leaks. Safe to run repeatedly (upserts).
- Uses the same `FIXTURE_SYNC_PROVIDER_MODE` logic as the CLI. In production
  (`openfootball-only`) the cron only syncs OpenFootball and never fails because
  worldcup26 is disabled.

## Read API (DB-backed, rate-limited)

- `GET /api/fixtures/2026` — `from`, `to`, `status`, `group`, `stage`, `q`,
  `limit`
- `GET /api/fixtures/2026/latest` — blended live / recent / upcoming
- `GET /api/fixtures/2026/today` — today's fixtures (`?tz=` IANA zone, default
  UTC)
- `GET /api/fixtures/2026/upcoming` — upcoming, kick-off ascending

All read endpoints query PostgreSQL only and never call a provider.

## Stale-data behaviour

`getFixtureFreshness2026()` reports "Last synced X ago". When the newest sync is
older than `STALE_AFTER_MINUTES` (180) the UI shows a quiet
"data may be stale" note (`FixtureFreshnessNote`). Data is never hidden — its age
is shown honestly.

## Time zones

OpenFootball kick-off times carry an explicit UTC offset (e.g. `13:00 UTC-6`),
so a true `kickoffAtUtc` instant is computed. When a source gives a date but no
offset, **no zone is assumed** — the labels are kept verbatim and the instant is
left null (those fixtures sort last). The displayed time is the source's own
local label, never silently re-zoned.

## Known limitations

- Heuristic canonical merge (see above).
- `worldcup26.ir` is optional and **disabled by default** (production runs
  `openfootball-only`). When enabled it calls `…/get/games`; its response shape
  is community-maintained and defensively normalized. A 404/500/network error
  logs a sanitized **warning** and the OpenFootball baseline still syncs — it is
  never a deployment blocker.
- `rawPayload` is stored for audit/re-normalization and is **never** rendered.

## Production deployment

Production does not require worldcup26. Recommended Vercel env:

```
OPENFOOTBALL_2026_URL="https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json"
FIXTURE_SYNC_PROVIDER_MODE="openfootball-only"
WORLDCUP26_API_BASE_URL=""
CRON_SECRET="<secure-secret>"
```
