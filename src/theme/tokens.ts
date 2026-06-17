// Checkpoint 7C Revised — "WORLDCUP Nexus Vault Editorial System" tokens.
// Server-safe (no "use client") so both server and client components can
// import them.
//
// The system is a near-pure black canvas holding white uppercase display
// type, light gray body copy, 1px hairlines, and zero-radius surfaces.
// Gold is a micro accent (eyebrow squares, record values, champions) —
// never large fills. The green/gold/red stripe is a brand-identity marker
// only: footer wordmark, nav, major archive moments — never a button fill,
// never a background.
// Recolored to the Nexus neon palette (deep-blue canvas, trophy gold + electric
// cyan accents). Token NAMES are unchanged so every existing surface that reads
// `atlas.*` inherits the new theme with no per-component edits. Mirrors
// `nexusColors` in src/theme/visualTokens.ts.
export const atlas = {
  // Canvas — deep stadium blues fading toward near-black.
  black: "#020812",
  bgBase: "#020812",
  canvasSoft: "#03101C",
  surfaceSoft: "#07131F",
  surface1: "#0B1622", // cards
  surface2: "#102033", // elevated
  surface3: "#16293B", // carbon
  deepNavy: "#061827",
  // Hairlines — soft white instead of charcoal.
  border: "rgba(255, 255, 255, 0.12)",
  borderStrong: "rgba(255, 255, 255, 0.22)",
  // Accent — trophy gold.
  gold: "#F4C95D",
  goldStrong: "#FFD66B",
  goldSoft: "#F4C95D",
  goldTint: "rgba(244, 201, 93, 0.14)",
  goldBorder: "rgba(244, 201, 93, 0.40)",
  // Stripe + semantic marks.
  pitchGreen: "#27D07F",
  cardRed: "#FF5470",
  green: "#27D07F",
  red: "#FF5470",
  yellow: "#FACC15",
  // Text.
  textPrimary: "#F8FAFC",
  textSecondary: "#A8B3C7",
  bodyStrong: "#E6EDF7",
  textMuted: "#6B7280",
  // Surfaces & depth.
  cardGradient: "#0B1622",
  panelGradient: "#0B1622",
  shadowSm: "none",
  shadowMd: "none",
  shadowLg: "none",
  fontDisplay: "var(--font-display), system-ui, sans-serif",
} as const;

/** Stats and scorelines align digits with tabular numerals. */
export const tabularNums = { fontVariantNumeric: "tabular-nums" } as const;

// Uppercase letterspaced label — the "machined" Vault voice.
export const eyebrowSx = {
  fontSize: "0.75rem",
  fontWeight: 700,
  letterSpacing: "0.125em",
  textTransform: "uppercase",
  lineHeight: 1.5,
} as const;

// Uppercase text-link label with arrow, e.g. "ALL TOURNAMENTS →".
export const textLinkSx = {
  ...eyebrowSx,
  color: atlas.textPrimary,
  display: "inline-flex",
  alignItems: "center",
  gap: 0.75,
  transition: "color 150ms ease",
  "&:hover": { color: atlas.goldStrong },
} as const;

// Interactive card treatment: zero radius, hairline border; hover sharpens
// the border. No lift, no glow, no shadow — precision, not bounce.
export const interactiveCardSx = {
  height: "100%",
  transition: "border-color 150ms ease, background-color 150ms ease",
  "&:hover, &:focus-within": {
    borderColor: atlas.borderStrong,
    bgcolor: atlas.surface2,
  },
} as const;

// Static panel treatment for non-clickable stat/record cells.
export const glowPanelSx = {
  height: "100%",
  transition: "border-color 150ms ease",
  "&:hover": {
    borderColor: atlas.borderStrong,
  },
} as const;

// Chip tiers — rectangular minimal labels; solid fills reserved for literal
// card colors and true emphasis.
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
