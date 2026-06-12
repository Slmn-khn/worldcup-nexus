// Highlighted #1 record: record-card anatomy with the value as the hero
// and the holder as the context line. Real data only.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import { formatNumber } from "@/lib/format";
import {
  atlas,
  eyebrowSx,
  glowPanelSx,
  interactiveCardSx,
  tabularNums,
} from "@/theme/tokens";
import type { RecordItemDto } from "@/server/queries/types";

/**
 * Keeps scorelines like "13–0" from line-breaking after the dash by joining
 * digit–dash–digit sequences with word-joiner characters. Display only.
 */
function noBreakScores(label: string): string {
  // The string below is U+2060 WORD JOINER (invisible, zero-width).
  const WORD_JOINER = "⁠";
  return label.replace(
    /(\d)([–-])(\d)/g,
    `$1${WORD_JOINER}$2${WORD_JOINER}$3`,
  );
}

export default function RecordStatCard({
  title,
  item,
}: {
  title: string;
  item: RecordItemDto;
}) {
  const content = (
    <>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, mb: 1.5 }}>
        <Box
          aria-hidden
          sx={{ width: 6, height: 6, bgcolor: atlas.gold, mt: 0.5, flexShrink: 0 }}
        />
        <Typography component="p" sx={{ ...eyebrowSx, color: atlas.textMuted }}>
          №1 · {title}
        </Typography>
      </Box>
      <Typography
        component="p"
        sx={{
          ...tabularNums,
          fontFamily: atlas.fontDisplay,
          fontWeight: 700,
          fontSize: { xs: "2.1rem", md: "2.6rem" },
          lineHeight: 1,
          color: atlas.gold,
        }}
      >
        {formatNumber(item.value)}
      </Typography>
      <Typography
        sx={{ color: atlas.textPrimary, fontWeight: 600, mt: 1, lineHeight: 1.3 }}
      >
        {noBreakScores(item.label)}
      </Typography>
      {item.detail !== null ? (
        <Typography
          variant="caption"
          sx={{ color: atlas.textMuted, display: "block", mt: 0.5 }}
        >
          {item.detail}
        </Typography>
      ) : null}
    </>
  );

  if (item.href !== null) {
    return (
      <Box
        component={Link}
        href={item.href}
        sx={{
          display: "block",
          bgcolor: atlas.surface1,
          border: `1px solid ${atlas.border}`,
          p: 3,
          ...interactiveCardSx,
        }}
      >
        {content}
      </Box>
    );
  }
  return (
    <Box
      sx={{
        bgcolor: atlas.surface1,
        border: `1px solid ${atlas.border}`,
        p: 3,
        ...glowPanelSx,
      }}
    >
      {content}
    </Box>
  );
}
