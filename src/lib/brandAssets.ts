// Brand image asset URLs (decorative only). These point at static files under
// public/assets/brand/. They are referenced as URL strings — never imported as
// modules — so the build never fails when a file is absent, and every surface
// that uses them layers a strong dark gradient on top, so the page stays fully
// readable (and on-brand) even if an image fails to load or has not been added
// yet. Replace the files in place to restyle without touching code.
//
// Only local / generated / owned assets belong here — no FIFA marks, no
// copyrighted match photos, no remote URLs.

export const brandAssets = {
  heroBanner: "/assets/brand/nexus-hero-banner.webp",
  pageBackground: "/assets/brand/nexus-page-background.webp",
  stadiumGlow: "/assets/brand/nexus-stadium-glow.webp",
} as const;

export type BrandAssetKey = keyof typeof brandAssets;

/** Wrap a URL string for use in a CSS `background-image` layer. */
export function cssUrl(url: string): string {
  return `url("${url}")`;
}
