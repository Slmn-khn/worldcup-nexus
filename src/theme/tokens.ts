// Checkpoint 7C — "Cinematic Football Intelligence" design tokens.
// Server-safe (no "use client") so both server and client components can
// import them. Gold stays the brand/history/trophy color; cyan is
// interaction, search, and data panels; neon green is positive stats and
// pitch energy (sparing); purple is rare glow depth only. Never use neon
// colors for body text.
export const atlas = {
  bgBase: "#050B14",
  deepNavy: "#06111F",
  surface: "#0E1A2A",
  surfaceElevated: "#13243A",
  border: "#263B56",
  gold: "#F4C95D",
  goldGlow: "rgba(244, 201, 93, 0.35)",
  goldBorder: "rgba(244, 201, 93, 0.22)",
  cyan: "#22D3EE",
  cyanGlow: "rgba(34, 211, 238, 0.28)",
  green: "#A3E635",
  greenGlow: "rgba(163, 230, 53, 0.25)",
  purple: "#8B5CF6",
  purpleGlow: "rgba(139, 92, 246, 0.22)",
  textPrimary: "#F8FAFC",
  textSecondary: "#CBD5E1",
  textMuted: "#94A3B8",
  cardGradient: "linear-gradient(145deg, #0E1A2A, #101827)",
} as const;

// Shared hover/focus treatment for clickable archive cards: lift, gold/cyan
// edge glow, and focus-within parity. Transform is disabled for
// reduced-motion users; color/border transitions remain.
export const interactiveCardSx = {
  height: "100%",
  transition:
    "border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease",
  "&:hover, &:focus-within": {
    borderColor: "rgba(244, 201, 93, 0.55)",
    transform: "translateY(-3px)",
    boxShadow:
      "0 14px 40px rgba(2, 8, 20, 0.55), 0 0 24px rgba(244, 201, 93, 0.16), 0 0 14px rgba(34, 211, 238, 0.12)",
  },
  "@media (prefers-reduced-motion: reduce)": {
    "&:hover, &:focus-within": { transform: "none" },
  },
} as const;

// Static panel glow for non-clickable stat/record cards: border + glow only,
// no lift.
export const glowPanelSx = {
  height: "100%",
  transition: "border-color 200ms ease, box-shadow 200ms ease",
  "&:hover": {
    borderColor: "rgba(244, 201, 93, 0.45)",
    boxShadow:
      "0 10px 32px rgba(2, 8, 20, 0.5), 0 0 20px rgba(244, 201, 93, 0.12)",
  },
} as const;
