// Final / iconic match card (Phase 4). Flags + scoreline on a dark event card.
// Uses an approved EVENT_COVER media band when one exists, otherwise the card is
// carried entirely by flags + typography (no copyrighted match photography, no
// broken images). Links to the match detail page.

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import EntityImage from "@/components/media/EntityImage";
import CountryFlag from "@/components/media/CountryFlag";
import {
  atlas,
  eyebrowSx,
  interactiveCardSx,
  tabularNums,
  textLinkSx,
} from "@/theme/tokens";
import type { HomeFinal } from "@/server/home/queries";

function TeamRow({ name }: { name: string }) {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      sx={{ alignItems: "center", minWidth: 0 }}
    >
      <CountryFlag name={name} size="sm" />
      <Typography
        sx={{
          fontFamily: atlas.fontDisplay,
          fontWeight: 700,
          fontSize: "1.1rem",
          textTransform: "uppercase",
          letterSpacing: "0.02em",
          color: atlas.textPrimary,
          lineHeight: 1.1,
          minWidth: 0,
        }}
      >
        {name}
      </Typography>
    </Stack>
  );
}

export default function FinalMatchCard({ match }: { match: HomeFinal }) {
  return (
    <Box
      component={Link}
      href={`/matches/${match.slug}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: atlas.surface1,
        border: `1px solid ${atlas.border}`,
        ...interactiveCardSx,
      }}
    >
      {/* Optional approved event cover — gradient fallback otherwise. */}
      {match.eventMedia !== null ? (
        <EntityImage
          media={match.eventMedia}
          fallbackType="event"
          alt={`${match.homeTeam} vs ${match.awayTeam}, ${match.year}`}
          aspectRatio="16 / 6"
          sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
          sx={{ borderLeft: "none", borderRight: "none", borderTop: "none" }}
        />
      ) : null}

      <Box sx={{ p: 3, display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2.5,
          }}
        >
          <Typography component="span" sx={{ ...eyebrowSx, color: atlas.gold }}>
            {match.year} · {match.stageLabel}
          </Typography>
          <Typography
            component="span"
            sx={{ ...eyebrowSx, fontSize: "0.62rem", color: atlas.textMuted }}
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
              ...tabularNums,
              fontFamily: atlas.fontDisplay,
              fontWeight: 700,
              fontSize: "1.9rem",
              lineHeight: 1,
              color: atlas.textPrimary,
              flexShrink: 0,
            }}
          >
            {match.score}
          </Typography>
        </Stack>

        {match.decidedByPenalties ? (
          <Typography
            variant="caption"
            sx={{ color: atlas.gold, mt: 1.5, display: "block" }}
          >
            Decided on penalties
          </Typography>
        ) : null}
        {match.venue !== null ? (
          <Typography
            variant="caption"
            sx={{ color: atlas.textMuted, mt: 0.5, display: "block" }}
          >
            {match.venue}
          </Typography>
        ) : null}

        <Box
          sx={{
            ...textLinkSx,
            mt: "auto",
            pt: 2.5,
            borderTop: `1px solid ${atlas.border}`,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box component="span">Match detail</Box>
          <Box component="span" aria-hidden>
            →
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
