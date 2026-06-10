# WorldCup Atlas UI Style Guide

## Direction

WorldCup Atlas should feel like a premium digital football museum and historical sports archive.

It should not look like:

- a betting site
- a generic admin dashboard
- an official FIFA product

## Colors

- Background: #06111F
- Surface: #0E1A2A
- Surface Alt: #142338
- Border: #253449
- Gold: #F4C95D
- Gold Muted: #C9A13F
- Text Primary: #F8FAFC
- Text Secondary: #CBD5E1
- Green Accent: #1F7A4D
- Red Card: #EF4444
- Yellow Card: #FACC15

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
  CSS `prefers-reduced-motion` fallback for scroll behavior.
- Parallax and floating decoration belong in heroes/major feature areas
  only — never on tables, lists, or data-dense views.
- Tables and the Data Grid remain stable and readable: container-level
  reveals at most, no per-row animation.
- No official FIFA visuals; decorative language is generic trophy gold,
  pitch green, and stadium atmosphere.

## UI Rules

- Use MUI only.
- Do not add Tailwind CSS.
- Use the project theme from `src/theme/theme.ts`.
- Prefer reusable components.
- Detail pages should use tabs and sections.
- Browsing pages may use side filters.
- All cards should be clearly clickable when they navigate.
- Do not hardcode real historical stats once the database exists.
