// Checkpoint 7C Revised — "WorldCup Atlas Vault Editorial System" tokens.
// Server-safe (no "use client") so both server and client components can
// import them.
//
// The system is a near-pure black canvas holding white uppercase display
// type, light gray body copy, 1px hairlines, and zero-radius surfaces.
// Gold is a micro accent (eyebrow squares, record values, champions) —
// never large fills. The green/gold/red stripe is a brand-identity marker
// only: footer wordmark, nav, major archive moments — never a button fill,
// never a background.
export const atlas = {
  // Canvas
  black: "#000000",
  bgBase: "#000000",
  canvasSoft: "#080808",
  surfaceSoft: "#0D0D0D",
  surface1: "#171717", // cards
  surface2: "#222222", // elevated
  surface3: "#2B2B2B", // carbon
  deepNavy: "#080808", // legacy alias → canvasSoft
  // Hairlines
  border: "#2A2A2A",
  borderStrong: "#3C3C3C",
  // Accent (micro use only)
  gold: "#D6A84F",
  goldStrong: "#F4C95D",
  goldSoft: "#D6A84F",
  goldTint: "rgba(214, 168, 79, 0.12)",
  goldBorder: "rgba(214, 168, 79, 0.45)",
  // Stripe identity colors (stripe + tiny semantic marks only)
  pitchGreen: "#1F8A4C",
  cardRed: "#D9293E",
  green: "#1F8A4C",
  red: "#D9293E",
  yellow: "#FACC15",
  // Text
  textPrimary: "#FFFFFF",
  textSecondary: "#BBBBBB",
  bodyStrong: "#E6E6E6",
  textMuted: "#7E7E7E",
  // Surfaces & depth — flat: no gradients, no shadows
  cardGradient: "#171717",
  panelGradient: "#171717",
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
