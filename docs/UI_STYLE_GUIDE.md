# WORLDCUP Nexus Visual System

## Neon Atlas — current visual direction

WORLDCUP Nexus now leads with a **"stadium at night"** premium identity: a deep
blue-black canvas lit by **trophy gold** and **electric cyan** glow. The homepage
is the flagship of this language; interior archive pages keep a calmer layout but
share the same palette and will migrate toward it over time.

**Tokens live in `src/theme/visualTokens.ts`** (`atlasColors`, `atlasGlow`,
`atlasBorders`, `atlasShadows`, `atlasGradients`, `atlasRadius`,
`tournamentGradient`, `accentTextSx`). Apply them via `sx` — the base theme
(`src/theme/theme.ts`) stays zero-radius so non-homepage routes are unaffected
unless intentionally migrated.

- **Canvas:** page `#020812`, deep blue `#061827`, surface `#0B1622`, glass
  `rgba(10,20,32,0.82)`. Full-page atmosphere is a cyan glow (top-right) + gold
  glow (lower-left) over deep blue (`atlasGradients.page`).
- **Accents:** gold `#F4C95D` / `#FFD66B`, cyan `#00D9FF` / `#39E6FF`. Numbers and
  values glow via `accentTextSx`.
- **Cards:** rounded (`atlasRadius` 12–28px), gradient-filled, soft 1px borders
  that brighten gold/cyan on hover, with a lift + glow shadow. Drop shadows and
  gradients are **embraced** on premium surfaces (a reversal of the old Vault
  rules). Use the shared wrappers in `src/components/ui/`: `GlowCard`,
  `SectionHeader`, `NeonButton`, `NeonChip`, `GlowingSearchBar`.
- **Glow:** gold/cyan halos (`atlasShadows.goldGlow`/`cyanGlow`, `atlasGlow.*`).
  Keep it tasteful — one or two accent moments per surface, never a wall of neon.
- **Buttons:** pill-shaped `NeonButton` (gold filled, cyan filled, outline) with a
  glow on hover.
- **Still true:** MUI only, no Tailwind, no official FIFA logos, no unapproved or
  copyrighted media, condensed uppercase display headings, honest data labels.

The sections below document the original **Vault Editorial** system. It remains
the reference for the calmer interior-archive layout (typography, grid, data
honesty), now recolored onto the Neon Atlas palette above.

## Design philosophy

WORLDCUP Nexus is a premium black-canvas World Cup archive — editorial,
cinematic, historical, data-rich. The system holds white uppercase
condensed headlines and light gray body copy on a near-pure black canvas;
structure comes from 1px hairlines and a strict grid, identity from a
tiny gold accent and the green/gold/red stripe. Typography, black canvas,
hairlines, grid, and data hierarchy are primary. Motion is secondary.

It must not look like: a gaming/cyber dashboard, a rounded SaaS app, a
betting site, generic MUI, a school project, or an official FIFA product.

## Color tokens (`src/theme/tokens.ts`)

Canvas:

- Black `#000000` (page floor) · Canvas soft `#080808` · Surface soft
  `#0D0D0D` · Surface card `#171717` · Surface elevated `#222222` ·
  Carbon `#2B2B2B`

Borders: hairline `#2A2A2A` · hairline strong `#3C3C3C`

Text: white `#FFFFFF` (headlines, primary) · body `#BBBBBB` · body strong
`#E6E6E6` · muted `#7E7E7E`

Accent: archive gold `#D6A84F` · gold strong `#F4C95D` — micro use only
(eyebrow squares, record values, champion marks, title counts). Never a
large fill.

Stripe: pitch green `#1F8A4C` · archive gold `#D6A84F` · card red
`#D9293E`.

### Stripe accent rules

The 4px `VaultStripe` is a brand-identity marker only: under the wordmark
(nav + footer) and at rare major archive moments. **Never** a button
fill, **never** a background, **never** repeated through content.

## Typography

- Display: **Saira Condensed** (`--font-display`) — UPPERCASE, 700, tight
  line-height (0.95–1.1). h1 ≈ 48px mobile → 72–84px desktop. All h1–h3
  are uppercase at the theme level.
