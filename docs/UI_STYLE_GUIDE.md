# WorldCup Atlas UI Style Guide

## Direction — "Cinematic Football Intelligence"

WorldCup Atlas should feel like a premium digital football museum crossed
with a sports data command center: cinematic, fluid, data-rich, historical
but modern.

It should not look like:

- a betting site
- a generic admin dashboard
- an official FIFA product
- a gaming/esports clan site — neon is an accent, not a theme. If a screen
  reads "gamer RGB" instead of "football archive", dial the glow back.

## Colors (Checkpoint 7C tokens — `src/theme/tokens.ts`)

- Base Background: `#050B14`
- Deep Navy: `#06111F`
- Surface: `#0E1A2A`
- Surface Elevated: `#13243A`
- Border: `#263B56`
- Gold: `#F4C95D` / Gold Glow: `rgba(244, 201, 93, 0.35)`
- Electric Cyan: `#22D3EE` / Cyan Glow: `rgba(34, 211, 238, 0.28)`
- Pitch Neon Green: `#A3E635` / Green Glow: `rgba(163, 230, 53, 0.25)`
- Purple Accent: `#8B5CF6` / Purple Glow: `rgba(139, 92, 246, 0.22)`
- Text Primary: `#F8FAFC`
- Text Secondary: `#CBD5E1`
- Muted Text: `#94A3B8`
- Red Card: `#EF4444`
- Yellow Card: `#FACC15`

### Neon accent usage rules

- **Gold** is the brand, history, and trophy color: headings accents,
  primary CTAs, record values, champions, rank #1–3.
- **Cyan** is interaction and data: search focus, active nav, filter
  consoles, data-panel edge lights, export actions, hover light.
- **Green** is positive stats and pitch energy only: sub-on chips,
  converted penalties, pitch-line tinting. Never use green everywhere.
- **Purple** is rare glow depth in hero/background gradients only — never
  for text or interactive elements.
- Neon colors are never used for body text, and glows never sit behind
  text in a way that reduces contrast. Cards/chips that convey meaning
  always carry a text label, never color alone.

## Cards

- Premium panel look comes from the theme: gradient background
  `linear-gradient(145deg, #0E1A2A, #101827)`, gold border
  `rgba(244, 201, 93, 0.22)`, soft dark shadow.
- Clickable cards use `interactiveCardSx` (src/theme/tokens.ts): hover/
  focus-within lift (-3px), gold border brighten, gold+cyan glow shadow.
  Reduced-motion users keep border/color transitions but no transform.
- Non-clickable stat panels use `glowPanelSx`: border/glow only, no lift.
- Data panels (StatCard, RecordCard) may carry a 2px cyan edge light.

## Football Constellation System

`src/components/visual/FootballConstellation.tsx` is the WorldCup Atlas
visual signature: football history rendered as glowing constellation nodes
(countries, matches, tournaments, players as connected data points) over the
dark stadium sky. It is a hand-crafted, deterministic constellation — never
random particles, never a gaming background.

- **What it represents**: each variant maps an idea — `hero` is the whole
  archive spread across the sky with a central football node; `records` is
  connected achievement stars (gold-heavy arc); `match` is two team clusters
  (gold vs cyan) joined through one pitch-green node; `explorer` is a cyan
  data network; `subtle` is a barely-there decorative layer.
- **Where to use it**: homepage hero, records hero, match detail hero
  (seeded by match slug so each match's sky differs), and the explorer
  header. At most one instance per page, in the hero only — never behind
  body sections, tables, or text-dense content.
- **Colors**: nodes use only the token accents (gold, electric cyan, pitch
  green); lines are gold or cyan at ≤ 0.15 opacity. No other colors.
- **Reduced motion**: the same constellation renders fully static (no
  drift, no pulsing) at slightly lower opacity — it never disappears.
- **Performance limits**: 8–16 nodes on desktop, 5–8 on mobile (CSS-hidden
  desktop-only group); animation is opacity-only halo pulses on a few nodes
  plus one slow 32s drift of the whole group; SVG only, no canvas, no
  filters, no external images; `aria-hidden` and `pointer-events: none`
  always.

## Motion Principles (Checkpoint 7C)

- Cinematic but restrained: motion supports the archive feel, never steals
  attention. Section reveals and card lifts, not spectacle.
- Use the `motion` package (`motion/react`) for JS animation; MUI `sx`
  transitions for simple hover states. Primitives live in
  `src/components/motion/` (FadeIn, StaggerContainer, ParallaxLayer,
  MotionCard, PageTransition) and `src/components/visual/` (AtlasBackground,
  HeroOrb, PitchLines).
- Animate transform and opacity only — never width/height/top/left.
- Reduced motion is respected everywhere: `MotionConfig reducedMotion="user"`
  app-wide, `useReducedMotion` guards in scroll/loop-driven components, and a
  CSS `prefers-reduced-motion` fallback for scroll behavior and card lifts.
- Parallax limitations: scroll parallax is subtle (≤ ~70px drift), lives in
  heroes/major feature areas only, and is fully static under reduced
  motion — never on tables, lists, or data-dense views.
- Tables and the Data Grid remain stable and readable: container-level
  reveals at most, no per-row animation (row hover tint is CSS only).
- Continuous animations (orb float, search shimmer) are limited to the
  hero and active loading states.
- No official FIFA visuals; decorative language is generic trophy gold,
  pitch green, and stadium atmosphere.

## UI Rules

- Use MUI only.
- Do not add Tailwind CSS.
- Use the project theme from `src/theme/theme.ts` and tokens from
  `src/theme/tokens.ts`.
- Prefer reusable components.
- Detail pages should use tabs and sections.
- Browsing pages may use side filters.
- All cards should be clearly clickable when they navigate.
- Strong atmosphere (AtlasBackground hero variant, orbs, pitch lines) on
  homepage, records, explorer, and detail heroes; light atmosphere on
  sources, about, and simple index pages.
- Do not hardcode real historical stats once the database exists.
