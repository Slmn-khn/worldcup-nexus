// Player record card (Phase 4). Reuses the fallback-first PlayerPortrait — an
// approved curated portrait when one exists, otherwise the dark charcoal +
// gold initials crest (never a broken image, never a hardcoded URL). Shows the
// player's World Cup goals as the record value, with an honest scope.

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
import type { HomePlayerRecord } from "@/server/home/queries";

export default function PlayerRecordCard({
  player,
}: {
  player: HomePlayerRecord;
}) {
  return (
    <Box
      component={Link}
      href={`/players/${player.slug}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        bgcolor: atlas.surface1,
        border: `1px solid ${atlas.border}`,
        p: 3,
        ...interactiveCardSx,
      }}
    >
      <PlayerPortrait
        name={player.name}
        imageUrl={player.portraitUrl}
        countryName={player.countryName}
        size="lg"
        alt={`${player.name} portrait`}
      />
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
          mt: 2,
        }}
      >
        {player.name}
      </Typography>
      <Typography
        component="p"
        sx={{
          ...eyebrowSx,
          fontSize: "0.66rem",
          color: atlas.textMuted,
          mt: 0.75,
        }}
      >
        {player.countryName ?? "Nation unknown"}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ alignItems: "baseline", mt: 2 }}>
        <Typography
          component="span"
          sx={{
            ...tabularNums,
            fontFamily: atlas.fontDisplay,
            fontWeight: 700,
            fontSize: "1.6rem",
            lineHeight: 1,
            color: atlas.gold,
          }}
        >
          {formatNumber(player.goals)}
        </Typography>
        <Typography
          component="span"
          sx={{ ...eyebrowSx, fontSize: "0.62rem", color: atlas.textMuted }}
        >
          World Cup goals
        </Typography>
      </Stack>
    </Box>
  );
}
