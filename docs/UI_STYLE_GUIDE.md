# WorldCup Atlas UI Style Guide

## Design philosophy — "Premium Sports Intelligence Archive"

WorldCup Atlas is a premium football archive crossed with a sports data
command center: editorial sports journalism typography meeting
terminal-grade data display, on a dark cinematic navy base with a
restrained gold identity.

Governing principles:

1. **Numbers are the heroes.** Scorelines, record values, and archive
   counts use the display scale; labels are demoted to small-caps
   eyebrows. Every key surface has one number you can read from across
   the room.
2. **One accent per surface.** Gold is the brand voice; cyan is the
   single data/interaction accent, applied as text, lines, and tints —
   almost never as solid fills. A view shows gold plus at most one other
   accent.
3. **Density with discipline.** Cards earn their space with secondary
   context (flags, ranks, results); lists get grouping and proportional
   bars; heroes are composed, never empty voids.

It must not look like: a betting site, a generic MUI dashboard, a gaming
clan site, an official FIFA product, or a school project. If a surface
reads "neon gamer" instead of "football intelligence", remove glow.

## Color tokens (`src/theme/tokens.ts`)

Base:

- App background: `#050A12`
- Deep navy: `#07111F`
- Surface 1: `#0D1828` · Surface 2: `#122238` · Surface 3: `#172A44`
- Border: `rgba(148, 163, 184, 0.16)` (strong: `0.3`)

Brand:

- Gold: `#F4C95D` · Gold soft: `#D6A84F`

Accents:

- Cyan (data/interaction): `#38BDF8` · soft `rgba(56, 189, 248, 0.18)`
- Green (semantic positive only): `#22C55E` · soft `rgba(34, 197, 94, 0.14)`
- Red: `#EF4444` · Yellow card: `#FACC15`

Text: primary `#F8FAFC` · secondary `#CBD5E1` · muted `#94A3B8`

### Accent color rules

- **Gold** — identity, primary CTAs, champions, record values, rank 1–3,
  section rules, nav active state.
