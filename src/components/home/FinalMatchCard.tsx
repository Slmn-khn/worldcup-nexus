// Final / iconic match card (neon pass). A compact premium results card: a
// year · stage chip, both teams with flags, a glowing centered scoreline, an
// optional penalty note, and venue. Optional approved EVENT_COVER media band;
// otherwise flags + typography carry it (no copyrighted match photography, no
// broken images). Links to the match detail page.

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import GlowCard from "@/components/ui/GlowCard";
import NeonChip from "@/components/ui/NeonChip";
import EntityImage from "@/components/media/EntityImage";
import CountryFlag from "@/components/media/CountryFlag";
import { atlas } from "@/theme/tokens";
import { atlasColors, atlasGlow } from "@/theme/visualTokens";
import type { HomeFinal } from "@/server/home/queries";

function TeamRow({ name }: { name: string }) {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      sx={{ alignItems: "center", minWidth: 0 }}
    >
      <CountryFlag name={name} size="sm" rounded />
      <Typography
        sx={{
          fontFamily: atlas.fontDisplay,
          fontWeight: 700,
          fontSize: "1.05rem",
          textTransform: "uppercase",
          letterSpacing: "0.02em",
          color: atlasColors.textPrimary,
          lineHeight: 1.1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </Typography>
    </Stack>
  );
}

export default function FinalMatchCard({ match }: { match: HomeFinal }) {
  return (
    <GlowCard
      variant="default"
      clickable
      component={Link}
      href={`/matches/${match.slug}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        p: 0,
      }}
    >
      {match.eventMedia !== null ? (
        <EntityImage
          media={match.eventMedia}
          fallbackType="event"
          alt={`${match.homeTeam} vs ${match.awayTeam}, ${match.year}`}
          aspectRatio="16 / 6"
          sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
          sx={{ border: "none" }}
        />
      ) : null}

      <Box
        sx={{ p: 2.75, display: "flex", flexDirection: "column", flexGrow: 1 }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2.5,
          }}
        >
          <NeonChip
            accent="gold"
            label={`${match.year} · ${match.stageLabel}`}
          />
          <Typography
            component="span"
            sx={{
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: atlasColors.textMuted,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              minWidth: 0,
            }}
          >
            {match.tournamentName}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Stack spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
            <TeamRow name={match.homeTeam} />
            <TeamRow name={match.awayTeam} />
          </Stack>
          <Typography
            sx={{
              fontFamily: atlas.fontDisplay,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              fontSize: "2rem",
              lineHeight: 1,
              color: atlasColors.goldStrong,
              textShadow: `0 0 18px ${atlasGlow.gold}`,
              flexShrink: 0,
            }}
          >
            {match.score}
          </Typography>
        </Stack>

        {match.decidedByPenalties ? (
          <Typography
            variant="caption"
            sx={{ color: atlasColors.cyanStrong, mt: 1.5, display: "block" }}
          >
            Decided on penalties
          </Typography>
        ) : null}
        {match.venue !== null ? (
          <Typography
            variant="caption"
            sx={{ color: atlasColors.textMuted, mt: 0.5, display: "block" }}
          >
            {match.venue}
          </Typography>
        ) : null}

        <Box
          sx={{
            mt: "auto",
            pt: 2.25,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: atlasColors.cyanStrong,
          }}
        >
          <Box component="span">Match detail</Box>
          <Box component="span" aria-hidden>
            →
          </Box>
        </Box>
      </Box>
    </GlowCard>
  );
}