- Body: **Inter** 300 (Light), 16px, line-height 1.5+, color `#BBBBBB`.
  The heavy-display/light-body contrast is the editorial signature —
  never bold body copy.
- Labels/buttons: 12–14px, uppercase, 700, ~1.5px letter-spacing
  (`eyebrowSx`). The "machined" tracking is non-negotiable.
- Stats and scorelines: display font, 700, `tabular-nums`.
- Raw source strings never render unformatted — stage labels go through
  `formatStage()`.

## Section rhythm & layout

- Max content width ~1440px (`PageContainer`).
- Vertical rhythm: ~96px between major bands at desktop, 64px tablet,
  48px mobile (`VaultSection`).
- Card grids: 3-up desktop, 2-up tablet, 1-up mobile (4-up only for
  compact nation/player cards at lg).
- Footer: 4 columns desktop → 2 tablet → 1 mobile; always black.

## Card anatomy

Zero radius, `#171717` surface, 1px hairline, **no drop shadows, no
glow**. Hover sharpens the border (`interactiveCardSx`) — no lift, no
scale. Anatomy: optional top color/media band → uppercase eyebrow label →
title → key stat/score (condensed, bold) → metadata (muted) → uppercase
text-link action with → arrow.

- TournamentCard: top band with huge year + host; winner/final/runner-up
  blocks; "VIEW TOURNAMENT →".
- Match rows (`MatchRowList`): year — team A — score — team B —
  venue/context, hairline-divided.
- RecordCard: gold-square eyebrow, huge gold value, context, muted body.
- Spec cells (`VaultSpecCell`): big number over uppercase label.

## Buttons

Rectangular, 48px, uppercase 700 with 1.5px tracking (`VaultButton`):

- **Primary**: white fill, black label.
- **Outline**: transparent, white hairline border.
- **Text link**: uppercase label + → arrow, no underline.

No rounded buttons. No stripe-filled buttons. No gold-filled buttons
except where gold is already the semantic accent.

## Tables

Black/soft-black rows, 1px hairline dividers, uppercase 0.72rem tracked
muted headers, strong white tabular numerics for scores/values, gold for
top-3 ranks. Row hover = one-step surface tint. Mobile overflow scrolls
horizontally inside the intended wrapper — never tiny text.

## Vault Archive Controls (Checkpoint 7D)

Page filtering uses the shared components in `src/components/filters/`
(VaultFilterBar, VaultSearchInput, VaultSelect, VaultActiveFilters,
VaultPager, useUrlFilters). They are archive controls, not SaaS chrome.

- **Filter bar**: a `#0D0D0D` panel with a 1px hairline, zero radius, an
  uppercase panel label ("ARCHIVE CONTROLS" / "QUERY CONSOLE"), and a
  tabular result count ("12 / 30 TOURNAMENTS"). Controls sit in a row at
  desktop and stack at mobile — no drawer, no sidebar.
- **Inputs/selects**: 48px tall, black fill, hairline border, zero
  radius, uppercase 0.66rem letterspaced field labels above. Focus
  border turns white. Search commits on Enter/blur (URL-driven, not
  keystroke-driven) and offers a clear button.
- **Active filters**: rectangular hairline labels — uppercase param name
  in muted gray, value in white, × to remove — plus an uppercase "CLEAR
  FILTERS" text action. Never rounded, never colorful pills.
- **Sort** is an ordinary rectangular select; **categories** (records)
  are uppercase text tabs with a 2px underline on the active tab.
- **URL-driven**: every filter lives in the query string; views are
  bookmarkable/shareable; changing a filter resets `page` to 1;
  unrelated params are preserved; invalid params are ignored or
  normalized (`src/lib/search-params.ts`), never thrown on.
- **Options come from the database** (distinct stages, real country
  slugs, actual hosts/winners) — never hardcoded lists, never fake data.
- **Empty states are honest**: "no matches fit these filters" panels with
  a clear path back, distinct from "data not imported yet".
- Detail pages use the same bar for *local* scope only (a tournament's
  match list, a nation's match list, a player's event sections) — heroes,
  stat strips, and honours never filter away.

## Footer

Black, structured, calm (PDF page 6): brand block (wordmark + stripe +
description + independence disclaimer), Archive / Data / About link
columns, bottom hairline row carrying "Historical data: Fjelstul World
Cup Database (CC-BY-SA 4.0)" and the independence line. The disclaimer
and /sources attribution must always remain visible.

