// GlowingSearchBar — the homepage search surface. Wraps the functional
// GlobalSearch (debounced /api/search dropdown) in an ambient cyan glow halo.
// No search logic changes here; the neon styling lives on GlobalSearch's input
// and this halo. Server-safe wrapper around the client GlobalSearch.

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import GlobalSearch from "./GlobalSearch";
import { atlasGlow } from "@/theme/visualTokens";

export default function GlowingSearchBar({ sx }: { sx?: SxProps<Theme> }) {
  return (
    <Box sx={{ position: "relative", ...sx }}>
      {/* Soft cyan halo bloom behind the input — decorative only. */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: "-18px -8px",
          borderRadius: "24px",
          background: `radial-gradient(60% 120% at 50% 50%, ${atlasGlow.cyanSoft}, transparent 70%)`,
          filter: "blur(8px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <GlobalSearch />
      </Box>
    </Box>
  );
}
