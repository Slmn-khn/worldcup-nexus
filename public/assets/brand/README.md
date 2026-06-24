# Brand background assets

Decorative background images for WORLDCUP Nexus. **All three are optional** —
every surface that uses them layers a strong dark gradient on top, so the app
stays readable and on-brand if a file is missing or fails to load. Referenced by
URL only (never imported) via [`src/lib/brandAssets.ts`](../../../src/lib/brandAssets.ts),
so the build never fails when a file is absent.

## Expected files

| File | Used by | Suggested size |
| --- | --- | --- |
| `nexus-hero-banner.webp` | Homepage hero (`HomeHero`) and `PageHero` `banner` variant | ~1920×900 |
| `nexus-page-background.webp` | App-wide page background (`AppShell`) | ~1600×1000 |
| `nexus-stadium-glow.webp` | `PageHero` `default`/`stadium` variant | ~1600×900 |

## Rules for these assets

- **Owned / generated / properly licensed only.** No official FIFA logos or
  marks, no copyrighted match photographs, no images pulled from web search.
- Optimized **WebP** (or AVIF). Keep each file small — these are subtle,
  near-fully-overlaid textures, not focal imagery. Avoid large files.
- Decorative only: they convey no information and need no `alt` text.
- On-brand palette: deep navy (`#020812`) canvas with electric-cyan (`#00D9FF`)
  and trophy-gold (`#F4C95D`) glow accents. Abstract texture / stadium-glow —
  no people, no trademarks.

Drop the files in this folder to enable them; no code change is required.
