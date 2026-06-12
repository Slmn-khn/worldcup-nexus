// The Vault identity stripe: a tiny 4px green/gold/red mark (pitch, trophy,
// card). Brand-identity only — used under the wordmark, on the active nav
// item, and at major archive moments. NEVER a button fill, NEVER a large
// background.

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { atlas } from "@/theme/tokens";

export default function VaultStripe({
  width = 56,
  sx,
}: {
  width?: number | string;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      aria-hidden
      sx={{ display: "flex", width, height: "4px", ...sx }}
    >
      <Box sx={{ flex: 1, bgcolor: atlas.pitchGreen }} />
      <Box sx={{ flex: 1, bgcolor: atlas.gold }} />
      <Box sx={{ flex: 1, bgcolor: atlas.cardRed }} />
    </Box>
  );
}
