// Shared page-hero surface: deep gradient panel with a restrained gold (and
// faint cyan) light source and a bottom hairline. Server-safe, pure CSS.
// Every page header sits on this surface so the app has one consistent
// "above the fold" material.

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { atlas } from "@/theme/tokens";

type HeroSurfaceProps = {
  children: React.ReactNode;
  /** "deep" = index/detail headers; "feature" = homepage-scale heroes. */
  variant?: "deep" | "feature";
  sx?: SxProps<Theme>;
};

export default function HeroSurface({
  children,
  variant = "deep",
  sx,
}: HeroSurfaceProps) {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderBottom: `1px solid ${atlas.border}`,
        background:
          variant === "feature"
            ? `radial-gradient(ellipse 75% 65% at 72% -12%, rgba(244, 201, 93, 0.1), transparent 68%), ` +
              `radial-gradient(ellipse 50% 45% at -4% 65%, rgba(56, 189, 248, 0.06), transparent 70%), ` +
              `linear-gradient(180deg, ${atlas.deepNavy} 0%, ${atlas.bgBase} 100%)`
            : `radial-gradient(ellipse 65% 80% at 82% -25%, rgba(244, 201, 93, 0.08), transparent 70%), ` +
              `radial-gradient(ellipse 40% 45% at 0% 110%, rgba(56, 189, 248, 0.05), transparent 70%), ` +
              `linear-gradient(180deg, ${atlas.deepNavy} 0%, ${atlas.bgBase} 100%)`,
      }}
    >
      <Box sx={{ position: "relative", ...sx }}>{children}</Box>
    </Box>
  );
}
