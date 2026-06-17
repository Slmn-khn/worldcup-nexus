// Player record card (neon pass). A collectible-style card: a tall spotlit
// portrait area (the fallback-first PlayerPortrait — approved curated image when
// one exists, otherwise the dark charcoal + gold initials crest with a country
// flag badge, never a broken image, never a hardcoded URL), then the player
// name and their World Cup goals as a glowing record value.

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import GlowCard from "@/components/ui/GlowCard";
import PlayerPortrait from "@/components/media/PlayerPortrait";
import { atlas } from "@/theme/tokens";
import { formatNumber } from "@/lib/format";
import {
  atlasColors,
  atlasGlow,
  accentTextSx,
  type AtlasAccent,
} from "@/theme/visualTokens";
import type { HomePlayerRecord } from "@/server/home/queries";

export default function PlayerRecordCard({
  player,
  accent = "gold",
}: {
  player: HomePlayerRecord;
  accent?: AtlasAccent;
}) {
  const spotlight = accent === "gold" ? atlasGlow.goldSoft : atlasGlow.cyanSoft;

  return (
    <GlowCard
      variant={accent}
      clickable
      component={Link}
      href={`/players/${player.slug}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        p: 0,
      }}
    >
      {/* Spotlit portrait stage. */}
      <Box
        sx={{
          position: "relative",
          py: 3.5,
          display: "flex",
          justifyContent: "center",
          background: `radial-gradient(60% 80% at 50% 30%, ${spotlight}, transparent 70%)`,
        }}
      >
        <PlayerPortrait
          name={player.name}
          imageUrl={player.portraitUrl}
          countryName={player.countryName}
          size="xl"
          alt={`${player.name} portrait`}
        />
      </Box>

      <Box
        sx={{
          px: 2.5,
          pb: 2.75,
          pt: 0.5,
          textAlign: "center",
          borderTop: `1px solid ${atlasColors.surfaceRaised}`,
        }}
      >
        <Typography
          component="p"
          sx={{
            fontFamily: atlas.fontDisplay,
            fontWeight: 700,
            fontSize: "1.15rem",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            color: atlasColors.textPrimary,
            lineHeight: 1.15,
            mt: 2,
          }}
        >
          {player.name}
        </Typography>
        <Typography
          component="p"
          sx={{
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: atlasColors.textMuted,
            mt: 0.75,
          }}
        >
          {player.countryName ?? "Nation unknown"}
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "baseline", justifyContent: "center", mt: 1.75 }}
        >
          <Typography
            component="span"
            sx={{
              fontFamily: atlas.fontDisplay,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              fontSize: "1.7rem",
              lineHeight: 1,
              ...accentTextSx(accent),
            }}
          >
            {formatNumber(player.goals)}
          </Typography>
          <Typography
            component="span"
            sx={{
              fontSize: "0.58rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: atlasColors.textMuted,
            }}
          >
            World Cup goals
          </Typography>
        </Stack>
      </Box>
    </GlowCard>
  );
}
