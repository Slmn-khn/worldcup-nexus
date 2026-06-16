// Player dossier card: uppercase condensed name, nation/position metadata,
// data line. No fake photos — typography and data hierarchy carry it.

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import PlayerPortrait from "@/components/media/PlayerPortrait";
import { formatNumber } from "@/lib/format";
import {
  atlas,
  eyebrowSx,
  interactiveCardSx,
  tabularNums,
} from "@/theme/tokens";

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
      <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
        {/* Fallback-first portrait: renders initials (no image data needed) so
            it is safe with zero media rows. */}
        <PlayerPortrait name={name} countryName={country} size="sm" />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            component="p"
            sx={{
              ...eyebrowSx,
              fontSize: "0.7rem",
              color: atlas.textMuted,
              mb: 1,
            }}
          >
            {flagEmoji ? `${flagEmoji} ` : ""}
            {country}
            {position ? (
              <Box component="span" sx={{ color: atlas.gold, ml: 1 }}>
                {position}
              </Box>
            ) : null}
          </Typography>
          <Typography
            component="p"
            sx={{
              fontFamily: atlas.fontDisplay,
              fontWeight: 700,
              fontSize: "1.35rem",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
              color: atlas.textPrimary,
              lineHeight: 1.15,
            }}
          >
            {name}
          </Typography>
        </Box>
      </Stack>
      {counts.length > 0 ? (
        <Typography
          variant="caption"
          sx={{
            ...tabularNums,
            color: atlas.textMuted,
            display: "block",
            mt: 1.5,
          }}
        >
          {counts.join(" · ")}
        </Typography>
      ) : null}
      {summary ? (
        <Typography
          variant="body2"
          sx={{ color: atlas.textSecondary, mt: counts.length > 0 ? 1 : 1.5 }}
        >
          {summary}
        </Typography>
      ) : null}
    </Box>
  );
}
