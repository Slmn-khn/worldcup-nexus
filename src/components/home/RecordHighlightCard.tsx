// Record highlight card (neon pass). A glowing badge-card: a NeonChip title,
// the leader as a large glowing value, a short data-honest explanation, and a
// CTA to /records. Gold or cyan accent.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import GlowCard from "@/components/ui/GlowCard";
import NeonChip from "@/components/ui/NeonChip";
import { atlas } from "@/theme/tokens";
import {
  atlasColors,
  accentTextSx,
  type AtlasAccent,
} from "@/theme/visualTokens";

type RecordHighlightCardProps = {
  title: string;
  /** The leading entry, e.g. "Miroslav Klose — 16". */
  value: string;
  description: string;
  href?: string;
  accent?: AtlasAccent;
};

export default function RecordHighlightCard({
  title,
  value,
  description,
  href = "/records",
  accent = "gold",
}: RecordHighlightCardProps) {
  return (
    <GlowCard
      variant={accent}
      clickable
      component={Link}
      href={href}
      sx={{ display: "flex", flexDirection: "column", p: 2.75 }}
    >
      <Box sx={{ mb: 1.75 }}>
        <NeonChip accent={accent} dot label={title} />
      </Box>
      <Typography
        component="p"
        sx={{
          fontFamily: atlas.fontDisplay,
          fontWeight: 700,
          fontSize: { xs: "1.4rem", md: "1.65rem" },
          textTransform: "uppercase",
          lineHeight: 1.05,
          mb: 1.25,
          ...accentTextSx(accent),
        }}
      >
        {value}
      </Typography>
      <Typography variant="body2" sx={{ color: atlasColors.textSecondary }}>
        {description}
      </Typography>
      <Box
        sx={{
          mt: "auto",
          pt: 2.25,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color:
            accent === "gold" ? atlasColors.goldStrong : atlasColors.cyanStrong,
        }}
      >
        <Box component="span">View records</Box>
        <Box component="span" aria-hidden>
          →
        </Box>
      </Box>
    </GlowCard>
  );
}
