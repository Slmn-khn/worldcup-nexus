import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import { formatNumber } from "@/lib/format";

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
    <Card
      sx={{
        height: "100%",
        transition: "border-color 150ms ease, transform 150ms ease",
        "&:hover": {
          borderColor: "primary.main",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardActionArea
        component={Link}
        href={href}
        sx={{ height: "100%", alignItems: "stretch" }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mb: 1.5, alignItems: "center" }}
          >
            <Avatar
              sx={{
                bgcolor: "#142338",
                color: "primary.main",
                border: "1px solid",
                borderColor: "divider",
                fontWeight: 700,
              }}
            >
              {name.charAt(0)}
            </Avatar>
            <Stack>
              <Typography
                variant="h6"
                component="p"
                sx={{ color: "text.primary", lineHeight: 1.3 }}
              >
                {name}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {flagEmoji ? `${flagEmoji} ` : ""}
                {country}
                {position ? ` · ${position}` : ""}
              </Typography>
            </Stack>
          </Stack>
          {counts.length > 0 ? (
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block" }}
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
