// Section eyebrow: small gold square + uppercase letterspaced label,
// e.g. "THE ARCHIVE · 1930–2022", "LATEST EDITIONS", "STILL STANDING".

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import { atlas, eyebrowSx } from "@/theme/tokens";

export default function VaultEyebrow({
  label,
  /** Square accent color — gold by default; red reserved for rare emphasis. */
  accent = atlas.gold,
  sx,
}: {
  label: string;
  accent?: string;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, ...sx }}>
      <Box
        aria-hidden
        sx={{ width: 6, height: 6, bgcolor: accent, flexShrink: 0 }}
      />
      <Typography
        component="span"
        sx={{ ...eyebrowSx, color: atlas.textSecondary }}
      >
        {label}
      </Typography>
    </Box>
  );
}
