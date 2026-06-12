import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
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
    <Card sx={interactiveCardSx}>
      <CardActionArea
        component={Link}
        href={href}
        sx={{ height: "100%", alignItems: "stretch" }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Eyebrow: tournament · stage (one quiet line, not two chips) */}
          <Typography
            variant="overline"
            component="p"
            sx={{ ...eyebrowSx, color: atlas.textMuted, mb: 1.25 }}
          >
            {tournament}
            <Typography
              component="span"
              sx={{ ...eyebrowSx, color: "primary.main", ml: 1 }}
            >
              {formatStage(stage)}
            </Typography>
          </Typography>

          <Typography
            variant="h6"
            component="p"
            sx={{ color: "text.primary", lineHeight: 1.3, mb: 0.75 }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            component="p"
            sx={{
              ...tabularNums,
              color: "primary.main",
              fontSize: "1.7rem",
              mb: summary ? 1.25 : 0,
            }}
          >
            {score}
          </Typography>
          {summary ? (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {summary}
            </Typography>
          ) : null}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
