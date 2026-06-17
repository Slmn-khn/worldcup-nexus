# Media Asset Strategy

WORLDCUP Nexus is, first and last, a **data archive**. The football data —
tournaments, matches, goals, players, records — is the source of truth. Media
(portraits, flags, hero images, event covers, record visuals) is an **optional
enhancement layer** layered on top. Nothing on the site may depend on an image
existing.

## Principles

1. **Data is canonical, media is decorative.** A page must render completely and
   correctly with zero media rows in the database. If every `MediaAsset` row were
   deleted tomorrow, the archive would still be whole — it would simply fall back
   to typography, flags-as-CSS, and neutral placeholders.
2. **Every image has a fallback.** Components never assume a URL is present. A
   missing player portrait becomes a silhouette + initials card; a missing
   country image becomes a CSS flag (`flag-icons`) or a neutral code badge; a
   missing tournament hero becomes a dark gradient. See
   `src/server/media/fallback.ts`.
3. **Only approved media renders publicly.** Media moves through a review
   lifecycle (`MediaAssetStatus`). Only `APPROVED` assets are ever returned by the
   public query layer (`src/server/media/queries.ts`). `CANDIDATE`,
   `NEEDS_REVIEW`, `REJECTED`, and `ARCHIVED` assets are invisible to the site.
4. **Server-side queries only.** Media is read through server components / route
   handlers using Prisma. The browser never queries the media tables directly,
   and copyrighted/external image URLs are never hardcoded into React components.
5. **No required-media coupling.** We never write code of the form "for each
   player, show their photo" that breaks when a player has none. We write "show a
   photo *if one exists*, otherwise the fallback."

## Phased rollout

- **Phase 1 (this work) — Foundation.**
  - `MediaAsset`, `EntityMedia`, `MediaImportJob` models + supporting enums.
  - Optional nullable identity/theme fields on `Player`, `Country`, `Tournament`.
  - `flag-icons` CSS-based country flags via `<CountryFlag>`.
  - Reusable media components (`EntityImage`, `PlayerPortrait`, `HeroBackground`,
    `EventCover`, `MediaCredit`) — all fallback-first.
  - Server media query + fallback helpers.
  - A curated-media seed script and example data file.
  - Light, safe integration of flags/fallbacks only. **No homepage redesign.**
- **Phase 2 — Curated portraits & tournament/event visuals.** Hand-reviewed,
  license-cleared player portraits and tournament/event imagery seeded through
  `scripts/media/seed-curated-media.ts`, surfaced via the components above.
- **Phase 3 — Credits & richer surfaces.** A public credits page, record visuals,
  iconic-moment covers, and broader integration.

Automated ingestion (Wikimedia/Wikidata harvesting), Cloudinary, and any paid
image API are explicitly **out of scope** until a later phase.

## Storage model

Media lives in the database, not scattered through component code:

- **`MediaAsset`** — one row per image. Holds provider, source/original/storage/
  optimized URLs, dimensions, blur/dominant-color/focal hints, full license and
  attribution metadata, and review state.
- **`EntityMedia`** — links a `MediaAsset` to a domain entity (player, country,
  tournament, match, record, iconic moment, stadium, generic) with a `usage`
  role, `priority`, and `isPrimary` flag. One asset can serve several entities;
  one entity can have several assets per usage.
- **`MediaImportJob`** — an audit row per import/seed run.

See `docs/MEDIA_LICENSE_POLICY.md` for licensing rules and
`docs/CURATED_MEDIA_LIST.md` for the first curated targets.
