import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import { formatNumber } from "@/lib/format";
import { interactiveCardSx } from "@/theme/tokens";

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
          <Stack
            direction="row"
            sx={{
              mb: 0.5,
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="h3"
              component="p"
              sx={{ color: "primary.main", fontSize: "2rem" }}
            >
              {year}
            </Typography>
            {host ? (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Host: {host}
              </Typography>
            ) : null}
          </Stack>
          {name ? (
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mb: 1.5 }}
            >
              {name}
            </Typography>
          ) : null}
          <Box
            sx={{
              bgcolor: "#13243A",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              px: 2,
              py: 1.25,
              mb: 1.5,
            }}
          >
            {winner ? (
              <>
                <Typography
                  variant="body2"
                  sx={{ color: "text.primary", fontWeight: 700 }}
                >
                  {finalScore && runnerUp
                    ? `${winner} ${finalScore} ${runnerUp}`
                    : winner}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {finalScore && runnerUp ? "Final" : "Champions"}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Result not yet in the archive
              </Typography>
            )}
          </Box>
          {counts.length > 0 ? (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {counts.join(" · ")}
            </Typography>
          ) : null}
          {summary ? (
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              {summary}
            </Typography>
          ) : null}
          <Typography
            variant="caption"
            sx={{ color: "primary.main", fontWeight: 700, mt: "auto", pt: 1.5 }}
          >
            View tournament →
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
