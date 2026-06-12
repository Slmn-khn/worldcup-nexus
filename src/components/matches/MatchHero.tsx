// Match center hero: a sharp black editorial scoreboard. Uppercase team
// names, huge condensed score, metadata as small uppercase labels.

import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Link from "@/components/Link";
import PageContainer from "@/components/layout/PageContainer";
import { formatDate, formatStage } from "@/lib/format";
import { atlas, eyebrowSx, tabularNums, textLinkSx } from "@/theme/tokens";
import type { MatchDetailDto } from "@/server/queries/types";

export default function MatchHero({ match }: { match: MatchDetailDto }) {
  const date = formatDate(match.matchDate);

  return (
    <Box sx={{ borderBottom: `1px solid ${atlas.border}`, bgcolor: atlas.black }}>
      <PageContainer sx={{ py: { xs: 5, md: 8 } }}>
        <Breadcrumbs separator="/" sx={{ mb: 5 }}>
          <Typography
            component={Link}
            href="/"
            variant="body2"
            sx={{ color: atlas.textMuted, "&:hover": { color: atlas.textPrimary } }}
          >
            Home
          </Typography>
          <Typography
            component={Link}
            href="/tournaments"
            variant="body2"
            sx={{ color: atlas.textMuted, "&:hover": { color: atlas.textPrimary } }}
          >
            Tournaments
          </Typography>
          <Typography
            component={Link}
            href={`/tournaments/${match.tournamentYear}`}
            variant="body2"
            sx={{ color: atlas.textMuted, "&:hover": { color: atlas.textPrimary } }}
          >
            {match.tournamentYear}
          </Typography>
          <Typography variant="body2" sx={{ color: atlas.textSecondary }}>
            Match
          </Typography>
        </Breadcrumbs>

        {/* Scoreboard */}
        <Box
          sx={{
            maxWidth: 920,
            mx: "auto",
            border: `1px solid ${atlas.border}`,
            bgcolor: atlas.canvasSoft,
            px: { xs: 2.5, md: 6 },
            py: { xs: 4, md: 5 },
            textAlign: "center",
          }}
        >
          <Typography
            component="p"
            sx={{ ...eyebrowSx, color: atlas.textMuted, mb: { xs: 2.5, md: 3.5 } }}
          >
            {match.tournamentName}
            <Box component="span" sx={{ color: atlas.gold, mx: 1.25 }}>
              {formatStage(match.stage)}
            </Box>
            {date}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr auto 1fr" },
              alignItems: "center",
              gap: { xs: 1.5, sm: 4 },
            }}
          >
            <Typography
              component="p"
              sx={{
                fontFamily: atlas.fontDisplay,
                fontWeight: 700,
                fontSize: { xs: "1.6rem", md: "2.2rem" },
                textTransform: "uppercase",
                lineHeight: 1.05,
                color: atlas.textPrimary,
                textAlign: { xs: "center", sm: "right" },
              }}
            >
              {match.homeTeam.name}
            </Typography>
            <Box>
              <Typography
                component="p"
                sx={{
                  ...tabularNums,
                  fontFamily: atlas.fontDisplay,
                  fontWeight: 700,
                  fontSize: { xs: "3.6rem", md: "5rem" },
                  lineHeight: 0.95,
                  color: atlas.textPrimary,
                }}
              >
                {match.score}
              </Typography>
              {match.penaltyScore !== null ? (
                <Typography
                  component="p"
                  sx={{
                    ...eyebrowSx,
                    fontSize: "0.7rem",
                    color: atlas.gold,
                    mt: 1,
                  }}
                >
                  {match.penaltyScore} on penalties
                </Typography>
              ) : null}
            </Box>
            <Typography
              component="p"
              sx={{
                fontFamily: atlas.fontDisplay,
                fontWeight: 700,
                fontSize: { xs: "1.6rem", md: "2.2rem" },
                textTransform: "uppercase",
                lineHeight: 1.05,
                color: atlas.textPrimary,
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              {match.awayTeam.name}
            </Typography>
          </Box>

          <Box
            sx={{
              mt: { xs: 3, md: 4 },
              pt: 2.5,
              borderTop: `1px solid ${atlas.border}`,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              columnGap: 3,
              rowGap: 1,
            }}
          >
            <Typography sx={{ ...eyebrowSx, fontSize: "0.7rem", color: atlas.textSecondary }}>
              {match.winnerName !== null
                ? `Winner · ${match.winnerName}`
                : "Draw"}
            </Typography>
            {match.decidedByPenalties ? (
              <Typography
                sx={{ ...eyebrowSx, fontSize: "0.7rem", color: atlas.textMuted }}
              >
                Decided by penalty shootout
              </Typography>
            ) : null}
          </Box>
        </Box>

        <Typography
          component={Link}
          href={`/tournaments/${match.tournamentYear}`}
          sx={{ ...textLinkSx, color: atlas.textMuted, mt: 4 }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 14 }} /> {match.tournamentName}
        </Typography>
      </PageContainer>
    </Box>
  );
}
