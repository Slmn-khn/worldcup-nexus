# Media License Policy

WORLDCUP Nexus is an independent historical archive. It is **not** affiliated
with FIFA and must never imply otherwise. Media handling follows strict
licensing rules so that nothing copyrighted or unattributed is ever shown
publicly.

## Hard rules

- **Never use Google Images as a source.** Image search results are not a
  license. Do not copy URLs from search results, social media, news sites, or
  stock-photo previews.
- **No copyrighted editorial photos without explicit permission.** Agency and
  press photography (Getty, AP, Reuters, Alamy, club/federation press, etc.) is
  off-limits unless we hold a written license for the specific use.
- **Only `APPROVED` media renders publicly.** Every asset starts as a
  `CANDIDATE`. It becomes visible only after a human review sets its status to
  `APPROVED` with verified license/attribution fields. The public query layer
  filters to `APPROVED` only — candidate and rejected media can never leak to the
  UI.
- **Candidate media must not render publicly.** It may be visible in internal
  tooling/admin only. Production components receive media exclusively through
  `src/server/media/queries.ts`, which returns `APPROVED` assets only.
- **No official FIFA logos.** Generated, custom, or commissioned visuals must
  avoid FIFA marks, the World Cup trophy emblem, and any branding that implies
  official affiliation.

## Required metadata

Every stored asset must record (where applicable):

- `sourcePageUrl` — the canonical page the file came from.
- `originalUrl` — the original file URL.
- `creatorName` — the author/photographer/creator.
- `licenseType` — one of the `MediaLicenseType` values.
- `licenseName` + `licenseUrl` — human label and link to the license text.
- `creditText` — the rendered attribution string.
- `attributionHtml` — optional richer attribution (with a link) for a credits
  surface.

The seed script (`scripts/media/seed-curated-media.ts`) **refuses** to import an
asset that lacks source/credit/license — *unless* the provider is `GENERATED` or
`LOCAL` (assets we created/own).

## Source-specific guidance

- **Wikimedia Commons / Wikidata.** Potentially usable, but **per-file** review is
  mandatory. Each file has its own license (PD, CC0, CC BY, CC BY-SA, …) and its
  own attribution requirements. Never assume "it's on Commons" means it's free to
  use without credit. Record the exact license and required attribution per file,
  and confirm the file is not flagged for deletion or a license dispute. Automated
  harvesting is not enabled in Phase 1.
- **Generated / owned (`GENERATED`, `GENERATED_OWNED`, `LOCAL`).** Visuals we
  create ourselves. Must still avoid FIFA marks and any third-party copyrighted
  material baked into them.
- **`RIGHTS_RESERVED` / `UNKNOWN`.** Never render publicly. These exist so the
  database can track an asset we are *evaluating*, not one we may show.

## Attribution surface

A public **credits page/section** will be added in a later phase, generated from
the stored `creditText` / `attributionHtml` of `APPROVED` assets. Until then, the
`<MediaCredit>` component is available for inline/compact credit display wherever
approved media is shown.

When in doubt, **do not publish.** Leave the asset as `CANDIDATE` or
`NEEDS_REVIEW` and flag it for human review.
