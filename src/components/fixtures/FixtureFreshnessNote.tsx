// Small "Last synced X ago" line, with a quiet stale warning when the data is
// older than the freshness threshold. Honest about data age — never hidden.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { atlas, eyebrowSx } from "@/theme/tokens";
import type { FixtureFreshness } from "@/server/fixtures/types";

export default function FixtureFreshnessNote({
  freshness,
  sourceNote = "OpenFootball baseline · worldcup26 live (when available)",
}: {
  freshness: FixtureFreshness;
  sourceNote?: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <Box
        component="span"
        aria-hidden
        sx={{
          width: 7,
          height: 7,
          bgcolor: freshness.isStale ? atlas.textMuted : atlas.gold,
        }}
      />
      <Typography
        component="span"
        sx={{ ...eyebrowSx, fontSize: "0.62rem", color: atlas.textSecondary }}
      >
        {freshness.label}
        {freshness.isStale && freshness.lastSyncedAt !== null
          ? " · data may be stale"
          : ""}
      </Typography>
      <Typography
        component="span"
        sx={{ fontSize: "0.72rem", color: atlas.textMuted }}
      >
        {sourceNote}
      </Typography>
    </Box>
  );
}
