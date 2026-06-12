import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Link from "@/components/Link";
import { formatNumber } from "@/lib/format";
import {
  atlas,
  eyebrowSx,
  interactiveCardSx,
  tabularNums,
} from "@/theme/tokens";

type TournamentCardProps = {
  year: number;
  name?: string | null;
  host?: string | null;
  winner?: string | null;
  runnerUp?: string | null;
  finalScore?: string | null;
  teamsCount?: number | null;
  matchesCount?: number | null;
  goalsCount?: number | null;
  summary?: string | null;
  href?: string;
};

export default function TournamentCard({
  year,
  name,
  host,
  winner,
  runnerUp,
  finalScore,
  teamsCount,
  matchesCount,
  goalsCount,
  summary,
  href,
}: TournamentCardProps) {
  const counts = [
    teamsCount != null ? `${formatNumber(teamsCount)} teams` : null,
    matchesCount != null ? `${formatNumber(matchesCount)} matches` : null,
    goalsCount != null ? `${formatNumber(goalsCount)} goals` : null,
  ].filter((part): part is string => part !== null);

  return (
    <Card sx={interactiveCardSx}>
      <CardActionArea
        component={Link}
        href={href ?? `/tournaments/${year}`}
        sx={{ height: "100%", alignItems: "stretch" }}
      >
        <CardContent
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Eyebrow: edition marker + host */}
          <Stack
            direction="row"
            sx={{ mb: 0.75, alignItems: "baseline", gap: 1 }}
          >
            <Typography
              variant="overline"
              component="p"
              sx={{ ...eyebrowSx, color: atlas.textMuted }}
            >
              Edition
            </Typography>
            {host ? (
              <Typography
                variant="caption"
                sx={{ color: atlas.textMuted, ml: "auto" }}
              >
                Host: {host}
              </Typography>
            ) : null}
          </Stack>

          {/* Title: the year carries the card */}
          <Typography
            variant="h3"
            component="p"
            sx={{
              ...tabularNums,
              color: "primary.main",
              fontSize: "2.3rem",
              lineHeight: 1,
              mb: 0.75,
            }}
          >
            {year}
          </Typography>
          {name ? (
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mb: 2 }}
            >
              {name}
            </Typography>
          ) : null}

          {/* Key result */}
          <Box
            sx={{
              bgcolor: atlas.surface2,
              border: `1px solid ${atlas.border}`,
              borderRadius: 2,
              px: 2,
              py: 1.25,
              mb: 2,
            }}
          >
            {winner ? (
              <>
                <Typography
                  variant="body2"
                  sx={{ ...tabularNums, color: "text.primary", fontWeight: 700 }}
                >
                  {finalScore && runnerUp
                    ? `${winner} ${finalScore} ${runnerUp}`
                    : winner}
                </Typography>
                <Typography variant="caption" sx={{ color: atlas.textMuted }}>
                  {finalScore && runnerUp ? "Final" : "Champions"}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Result not yet in the archive
              </Typography>
            )}
          </Box>

          {/* Metadata row */}
          {counts.length > 0 ? (
            <Typography
              variant="caption"
              sx={{ ...tabularNums, color: "text.secondary" }}
            >
              {counts.join(" · ")}
            </Typography>
          ) : null}
          {summary ? (
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              {summary}
            </Typography>
          ) : null}

          {/* CTA affordance */}
          <Typography
            variant="caption"
            sx={{
              color: "primary.main",
              fontWeight: 600,
              mt: "auto",
              pt: 2,
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            View tournament
            <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