**Responsive rhythm — stay compact, the canvas is always black.**

- Desktop (`md+`): 4-up grid — brand (`1.6fr`) + Archive / Data / About
  link columns.
- Tablet (`sm`): 2-column link grid; the brand block spans the full width.
- Mobile (`xs`): 2-column link grid (not a single stretched file of
  links) with the brand block full-width above it. Footer padding stays
  compact (`pt: 40px` mobile vs `64px` desktop), gaps are tight
  (`rowGap: 32px` / `columnGap: 24px` mobile), and the attribution row
  sits `32px` below — no 96px voids, no unfinished blank-black stretch.
- Link rows keep a ~40px touch target (`minHeight: 40`) while spacing
  stays tight. All links remain visible at every breakpoint — nothing is
  hidden or collapsed away.

## Mobile navigation

Below `md` the inline top nav is replaced by a hamburger button
(`aria-label="Open navigation menu"`) that opens a right-anchored MUI
`Drawer` — a full-height black sheet:

- Stripe accent at the top, brand wordmark, and a close button
  (`aria-label="Close navigation menu"`).
- Links stacked vertically, uppercase, letterspaced, on 1px hairline
  rows; zero radius; ~52px tap targets.
- Active route marked with a left gold identity stripe — never a pill
  background.
- The drawer closes on navigation (route-change effect) and via the
  close button / backdrop.

At `md+` the drawer/hamburger are hidden and the inline nav returns with
its 2px white underline active marker. The old horizontal-scroll nav (which
cut off "Explorer" behind a fade mask) is gone — no horizontal page
overflow on mobile.

## Brand assets (Checkpoint 8E)

Brand artwork lives in `public/brand`. Source files: the app icon
(`worldcup-nexus-icon.png`) and the wide hero / social banner
(`worldcup-nexus-banner.png`). Favicon / PWA / Apple icon variants are
generated from the icon with `pnpm assets:icons` — never hand-edited.

- The banner is used **tastefully**, not everywhere: as the homepage hero's
  right-weighted backdrop behind a dark gradient overlay, and for Open Graph
  / Twitter social previews. It is decorative support — the real `<h1>` and
  subtitle remain the source of the title, never the image text alone.
- The hero image carries a meaningful `alt`; the overlay is `aria-hidden`.
  Only the homepage hero image uses `priority`.
- Keep the black-canvas Vault system intact: the banner sits behind type,
  dimmed enough to preserve contrast. No banner on every page.
- The marks are WORLDCUP Nexus's own — no official FIFA logos, no implied
  FIFA affiliation.

## Data honesty rules

- No invented data; no hardcoded historical totals — the archive span and
  the tournament timeline are derived from the database.
- Editorial curation that is not stored ("iconic finals", "legends") is
  labeled honestly ("Recent Finals", "Top Player Records").
- Squad membership is "World Cup Squads" / squad selections — never
  appearances. No assists, caps, minutes, lineups, standings, brackets.
- Records keep the scope note: combined men's/women's data is never
  silently presented as men's records.
- RawSourceRecord data is never exposed.

## What to avoid

> Superseded by the **Neon Atlas** direction at the top of this guide. Glow,
> gradients, rounded cards, and drop shadows are now part of the premium surface
> language (via `src/theme/visualTokens.ts`). The items below are retained as the
> calmer-layout sensibility for interior archive pages, not hard prohibitions.

- Particle/constellation backgrounds and animated atmosphere behind type
  (still avoid — a CSS glow gradient is fine, moving particle fields are not).
- A wall of neon: keep glow to one or two accent moments per surface.
- Bold body text; sentence-case hero headlines; tracking under 1.5px on
  uppercase labels.
- Stripe overuse.
- Official FIFA logos or implied affiliation; unapproved or copyrighted media.

## Future motion guidance (Checkpoint 7D)

Motion and football constellation effects should be added only after the
professional UI foundation is stable — and then only as secondary
polish: opacity/transform reveals, reduced-motion respected, never
parallax/particle decoration competing with the typography. The
`prefers-reduced-motion` CSS fallback stays in place.
