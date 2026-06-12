import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import Link from "@/components/Link";
import { formatNumber } from "@/lib/format";
import { atlas, interactiveCardSx, tabularNums } from "@/theme/tokens";

type PlayerCardProps = {
  name: string;
  country: string;
  flagEmoji?: string | null;
  position?: string | null;
  summary?: string;
  /** Squad selections — NOT match appearances. */
  selectedTournamentsCount?: number | null;
  goalsCount?: number | null;
  awardsCount?: number | null;
  href?: string;
};

export default function PlayerCard({
  name,
  country,
  flagEmoji,
  position,
  summary,
  selectedTournamentsCount,
  goalsCount,
  awardsCount,
  href = "/players",
}: PlayerCardProps) {
  const counts = [
    selectedTournamentsCount != null
      ? `${formatNumber(selectedTournamentsCount)} ${selectedTournamentsCount === 1 ? "squad" : "squads"}`
      : null,
    goalsCount != null ? `${formatNumber(goalsCount)} goals` : null,
    awardsCount != null && awardsCount > 0
      ? `${formatNumber(awardsCount)} awards`
      : null,
  ].filter((part): part is string => part !== null);

  return (
    <Card sx={interactiveCardSx}>
      <CardActionArea
        component={Link}
        href={href}
        sx={{ height: "100%", alignItems: "stretch" }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mb: counts.length > 0 || summary ? 1.5 : 0 }}
          >
            {/* Identity tile: nation flag (or a neutral person mark) +
                position code — replaces the letter avatar. */}
            <Box
              aria-hidden
              sx={{
                width: 44,
                height: 44,
                flexShrink: 0,
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: atlas.surface2,
                border: `1px solid ${atlas.border}`,
                gap: 0.1,
              }}
            >
              {flagEmoji ? (
                <Typography component="span" sx={{ fontSize: "1.15rem", lineHeight: 1 }}>
                  {flagEmoji}
                </Typography>
              ) : (
                <PersonRoundedIcon
                  sx={{ fontSize: 18, color: atlas.textMuted }}
                />
              )}
              {position ? (
                <Typography
                  component="span"
                  sx={{
                    fontSize: "0.58rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: atlas.textMuted,
                    lineHeight: 1,
                  }}
                >
                  {position}
                </Typography>
              ) : null}
            </Box>
            <Stack sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                component="p"
                sx={{ color: "text.primary", lineHeight: 1.25 }}
              >
                {name}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {country}
                {position ? ` · ${position}` : ""}
              </Typography>
            </Stack>
          </Stack>
          {counts.length > 0 ? (
            <Typography
              variant="caption"
              sx={{ ...tabularNums, color: "text.secondary", display: "block" }}
            >
              {counts.join(" · ")}
            </Typography>
          ) : null}
          {summary ? (
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: counts.length > 0 ? 1 : 0 }}
            >
              {summary}
            </Typography>
          ) : null}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