- **Cyan** — input focus rings, filter consoles, data chips ("18,881
  rows"), row hover light, №1 markers. Lines/text/tints only.
- **Green** — sub-on, converted penalties, positive outcomes. Never
  decorative.
- Solid chip fills are reserved for true emphasis (goals, champions,
  literal card colors). Everything else is a tint
  (`rgba(accent, 0.12–0.18)` background + accent text + 0.3 border) or a
  ghost outline.
- Color is never the only indicator — every chip/marker carries a text
  label, and glows never sit behind text.

## Typography

- Body: Inter (`--font-inter`), 15–17px, line-height ≥ 1.55.
- Display: Space Grotesk (`--font-display`) for h1–h6, scorelines, years,
  and big stats. No serif faces.
- Eyebrows/labels: 0.7rem, 700, 0.14em tracking, uppercase, muted/gold/
  cyan (`eyebrowSx`).
- All data numbers use `fontVariantNumeric: tabular-nums`
  (`tabularNums`).
- Scale anchors: page titles 2.2–3.1rem; match scoreboard score
  3.2–4.5rem; stat card values 1.9–2.4rem; record values 2–2.5rem.
- Raw source strings are never displayed unformatted — stage labels go
  through `formatStage()`.

## Card anatomy

Every card follows: **eyebrow → title → key stat/score → metadata row →
CTA affordance.** Cards use the theme default panel (gradient
`linear-gradient(160deg, #0D1828, #0B1422)`, 1px border, soft shadow,
12px radius).

- Clickable cards: `interactiveCardSx` — hover/focus-within lifts 2px,
  border warms to gold, shadow deepens. Reduced-motion users keep
  border/shadow only.
- Static panels: `glowPanelSx` — border/shadow emphasis, no lift.
- Identity comes from data: nation flags, position badges, trophy marks —
  never letter avatars.

## Table styling rules

- Header strips: Surface 2 background, uppercase 0.74rem tracked muted
  titles.
- Rows: hairline borders (`rgba(148,163,184,0.12)`), cyan-tint hover
  (`rgba(56,189,248,0.04)`), consistent 10–12px cell padding.
- Leaderboards: rank gold for 1–3 / muted otherwise, proportional bar
  scaled to the #1 value, value right-aligned tabular gold.
- DataGrid: free features only; no per-row animation; mobile relies on
  the intended horizontal scroll container — never tiny text.

## What to avoid

- Neon glow boxes, multi-color particle decoration, over-glow shadows.
- More than two accent hues in one view.
- Solid colored pills as the default data encoding (alarm-red for
  ordinary events is forbidden).
- Stock MUI fingerprints: default breadcrumbs/selects/footers must carry
  the theme overrides.
- Tiny text (< 0.72rem), lowercase raw data strings, em-dash headlines.
- Hardcoded historical stats once the database exists.

## Motion principles (Checkpoint 7D)

- Cinematic but restrained: motion supports the archive feel, never
  steals attention. Section reveals and card lifts, not spectacle.
- Use the `motion` package (`motion/react`); primitives live in
  `src/components/motion/`: `FadeIn` (viewport reveal, delay/y/duration),
  `StaggerContainer` (staggerChildren/delayChildren for grids/lists),
  `MotionCard` (spring hover lift wrapper), `ParallaxLayer`
  (yRange/xRange/opacityRange scroll parallax), `PageTransition` (light
  keyed route entrance). Simple hover states stay in MUI `sx`.
- Animate transform and opacity only — never width/height/top/left.
- Parallax is subtle (≤ ~70px), heroes only, never on tables or
  data-dense views.
- Tables and the Data Grid stay stable: container-level reveals at most,
  no per-row animation (row hover tint is CSS only).
- Continuous animations are limited to the hero orbs, constellation
  pulses/drift, and active loading states.
- Reduced motion is respected at three levels: app-wide
  `MotionConfig reducedMotion="user"`, `useReducedMotion` guards in every
  scroll/loop-driven component, and the CSS `prefers-reduced-motion`
  fallback (scroll behavior + card-lift suppression).

## Football Constellation System (Checkpoint 7D)

`src/components/visual/FootballConstellation.tsx` is the WorldCup Atlas
visual signature: football history rendered as glowing constellation
nodes (countries, matches, tournaments, players as connected data
points) over the dark stadium sky. Hand-crafted, deterministic layouts —
never random particles, never a gaming background.

- **Variants**: `hero` (homepage — gold+cyan balanced, central football
  node), `records` (gold achievement arc), `match` (two team clusters at
  the edges joined through one low match point — the scoreboard panel
  owns the center), `explorer` (cyan data network), `subtle` (low-opacity
  layer for detail heroes).
- **Where to use**: homepage hero, records hero, match detail hero
  (seeded by match slug), explorer header, tournament detail hero
  (subtle, seeded by year). One instance per page, heroes only.
- **Where NOT to use**: behind body sections, tables, text-dense
  content, or on more than one surface per page.
- **Content-safe zones**: layouts keep nodes out of the text column
  (right half, top/bottom strips, corners for header pages; far edges
  for the match scoreboard). Never place a node over a headline.
- **Colors**: gold + cyan tokens only; lines at ≤ 0.11 opacity; green is
  reserved for semantic UI and stays out of the constellation.
- **Reduced motion**: the same constellation renders fully static (no
  drift, no pulsing) at slightly lower opacity — it never disappears.
- **Performance limits**: 8–16 desktop nodes, 5–8 mobile (CSS-hidden
  desktop-only group); opacity-only halo pulses on a few nodes plus one
  slow 32s drift of the whole group; SVG only — no canvas, no filters,
  no external images; `aria-hidden` and `pointer-events: none` always.

## UI rules

- Use MUI only; no Tailwind.
- Use the theme (`src/theme/theme.ts`) and tokens (`src/theme/tokens.ts`)
  — never re-hardcode palette values in components.
- Prefer server components; shared layout patterns: `HeroSurface`,
  `PageHeader`, `SectionHeading` (with optional eyebrow), `EmptyState`.
- All cards that navigate are fully clickable with visible focus.
- Keep source attribution and the independence disclaimer visible in the
  footer and on /sources.
- No official FIFA logos or implied affiliation.
