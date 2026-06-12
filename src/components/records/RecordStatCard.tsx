import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
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

/** Highlighted #1 record (e.g. most goals by a player). Real data only. */
export default function RecordStatCard({
  title,
  item,
}: {
  title: string;
  item: RecordItemDto;
}) {
  const content = (
    <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
      <Typography
        variant="overline"
        component="p"
        aria-label={`Record: ${title}, ranked first`}
        sx={{ ...eyebrowSx, color: atlas.textMuted, mb: 1 }}
      >
        <Typography
          component="span"
          sx={{ ...eyebrowSx, color: atlas.cyan, mr: 0.75 }}
        >
          №1
        </Typography>
        {title}
      </Typography>
      <Typography
        variant="h3"
        component="p"
        sx={{
          ...tabularNums,
          color: "primary.main",
          fontSize: { xs: "2rem", md: "2.5rem" },
          lineHeight: 1,
        }}
      >
        {formatNumber(item.value)}
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: "text.primary", fontWeight: 600, mt: 1, lineHeight: 1.35 }}
      >
        {noBreakScores(item.label)}
      </Typography>
      {item.detail !== null ? (
        <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5 }}>
          {item.detail}
        </Typography>
      ) : null}
    </CardContent>
  );

  if (item.href !== null) {
    return (
      <Card sx={interactiveCardSx}>
        <CardActionArea
          component={Link}
          href={item.href}
          sx={{ height: "100%", alignItems: "stretch" }}
        >
          {content}
        </CardActionArea>
      </Card>
    );
  }
  return <Card sx={glowPanelSx}>{content}</Card>;
}
