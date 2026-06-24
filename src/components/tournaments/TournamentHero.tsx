// Tournament dossier hero (PPTX slides 8–9): back link, huge condensed
// year, host eyebrow, and a champion scoreboard block on a hairline panel.

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Link from "@/components/Link";
import PageContainer from "@/components/layout/PageContainer";
import VaultEyebrow from "@/components/vault/VaultEyebrow";
import CountryFlag from "@/components/media/CountryFlag";
import { formatDate } from "@/lib/format";
import { atlas, eyebrowSx, tabularNums, textLinkSx } from "@/theme/tokens";
import type { TournamentDetailDto } from "@/server/queries/types";

export default function TournamentHero({
  tournament,
}: {
  tournament: TournamentDetailDto;
}) {
  const startDate = formatDate(tournament.startDate);
  const endDate = formatDate(tournament.endDate);
  const dates =
    startDate !== null && endDate !== null ? `${startDate} – ${endDate}` : null;
  // The deciding "final" match, when the archive holds one — gives the two
  // finalists (with flags) and the scoreline. Tournaments without a single
  // final (e.g. 1950) simply fall back to the champion + final-score string.
  const finalMatch =
    tournament.matches.find(
      (match) => match.stage.toLowerCase() === "final",
    ) ?? null;

  return (
    <Box sx={{ borderBottom: `1px solid ${atlas.border}`, bgcolor: atlas.black }}>
      <PageContainer sx={{ py: { xs: 6, md: 9 } }}>
        <Typography
          component={Link}
          href="/tournaments"
          sx={{ ...textLinkSx, color: atlas.textMuted, mb: 4 }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 14 }} /> All World Cups
        </Typography>

        <Box
          sx={{
            display: "grid",
            gap: { xs: 4, md: 6 },
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.2fr) minmax(0, 1fr)" },
            alignItems: "end",
            mt: 3,
          }}
        >
          {/* Identity block */}
          <Box>
            {tournament.hostName !== null ? (
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", mb: 2 }}
              >
                <CountryFlag name={tournament.hostName} size="sm" />
                <VaultEyebrow label={`Host · ${tournament.hostName}`} />
              </Stack>
            ) : null}
            <Typography
              variant="h1"
              sx={{
                ...tabularNums,
                fontSize: { xs: "4.4rem", md: "6.4rem" },
                lineHeight: 0.95,
                mb: 1.5,
              }}
            >
              {tournament.year}
            </Typography>
            <Typography variant="body1" sx={{ color: atlas.textSecondary }}>
              {tournament.name}
              {dates !== null ? ` · ${dates}` : ""}
            </Typography>
          </Box>

          {/* Champion scoreboard block */}
          {tournament.winner !== null ? (
            <Box
              sx={{
                border: `1px solid ${atlas.border}`,
                bgcolor: atlas.surface1,
                p: { xs: 3, md: 4 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1 }}>
                <Box
                  aria-hidden
                  sx={{ width: 6, height: 6, bgcolor: atlas.gold }}
                />
                <Typography sx={{ ...eyebrowSx, color: atlas.textMuted }}>
                  Champion
                </Typography>
              </Box>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <CountryFlag
                  name={tournament.winner}
                  slug={tournament.winnerSlug}
                  code={tournament.winnerCode}
                  fifaCode={tournament.winnerCode}
                  size="xl"
                  label={`Champion: ${tournament.winner}`}
                />
                <Typography
                  sx={{
                    fontFamily: atlas.fontDisplay,
                    fontWeight: 700,
                    fontSize: { xs: "1.7rem", md: "2rem" },
                    textTransform: "uppercase",
                    color: atlas.textPrimary,
                    lineHeight: 1.05,
                  }}
                >
                  {tournament.winner}
                </Typography>
              </Stack>
              {finalMatch !== null ? (
                <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${atlas.border}` }}>
                  <Typography
                    sx={{ ...eyebrowSx, color: atlas.textMuted, mb: 1 }}
                  >
                    Final
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center", flexWrap: "wrap" }}
                  >
                    <CountryFlag
                      name={finalMatch.homeTeam.name}
                      slug={finalMatch.homeTeam.slug}
                      size="sm"
                    />
                    <Typography
                      sx={{ color: atlas.textPrimary, fontWeight: 600 }}
                    >
                      {finalMatch.homeTeam.name}
                    </Typography>
                    <Typography
                      sx={{
                        ...tabularNums,
                        fontFamily: atlas.fontDisplay,
                        fontWeight: 700,
                        color: atlas.gold,
                        px: 0.5,
                      }}
                    >
                      {finalMatch.score}
                      {finalMatch.penaltyScore !== null
                        ? ` (${finalMatch.penaltyScore} pens)`
                        : ""}
                    </Typography>
                    <Typography
                      sx={{ color: atlas.textPrimary, fontWeight: 600 }}
                    >
                      {finalMatch.awayTeam.name}
                    </Typography>
                    <CountryFlag
                      name={finalMatch.awayTeam.name}
                      slug={finalMatch.awayTeam.slug}
                      size="sm"
                    />
                  </Stack>
                </Box>
              ) : tournament.finalScore !== null ? (
                <Typography
                  sx={{
                    ...tabularNums,
                    fontFamily: atlas.fontDisplay,
                    fontWeight: 700,
                    fontSize: { xs: "1.5rem", md: "1.8rem" },
                    color: atlas.gold,
                    mt: 1,
                  }}
                >
                  {tournament.finalScore}
                </Typography>
              ) : null}
              {tournament.runnerUp !== null ? (
                <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${atlas.border}` }}>
                  <Typography sx={{ ...eyebrowSx, color: atlas.textMuted }}>
                    Runner-up
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center", mt: 0.5 }}
                  >
                    <CountryFlag
                      name={tournament.runnerUp}
                      slug={tournament.runnerUpSlug}
                      code={tournament.runnerUpCode}
                      fifaCode={tournament.runnerUpCode}
                      size="md"
                    />
                    <Typography
                      sx={{ color: atlas.textSecondary, fontWeight: 400 }}
                    >
                      {tournament.runnerUp}
                    </Typography>
                  </Stack>
                </Box>
              ) : null}
            </Box>
          ) : null}
        </Box>
      </PageContainer>
    </Box>
  );
}
