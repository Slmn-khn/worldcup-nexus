// Featured tournament card (neon pass). Taller, image-first: a media band on
// top — approved HERO image when one exists, otherwise a deterministic per-year
// CSS theme gradient (never a broken image) — with the year + host overlaid,
// then winner / final / runner-up and a View Tournament CTA. Hover lifts + glows.

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import GlowCard from "@/components/ui/GlowCard";
import EntityImage from "@/components/media/EntityImage";
import CountryFlag from "@/components/media/CountryFlag";
import { atlas } from "@/theme/tokens";
import { formatNumber } from "@/lib/format";
import {
  atlasColors,
  atlasGlow,
  tournamentGradient,
} from "@/theme/visualTokens";
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
    <GlowCard
      variant="default"
      clickable
      component={Link}
      href={`/tournaments/${tournament.year}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        p: 0,
      }}
    >
      {/* Media band — approved HERO image, or a per-year theme gradient. */}
      <Box sx={{ position: "relative" }}>
        {tournament.heroMedia !== null ? (
          <EntityImage
            media={tournament.heroMedia}
            fallbackType="tournament-gradient"
            alt={`${tournament.name} visual`}
            aspectRatio="16 / 8"
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
            sx={{ border: "none" }}
          />
        ) : (
          <Box
            aria-hidden
            sx={{
              aspectRatio: "16 / 8",
              background: tournamentGradient(tournament.year),
            }}
          />
        )}
        {/* Readability scrim + year/host. */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(0deg, rgba(3,12,22,0.92) 0%, rgba(3,12,22,0.1) 55%, transparent 100%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            px: 2.5,
            py: 2,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography
            component="p"
            sx={{
              fontFamily: atlas.fontDisplay,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              fontSize: "2.6rem",
              lineHeight: 0.95,
              color: atlasColors.textPrimary,
              textShadow: `0 0 24px ${atlasGlow.cyanSoft}`,
            }}
          >
            {tournament.year}
          </Typography>
          {tournament.hostName ? (
            <Typography
              component="p"
              sx={{
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: atlasColors.textSecondary,
                textAlign: "right",
              }}
            >
              {tournament.hostName}
            </Typography>
          ) : null}
        </Box>
      </Box>

      <Box
        sx={{ p: 2.75, display: "flex", flexDirection: "column", flexGrow: 1 }}
      >
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
              <Typography
                sx={{
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: atlasColors.gold,
                  mb: 0.75,
                }}
              >
                Champion
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", minWidth: 0 }}
              >
                <CountryFlag name={tournament.winner} size="sm" rounded />
                <Typography
                  sx={{
                    color: atlasColors.textPrimary,
                    fontWeight: 600,
                    minWidth: 0,
                  }}
                >
                  {tournament.winner}
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography
                sx={{
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: atlasColors.textMuted,
                  mb: 0.75,
                }}
              >
                Final
              </Typography>
              <Typography
                sx={{
                  fontFamily: atlas.fontDisplay,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  fontSize: "1.4rem",
                  lineHeight: 1.05,
                  color: atlasColors.textPrimary,
                }}
              >
                {tournament.finalScore ?? "—"}
              </Typography>
            </Box>
            {tournament.runnerUp ? (
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Typography
                  component="span"
                  sx={{ color: atlasColors.textMuted, fontSize: "0.82rem" }}
                >
                  Runner-up: {tournament.runnerUp}
                </Typography>
              </Box>
            ) : null}
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: atlasColors.textMuted }}>
            Result not yet in the archive
          </Typography>
        )}

        {counts.length > 0 ? (
          <Typography
            variant="caption"
            sx={{
              fontVariantNumeric: "tabular-nums",
              color: atlasColors.textMuted,
              display: "block",
              mt: 2,
            }}
          >
            {counts.join(" · ")}
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
          <Box component="span">View tournament</Box>
          <Box component="span" aria-hidden>
            →
          </Box>
        </Box>
      </Box>
    </GlowCard>
  );
}
