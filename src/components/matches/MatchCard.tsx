// Match card (PDF page 4 anatomy in card form): year/stage eyebrow, teams,
// center score in condensed type, venue/context metadata.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import { formatStage } from "@/lib/format";
import {
  atlas,
  eyebrowSx,
  interactiveCardSx,
  tabularNums,
} from "@/theme/tokens";

type MatchCardProps = {
  title: string;
  tournament: string;
  score: string;
  stage: string;
  summary?: string;
  href?: string;
};

export default function MatchCard({
  title,
  tournament,
  score,
  stage,
  summary,
  href = "/matches",
}: MatchCardProps) {
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
      <Typography
        component="p"
        sx={{ ...eyebrowSx, color: atlas.textMuted, mb: 1.5 }}
      >
        {tournament}
        <Box component="span" sx={{ color: atlas.gold, ml: 1 }}>
          {formatStage(stage)}
        </Box>
      </Typography>
      <Typography
        component="p"
        sx={{
          fontFamily: atlas.fontDisplay,
          fontWeight: 600,
          fontSize: "1.15rem",
          textTransform: "uppercase",
          letterSpacing: "0.02em",
          color: atlas.textPrimary,
          lineHeight: 1.25,
          mb: 0.75,
        }}
      >
        {title}
      </Typography>
      <Typography
        component="p"
        sx={{
          ...tabularNums,
          fontFamily: atlas.fontDisplay,
          fontWeight: 700,
          fontSize: "1.9rem",
          lineHeight: 1.05,
          color: atlas.textPrimary,
        }}
      >
        {score}
      </Typography>
      {summary ? (
        <Typography
          variant="caption"
          sx={{ color: atlas.textMuted, display: "block", mt: 1.5 }}
        >
          {summary}
        </Typography>
      ) : null}
    </Box>
  );
}
