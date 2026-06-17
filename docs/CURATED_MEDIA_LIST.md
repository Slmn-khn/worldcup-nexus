# Curated Media List

The first target entities for curated, license-cleared media. Each row must pass
the review in `docs/MEDIA_LICENSE_POLICY.md` before its status is set to
`APPROVED`. Slugs follow the database `slug` convention (kebab-case, diacritics
folded) — verify against the actual `Player` / `Country` / `Tournament` rows
before seeding.

This list is a **work queue**, not a guarantee that media exists yet. The site
must function with none of these present.

## First curated player portrait batch — status

**Status: pipeline ready, zero portraits approved.** Phase 3 shipped the curated
portrait pipeline end to end:

- `data/media/curated-player-media.json` exists as an **empty array (`[]`)** — no
  player portrait has cleared license/attribution review yet, and no license
  metadata has been invented to fill the gap.
- The seed script (`scripts/media/seed-curated-media.ts`) validates every record
  with Zod, refuses non-owned assets that lack source/credit/license, resolves
  players by slug, and upserts `MediaAsset` + `EntityMedia` (usage `PORTRAIT`,
  `priority` 10, `isPrimary` only when no primary portrait already exists and the
  record is `APPROVED`).
- `PlayerPortrait` renders an approved image when one exists and a dark
  charcoal + gold initials crest otherwise. It is already wired (fallback-first)
  into the homepage **Top Player Records** cards and the **player profile hero**.

When a portrait clears review, add its record to
`data/media/curated-player-media.json`, set `status` to `APPROVED`, run
`pnpm media:seed`, update the player row below to `Approved`, and confirm it
appears on **[/media-credits](../src/app/media-credits/page.tsx)**.

> **Reminder:** every public image must carry source, creator, and license.
> Approved media is credited automatically on the **/media-credits** page.

## Players (portraits)

| Player            | Suggested slug      | Status   | License | Notes |
| ----------------- | ------------------- | -------- | ------- | ----- |
| Pelé              | `pele`              | Pending  |         |       |
| Diego Maradona    | `diego-maradona`    | Pending  |         |       |
| Lionel Messi      | `lionel-messi`      | Pending  |         |       |
| Cristiano Ronaldo | `cristiano-ronaldo` | Pending  |         |       |
| Miroslav Klose    | `miroslav-klose`    | Pending  |         |       |
| Ronaldo Nazário   | `ronaldo`           | Pending  |         | a.k.a. Ronaldo (R9); confirm slug |
| Zinedine Zidane   | `zinedine-zidane`   | Pending  |         |       |
| Kylian Mbappé     | `kylian-mbappe`     | Pending  |         |       |
| Gerd Müller       | `gerd-muller`       | Pending  |         |       |
| Cafú              | `cafu`              | Pending  |         |       |

## Countries (flags / crests)

Flags are rendered via CSS (`flag-icons`) and need **no** stored media. The
entries below are for richer country visuals (e.g. hero/background) only.

| Country     | ISO2 | Status  | License | Notes |
| ----------- | ---- | ------- | ------- | ----- |
| Brazil      | br   | Pending |         |       |
| Argentina   | ar   | Pending |         |       |
| Germany     | de   | Pending |         |       |
| Italy       | it   | Pending |         |       |
| France      | fr   | Pending |         |       |
| England     | gb-eng / gb | Pending |  |       |
| Spain       | es   | Pending |         |       |
| Netherlands | nl   | Pending |         |       |
| Uruguay     | uy   | Pending |         |       |
| Portugal    | pt   | Pending |         |       |

## Tournaments (hero / poster)

| Tournament         | Suggested slug | Status  | License | Notes |
| ------------------ | -------------- | ------- | ------- | ----- |
| 2022 Qatar         | `2022`         | Pending |         | confirm slug/year convention |
| 2018 Russia        | `2018`         | Pending |         |       |
| 2014 Brazil        | `2014`         | Pending |         |       |
| 2010 South Africa  | `2010`         | Pending |         |       |
| 2006 Germany       | `2006`         | Pending |         |       |
| 1998 France        | `1998`         | Pending |         |       |
| 1994 USA           | `1994`         | Pending |         |       |
| 1986 Mexico        | `1986`         | Pending |         |       |
| 1970 Mexico        | `1970`         | Pending |         |       |
| 1950 Brazil        | `1950`         | Pending |         |       |

## Events (iconic-moment / event covers)

These map to matches (by match `slug`) or to standalone iconic-moment records
(added in a later phase). No automated logos — custom/owned visuals only.

| Event                            | Status  | License | Notes |
| -------------------------------- | ------- | ------- | ----- |
| 2022 Argentina vs France final   | Pending |         |       |
| 2014 Brazil vs Germany           | Pending |         | the 1–7 |
| 2010 Spain vs Netherlands final  | Pending |         |       |
| 2006 Italy vs France final       | Pending |         |       |
| 1998 France vs Brazil final      | Pending |         |       |
| 1986 Argentina vs England        | Pending |         | "Hand of God" / second goal |
| 1986 Argentina vs West Germany final | Pending |     |       |
| 1970 Brazil vs Italy final       | Pending |         |       |
| 1950 Uruguay vs Brazil           | Pending |         | "Maracanazo" |
| 1966 England vs West Germany final | Pending |       |       |

## How to seed

1. Copy `data/media/curated-player-media.example.json` to
   `data/media/curated-player-media.json`.
2. Fill in **only** entries with verified `sourcePageUrl`, `originalUrl`,
   `licenseType`, `licenseName`, `licenseUrl`, `creatorName`, and `creditText`
   (unless the provider is `GENERATED` or `LOCAL`).
3. Set `status` to `APPROVED` only after review.
4. Run `pnpm media:seed`.

The script is idempotent/upsert-safe and skips entities it cannot resolve by
slug. If only the example file exists, it prints a friendly message and exits 0.
