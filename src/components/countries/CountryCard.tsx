// Nation dossier card: flag + uppercase name, title count with gold mark,
// data line. Sharp, sparse, typography-led.

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import CountryFlag from "@/components/media/CountryFlag";
import { formatNumber } from "@/lib/format";
import {
  atlas,
  eyebrowSx,
  interactiveCardSx,
  tabularNums,
} from "@/theme/tokens";

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
  // flagEmoji is still accepted for back-compat but superseded by the CSS flag.
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
    <Box
      component={Link}
      href={href}
      sx={{
        display: "block",
        bgcolor: atlas.surface1,
        border: `1px solid ${atlas.border}`,
        p: 3,
        ...interactiveCardSx,
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: "center", mb: 1.5 }}
      >
        {/* CSS flag (flag-icons) with a built-in neutral fallback — never an
            external image, never crashes on an unknown country. */}
        <CountryFlag name={name} code={code} fifaCode={code} size="md" />
        <Typography
          component="p"
          sx={{
            fontFamily: atlas.fontDisplay,
            fontWeight: 700,
            fontSize: "1.25rem",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            color: atlas.textPrimary,
            lineHeight: 1.15,
            minWidth: 0,
          }}
        >
          {name}
        </Typography>
        {code ? (
          <Typography
            component="span"
            sx={{
              ...eyebrowSx,
              fontSize: "0.68rem",
              color: atlas.textMuted,
              ml: "auto !important",
            }}
          >
            {code}
          </Typography>
        ) : null}
      </Stack>
      {titlesCount != null && titlesCount > 0 ? (
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", mb: 1 }}
        >
          <Box aria-hidden sx={{ width: 5, height: 5, bgcolor: atlas.gold }} />
          <Typography
            component="span"
            sx={{ ...eyebrowSx, fontSize: "0.7rem", color: atlas.gold }}
          >
            {formatNumber(titlesCount)} {titlesCount === 1 ? "title" : "titles"}
          </Typography>
        </Stack>
      ) : null}
      {counts.length > 0 ? (
        <Typography
          variant="caption"
          sx={{ ...tabularNums, color: atlas.textMuted, display: "block" }}
        >
          {counts.join(" · ")}
        </Typography>
      ) : null}
      {summary ? (
        <Typography
          variant="body2"
          sx={{ color: atlas.textSecondary, mt: counts.length > 0 ? 1 : 0 }}
        >
          {summary}
        </Typography>
      ) : null}
    </Box>
  );
}
