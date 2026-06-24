// Neon Atlas visual tokens (homepage premium pass). A deep-blue / cyan / gold
// "stadium at night" language layered on top of the base theme. These are
// server-safe plain constants (no "use client") so both server and client
// components can import them, and they are applied per-surface via `sx` so the
// base zero-radius theme stays intact for non-homepage routes.
//
// See docs/UI_STYLE_GUIDE.md for the visual system these encode.

import { brandAssets, cssUrl } from "@/lib/brandAssets";

export const atlasColors = {
  // Canvas — deep stadium blues fading to near-black.
  page: "#020812",
  deepBlue: "#061827",
  surface: "#0B1622",
  surfaceRaised: "#0E2030",
  surfaceGlass: "rgba(10, 20, 32, 0.82)",
  // Accents — trophy gold + electric cyan.
  gold: "#F4C95D",
  goldStrong: "#FFD66B",
  cyan: "#00D9FF",
  cyanStrong: "#39E6FF",
  // Semantic marks.
  green: "#27D07F",
  red: "#FF5470",
  // Text.
  textPrimary: "#F8FAFC",
  textSecondary: "#A8B3C7",
  textMuted: "#6B7280",
} as const;

export const atlasGlow = {
  gold: "rgba(244, 201, 93, 0.45)",
  goldSoft: "rgba(244, 201, 93, 0.18)",
  cyan: "rgba(0, 217, 255, 0.45)",
  cyanSoft: "rgba(0, 217, 255, 0.16)",
} as const;

export const atlasBorders = {
  soft: "rgba(255, 255, 255, 0.12)",
  softStrong: "rgba(255, 255, 255, 0.22)",
  gold: "rgba(244, 201, 93, 0.35)",
  goldStrong: "rgba(244, 201, 93, 0.6)",
  cyan: "rgba(0, 217, 255, 0.35)",
  cyanStrong: "rgba(0, 217, 255, 0.6)",
} as const;

export const atlasShadows = {
  card: "0 10px 34px rgba(0, 0, 0, 0.5)",
  cardHover: "0 16px 48px rgba(0, 0, 0, 0.6)",
  goldGlow:
    "0 0 0 1px rgba(244,201,93,0.32), 0 10px 36px rgba(244,201,93,0.22)",
  goldGlowStrong:
    "0 0 0 1px rgba(244,201,93,0.5), 0 14px 44px rgba(244,201,93,0.34)",
  cyanGlow: "0 0 0 1px rgba(0,217,255,0.32), 0 10px 36px rgba(0,217,255,0.2)",
  cyanGlowStrong:
    "0 0 0 1px rgba(0,217,255,0.5), 0 14px 44px rgba(0,217,255,0.32)",
  textGold: "0 0 18px rgba(244,201,93,0.55)",
  textCyan: "0 0 18px rgba(0,217,255,0.5)",
} as const;

export const atlasRadius = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const atlasGradients = {
  // Full-page atmosphere: cyan glow top-right, gold glow lower-left, deep blue.
  page: [
    "radial-gradient(1200px 720px at 80% -10%, rgba(0,217,255,0.12), transparent 60%)",
    "radial-gradient(900px 620px at 8% 14%, rgba(244,201,93,0.08), transparent 55%)",
    "linear-gradient(180deg, #020812 0%, #03101c 48%, #020812 100%)",
  ].join(", "),
  // Hero panel: brighter cyan core with a gold counter-glow.
  hero: [
    "radial-gradient(900px 520px at 72% 28%, rgba(0,217,255,0.20), transparent 62%)",
    "radial-gradient(720px 460px at 18% 86%, rgba(244,201,93,0.14), transparent 60%)",
    "linear-gradient(155deg, #071B2C 0%, #03101C 70%)",
  ].join(", "),
  surface: "linear-gradient(160deg, #0C1C2C 0%, #06121E 100%)",
  goldCard:
    "linear-gradient(150deg, rgba(244,201,93,0.18) 0%, rgba(11,22,34,0.55) 46%, rgba(8,18,28,0.94) 100%)",
  cyanCard:
    "linear-gradient(150deg, rgba(0,217,255,0.18) 0%, rgba(11,22,34,0.55) 46%, rgba(8,18,28,0.94) 100%)",
  glass:
    "linear-gradient(160deg, rgba(18,32,48,0.7) 0%, rgba(8,16,26,0.86) 100%)",
} as const;

export type AtlasAccent = "gold" | "cyan";

/**
 * A CSS-only "theme" gradient band for a tournament hero fallback (when no
 * approved HERO media exists). Deterministic per year — never an external image.
 */
export function tournamentGradient(year: number): string {
  const themes: Record<number, string> = {
    2026: "linear-gradient(140deg, #0A2A3A 0%, #062033 55%, #03121F 100%)",
    2022: "linear-gradient(140deg, #6E4B12 0%, #1A2A3C 55%, #050D16 100%)",
    2018: "linear-gradient(140deg, #123A52 0%, #0A1E30 55%, #050D16 100%)",
    2014: "linear-gradient(140deg, #1F5B33 0%, #123A2E 55%, #050D16 100%)",
    2010: "linear-gradient(140deg, #7A4A12 0%, #1F2A20 55%, #050D16 100%)",
    2006: "linear-gradient(140deg, #2A3550 0%, #131E30 55%, #050D16 100%)",
    1986: "linear-gradient(140deg, #1F5B33 0%, #4A3A12 55%, #050D16 100%)",
    1970: "linear-gradient(140deg, #2C5A4A 0%, #143126 55%, #050D16 100%)",
  };
  return (
    themes[year] ??
    "linear-gradient(140deg, #0C3346 0%, #0A1E30 55%, #04111D 100%)"
  );
}

