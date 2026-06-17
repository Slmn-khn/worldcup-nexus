// Featured tournament card (Phase 4). A media band on top — approved HERO image
// when one exists, otherwise a dark CSS gradient (EntityImage handles both, so
// there are never broken images) — then a structured header (year + host) and
// winner / final / runner-up blocks. Zero radius, hairline borders, no shadow.

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import EntityImage from "@/components/media/EntityImage";
import CountryFlag from "@/components/media/CountryFlag";
import { formatNumber } from "@/lib/format";
import {
  atlas,
  eyebrowSx,
  interactiveCardSx,
  tabularNums,
  textLinkSx,
} from "@/theme/tokens";
import type { HomeFeaturedTournament } from "@/server/home/queries";

export default function FeaturedTournamentCard({
  tournament,
}: {
  tournament: HomeFeaturedTournament;
}) {
  const counts = [
    tournament.teamsCount != null
      ? `${formatNumber(tournament.teamsCount)} teams`
      : null,
    tournament.matchesCount != null
      ? `${formatNumber(tournament.matchesCount)} matches`
      : null,
    tournament.goalsCount != null
      ? `${formatNumber(tournament.goalsCount)} goals`
      : null,
  ].filter((part): part is string => part !== null);

  return (
    <Box
      component={Link}
      href={`/tournaments/${tournament.year}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: atlas.surface1,
        border: `1px solid ${atlas.border}`,
        ...interactiveCardSx,
      }}
    >
      {/* Decorative media band — approved HERO or a dark gradient fallback. */}
      <Box sx={{ position: "relative" }}>
        <EntityImage
          media={tournament.heroMedia}
          fallbackType="tournament-gradient"
          alt={`${tournament.name} visual`}
          aspectRatio="16 / 7"
          sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
          sx={{ borderLeft: "none", borderRight: "none", borderTop: "none" }}
        />
        <Box
          sx={{
            position: "absolute",
            left: 0,
            bottom: 0,
            right: 0,
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 2,
            background:
              "linear-gradient(0deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0) 100%)",
          }}
        >
          <Typography
            component="p"
            sx={{
              ...tabularNums,
              fontFamily: atlas.fontDisplay,
              fontWeight: 700,
              fontSize: "2.4rem",
              lineHeight: 1,
              color: atlas.textPrimary,
            }}
          >
            {tournament.year}
          </Typography>
          {tournament.hostName ? (
            <Typography
              component="p"
              sx={{ ...eyebrowSx, color: atlas.textSecondary }}
            >
              {tournament.hostName}
            </Typography>
          ) : null}
        </Box>
      </Box>

      <Box sx={{ p: 3, display: "flex", flexDirection: "column", flexGrow: 1 }}>
        {tournament.winner ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              columnGap: 2,
              rowGap: 1.5,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Box
                  aria-hidden
                  sx={{ width: 5, height: 5, bgcolor: atlas.gold }}
                />
                <Typography sx={{ ...eyebrowSx, color: atlas.textMuted }}>
                  Winner
                </Typography>
              </Stack>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", mt: 0.5, minWidth: 0 }}
              >
                <CountryFlag name={tournament.winner} size="xs" />
                <Typography
                  sx={{
                    color: atlas.textPrimary,
                    fontWeight: 600,
                    minWidth: 0,
                  }}
                >
                  {tournament.winner}
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ ...eyebrowSx, color: atlas.textMuted }}>
                Final
              </Typography>
              <Typography
                sx={{
                  ...tabularNums,
                  fontFamily: atlas.fontDisplay,
                  fontWeight: 700,
                  fontSize: "1.4rem",
                  lineHeight: 1.1,
                  color: atlas.textPrimary,
                  mt: 0.25,
                }}
              >
                {tournament.finalScore ?? "—"}
              </Typography>
            </Box>
            {tournament.runnerUp ? (
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Typography sx={{ ...eyebrowSx, color: atlas.textMuted }}>
                  Runner-up
                </Typography>
                <Typography
                  sx={{ color: atlas.textSecondary, fontWeight: 300, mt: 0.5 }}
                >
                  {tournament.runnerUp}
                </Typography>
              </Box>
            ) : null}
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: atlas.textMuted }}>
            Result not yet in the archive
          </Typography>
        )}

        {counts.length > 0 ? (
          <Typography
            variant="caption"
            sx={{
              ...tabularNums,
              color: atlas.textMuted,
              display: "block",
              mt: 2,
            }}
          >
            {counts.join(" · ")}
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
          <Box component="span">View tournament</Box>
          <Box component="span" aria-hidden>
            →
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
