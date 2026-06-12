// Checkpoint 7C — "Premium Sports Intelligence Archive" design tokens.
// Server-safe (no "use client") so both server and client components can
// import them.
//
// Color roles: gold is the brand voice (identity, champions, record values,
// primary CTAs); cyan is the single data/interaction accent (links, focus,
// active UI, data panel edges) applied as text/lines/tints — almost never as
// solid fills; green is semantic only (positive outcomes); red/yellow are
// match-event semantics. One accent per surface: a view shows gold plus at
// most one other accent.
export const atlas = {
  // Base
  bgBase: "#050A12",
  deepNavy: "#07111F",
  surface1: "#0D1828",
  surface2: "#122238",
  surface3: "#172A44",
  border: "rgba(148, 163, 184, 0.16)",
  borderStrong: "rgba(148, 163, 184, 0.3)",
  // Brand
  gold: "#F4C95D",
  goldSoft: "#D6A84F",
  goldTint: "rgba(244, 201, 93, 0.12)",
  goldBorder: "rgba(244, 201, 93, 0.38)",
  // Data accent
  cyan: "#38BDF8",
  cyanSoft: "rgba(56, 189, 248, 0.18)",
  cyanTint: "rgba(56, 189, 248, 0.1)",
  // Pitch accent (semantic positive only)
  green: "#22C55E",
  greenSoft: "rgba(34, 197, 94, 0.14)",
  // Match-event semantics
  red: "#EF4444",
  redSoft: "rgba(239, 68, 68, 0.14)",
  yellow: "#FACC15",
  yellowSoft: "rgba(250, 204, 21, 0.16)",
  // Text
  textPrimary: "#F8FAFC",
  textSecondary: "#CBD5E1",
  textMuted: "#94A3B8",
  // Surfaces & depth (restrained: thin borders, soft shadows, no glow)
  cardGradient: "linear-gradient(160deg, #0D1828 0%, #0B1422 100%)",
  panelGradient: "linear-gradient(160deg, #122238 0%, #0D1828 100%)",
  shadowSm: "0 1px 2px rgba(2, 6, 14, 0.5)",
  shadowMd: "0 8px 24px rgba(2, 6, 14, 0.45)",
  shadowLg: "0 16px 40px rgba(2, 6, 14, 0.55)",
  fontDisplay: "var(--font-display), system-ui, sans-serif",
} as const;

/** Stats and scorelines align digits with tabular numerals. */
export const tabularNums = { fontVariantNumeric: "tabular-nums" } as const;

// Uppercase eyebrow/technical label, e.g. section markers and card labels.
export const eyebrowSx = {
  fontSize: "0.7rem",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  lineHeight: 1.6,
} as const;

// Shared hover/focus treatment for clickable archive cards: slight lift,
// gold border emphasis, deeper shadow. Transform is disabled for
// reduced-motion users; border/shadow transitions remain.
export const interactiveCardSx = {
  height: "100%",
  transition:
    "border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease",
  "&:hover, &:focus-within": {
    borderColor: atlas.goldBorder,
    transform: "translateY(-2px)",
    boxShadow: atlas.shadowMd,
  },
  "@media (prefers-reduced-motion: reduce)": {
    "&:hover, &:focus-within": { transform: "none" },
  },
} as const;

// Static panel treatment for non-clickable stat/record cards: border
// emphasis only, no lift.
export const glowPanelSx = {
  height: "100%",
  transition: "border-color 180ms ease, box-shadow 180ms ease",
  "&:hover": {
    borderColor: atlas.borderStrong,
    boxShadow: atlas.shadowMd,
  },
} as const;

// Chip tiers — solid fills are reserved for true emphasis (goals,
// champions); everything else is a tint or a ghost outline.
export const chipTintSx = (color: string, bg: string, border: string) =>
  ({
    bgcolor: bg,
    color,
    fontWeight: 600,
    border: "1px solid",
    borderColor: border,
  }) as const;

export const chipGhostSx = {
  color: atlas.textSecondary,
  borderColor: atlas.border,
  bgcolor: "transparent",
} as const;