/** Convenience sx for an accent text glow on a number/value. */
export function accentTextSx(accent: AtlasAccent) {
  return {
    color: accent === "gold" ? atlasColors.goldStrong : atlasColors.cyanStrong,
    textShadow:
      accent === "gold" ? atlasShadows.textGold : atlasShadows.textCyan,
  } as const;
}

// ---------------------------------------------------------------------------
// Nexus tokens — the app-wide canonical names for the neon theme. These mirror
// the atlas* values above and are the preferred import for new shared
// components (PageShell, PageHero, DataPanel, …). The base theme + the recolored
// atlas tokens (src/theme/tokens.ts) keep older surfaces on the same palette.
// ---------------------------------------------------------------------------

export const nexusColors = {
  background: "#020812",
  backgroundBlue: "#061827",
  surface: "#0B1622",
  surfaceElevated: "#102033",
  surfaceGlass: "rgba(10, 20, 32, 0.82)",

  gold: "#F4C95D",
  goldStrong: "#FFD66B",
  goldMuted: "#B8902E",

  cyan: "#00D9FF",
  cyanStrong: "#39E6FF",
  cyanMuted: "#128EA8",

  textPrimary: "#F8FAFC",
  textSecondary: "#A8B3C7",
  textMuted: "#6B7280",

  borderSoft: "rgba(255, 255, 255, 0.12)",
  borderGold: "rgba(244, 201, 93, 0.35)",
  borderCyan: "rgba(0, 217, 255, 0.35)",
} as const;

export const nexusShadows = {
  goldGlow: "0 0 24px rgba(244, 201, 93, 0.28)",
  cyanGlow: "0 0 24px rgba(0, 217, 255, 0.28)",
  softGlow: "0 20px 60px rgba(0, 217, 255, 0.08)",
} as const;

export const nexusGradients = {
  page: "radial-gradient(circle at 20% 0%, rgba(0,217,255,0.12), transparent 30%), radial-gradient(circle at 80% 10%, rgba(244,201,93,0.08), transparent 28%), #020812",
  card: "linear-gradient(180deg, rgba(16,32,51,0.96), rgba(6,18,30,0.96))",
  goldCard:
    "linear-gradient(145deg, rgba(244,201,93,0.24), rgba(11,22,34,0.96) 45%)",
  cyanCard:
    "linear-gradient(145deg, rgba(0,217,255,0.22), rgba(11,22,34,0.96) 45%)",
} as const;

export const nexusBorders = {
  soft: "1px solid rgba(255,255,255,0.12)",
  gold: "1px solid rgba(244,201,93,0.35)",
  cyan: "1px solid rgba(0,217,255,0.35)",
} as const;

/** Shared corner radius for nexus surfaces (cards, panels, inputs). */
export const nexusRadius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
} as const;

// ---------------------------------------------------------------------------
// Decorative background image layers (brand assets in public/assets/brand/).
//
// Each "*WithImage" value layers a strong dark overlay (plus cyan/gold glow)
// ABOVE a brand image, so text stays readable and the surface still looks
// on-brand if the image is missing or fails to load — the gradient layers carry
// the look on their own. Always pair these with:
//   backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat".
// On a global page background, avoid `backgroundAttachment: fixed` on mobile
// (use { xs: "scroll", md: "fixed" }) — fixed attachment is janky on phones.
// ---------------------------------------------------------------------------

/** Near-opaque page overlay: subtle cyan/gold glow over a deep-navy wash. */
const PAGE_OVERLAY = `radial-gradient(circle at 15% 0%, rgba(0,217,255,0.12), transparent 28%),
radial-gradient(circle at 85% 8%, rgba(244,201,93,0.09), transparent 28%),
linear-gradient(rgba(2,8,18,0.92), rgba(2,8,18,0.96))`;

/** Hero overlay: side-darkened band with a cyan core glow for headline contrast. */
const HERO_OVERLAY = `linear-gradient(90deg, rgba(2,8,18,0.94) 0%, rgba(2,8,18,0.70) 45%, rgba(2,8,18,0.94) 100%),
radial-gradient(circle at 65% 35%, rgba(0,217,255,0.18), transparent 34%)`;

export const nexusBackgrounds = {
  /** Overlay-only page wash (no image) — the readable fallback layer. */
  pageOverlay: PAGE_OVERLAY,
  /** Global page background: overlay + subtle texture image. */
  pageWithImage: `${PAGE_OVERLAY}, ${cssUrl(brandAssets.pageBackground)}`,
  /** Overlay-only hero wash (no image). */
  heroOverlay: HERO_OVERLAY,
  /** Homepage hero: overlay + banner image. */
  heroWithImage: `${HERO_OVERLAY}, ${cssUrl(brandAssets.heroBanner)}`,
  /** Generic page hero: overlay + stadium-glow image. */
  stadiumWithImage: `${HERO_OVERLAY}, ${cssUrl(brandAssets.stadiumGlow)}`,
} as const;

export type PageHeroBackgroundVariant = "default" | "stadium" | "banner" | "none";

/**
 * Background-image stack for a generic PageHero. `customUrl` (when provided)
 * wins; otherwise the variant selects a brand image. `none` is gradient-only.
 * Every variant keeps a strong dark overlay for text contrast.
 */
export function pageHeroBackground(
  variant: PageHeroBackgroundVariant = "default",
  customUrl?: string,
): string {
  if (customUrl != null && customUrl !== "") {
    return `${HERO_OVERLAY}, ${cssUrl(customUrl)}`;
  }
  switch (variant) {
    case "none":
      return atlasGradients.hero;
    case "banner":
      return nexusBackgrounds.heroWithImage;
    case "default":
    case "stadium":
    default:
      return nexusBackgrounds.stadiumWithImage;
  }
}
