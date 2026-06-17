// Record highlight card (Phase 4). Gold-square eyebrow title, the leader as a
// huge gold condensed value, a short data-honest explanation, and a text link
// to /records. Hairline border, zero radius, no shadow.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import {
  atlas,
  eyebrowSx,
  interactiveCardSx,
  tabularNums,
  textLinkSx,
} from "@/theme/tokens";

type RecordHighlightCardProps = {
  title: string;
  /** The leading entry, e.g. "Miroslav Klose — 16". */
  value: string;
  description: string;
  href?: string;
};

export default function RecordHighlightCard({
  title,
  value,
  description,
  href = "/records",
}: RecordHighlightCardProps) {
  return (
    <Box
      component={Link}
      href={href}
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: atlas.surface1,
        border: `1px solid ${atlas.border}`,
        p: 3,
        ...interactiveCardSx,
      }}
    >
      <Box
        sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, mb: 1.5 }}
      >
        <Box
          aria-hidden
          sx={{
            width: 6,
            height: 6,
            bgcolor: atlas.gold,
            mt: 0.5,
            flexShrink: 0,
          }}
        />
        <Typography component="p" sx={{ ...eyebrowSx, color: atlas.textMuted }}>
          {title}
        </Typography>
      </Box>
      <Typography
        component="p"
        sx={{
          ...tabularNums,
          fontFamily: atlas.fontDisplay,
          fontWeight: 700,
          fontSize: { xs: "1.6rem", md: "1.9rem" },
          textTransform: "uppercase",
          lineHeight: 1.05,
          color: atlas.gold,
          mb: 1.5,
        }}
      >
        {value}
      </Typography>
      <Typography variant="body2" sx={{ color: atlas.textSecondary }}>
        {description}
      </Typography>
      <Box
        sx={{
          ...textLinkSx,
          mt: "auto",
          pt: 2.5,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box component="span">View records</Box>
        <Box component="span" aria-hidden>
          →
        </Box>
      </Box>
    </Box>
  );
}
