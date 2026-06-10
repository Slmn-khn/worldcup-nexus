import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import { formatNumber } from "@/lib/format";

type CountryCardProps = {
  name: string;
  flagEmoji?: string | null;
  summary?: string;
  code?: string | null;
  tournamentsCount?: number | null;
  matchesCount?: number | null;
  goalsCount?: number | null;
  titlesCount?: number | null;
  href?: string;
};

export default function CountryCard({
  name,
  flagEmoji,
  summary,
  code,
  tournamentsCount,
  matchesCount,
  goalsCount,
  titlesCount,
  href = "/countries",
}: CountryCardProps) {
  const counts = [
    tournamentsCount != null
      ? `${formatNumber(tournamentsCount)} tournaments`
      : null,
    matchesCount != null ? `${formatNumber(matchesCount)} matches` : null,
    goalsCount != null ? `${formatNumber(goalsCount)} goals` : null,
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
            sx={{ mb: 1, alignItems: "center" }}
          >
            {flagEmoji ? (
              <Typography
                component="span"
                sx={{ fontSize: "1.6rem", lineHeight: 1 }}
                aria-hidden
              >
                {flagEmoji}
              </Typography>
            ) : null}
            <Typography
              variant="h6"
              component="p"
              sx={{ color: "text.primary" }}
            >
              {name}
            </Typography>
            {code ? (
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", ml: "auto !important" }}
              >
                {code}
              </Typography>
            ) : null}
          </Stack>
          {titlesCount != null && titlesCount > 0 ? (
            <Typography
              variant="caption"
              sx={{
                color: "primary.main",
                fontWeight: 700,
                display: "block",
                mb: 0.5,
              }}
            >
              {formatNumber(titlesCount)}{" "}
              {titlesCount === 1 ? "title" : "titles"}
            </Typography>
          ) : null}
          {counts.length > 0 ? (
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "block",
                mb: summary ? 1 : 0,
              }}
            >
              {counts.join(" · ")}
            </Typography>
          ) : null}
          {summary ? (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {summary}
            </Typography>
          ) : null}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
