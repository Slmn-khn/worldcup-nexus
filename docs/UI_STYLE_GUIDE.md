# WorldCup Atlas Vault Editorial System

## Design philosophy

WorldCup Atlas is a premium black-canvas World Cup archive — editorial,
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

## Footer

Black, structured, calm (PDF page 6): brand block (wordmark + stripe +
description + independence disclaimer), Archive / Data / About link
columns, bottom hairline row carrying "Historical data: Fjelstul World
Cup Database (CC-BY-SA 4.0)" and the independence line. The disclaimer
and /sources attribution must always remain visible.

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

- Neon glow, cyber gradients, particle/constellation backgrounds.
- Rounded corners on cards/buttons/inputs (circles allowed only for
  functional icon controls).
- Drop shadows; layered chrome; atmospheric backdrops behind type.
- Bold body text; sentence-case hero headlines; tracking under 1.5px on
  uppercase labels.
- More than one accent moment per surface; stripe overuse.
- Official FIFA logos or implied affiliation.

## Future motion guidance (Checkpoint 7D)

Motion and football constellation effects should be added only after the
professional UI foundation is stable — and then only as secondary
polish: opacity/transform reveals, reduced-motion respected, never
parallax/particle decoration competing with the typography. The
`prefers-reduced-motion` CSS fallback stays in place.
