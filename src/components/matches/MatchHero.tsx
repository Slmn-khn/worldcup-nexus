import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Link from "@/components/Link";
import PageContainer from "@/components/layout/PageContainer";
import HeroSurface from "@/components/visual/HeroSurface";
import FootballConstellation from "@/components/visual/FootballConstellation";
import { formatDate, formatStage } from "@/lib/format";
import { atlas, eyebrowSx, tabularNums } from "@/theme/tokens";
import type { MatchDetailDto } from "@/server/queries/types";

export default function MatchHero({ match }: { match: MatchDetailDto }) {
  const date = formatDate(match.matchDate);

  return (
    <HeroSurface variant="feature">
      <FootballConstellation
        variant="match"
        intensity="low"
        seed={match.slug}
      />
      <PageContainer sx={{ position: "relative", py: { xs: 5, md: 7 } }}>
        <Breadcrumbs separator="/" sx={{ mb: 4 }}>
          <Typography
            component={Link}
            href="/"
            variant="body2"
            sx={{
              color: "text.secondary",
              "&:hover": { color: "primary.main" },
            }}
          >
            Home
          </Typography>
          <Typography
            component={Link}
            href="/tournaments"
            variant="body2"
            sx={{
              color: "text.secondary",
              "&:hover": { color: "primary.main" },
            }}
          >
            Tournaments
          </Typography>
          <Typography
            component={Link}
            href={`/tournaments/${match.tournamentYear}`}
            variant="body2"
            sx={{
              color: "text.secondary",
              "&:hover": { color: "primary.main" },
            }}
          >
            {match.tournamentYear}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.primary" }}>
            Match
          </Typography>
        </Breadcrumbs>

        {/* Scoreboard */}
        <Box
          sx={{
            maxWidth: 860,
            mx: "auto",
            borderRadius: 3,
            border: `1px solid ${atlas.border}`,
            background: atlas.panelGradient,
            boxShadow: atlas.shadowLg,
            px: { xs: 2.5, md: 5 },
            py: { xs: 3, md: 4 },
            textAlign: "center",
          }}
        >
          {/* Eyebrow: tournament · stage · date */}
          <Typography
            variant="overline"
            component="p"
            sx={{ ...eyebrowSx, color: atlas.textMuted, mb: { xs: 2, md: 3 } }}
          >
            {match.tournamentName}
            <Box component="span" sx={{ color: "primary.main", mx: 1 }}>
              {formatStage(match.stage)}
            </Box>
            {date !== null ? date : null}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr auto 1fr" },
              alignItems: "center",
              gap: { xs: 1, sm: 3.5 },
            }}
          >
            <Typography
              variant="h2"
              component="p"
              sx={{
                fontSize: { xs: "1.5rem", md: "2rem" },
                textAlign: { xs: "center", sm: "right" },
                lineHeight: 1.15,
              }}
            >
              {match.homeTeam.name}
            </Typography>
            <Box>
              <Typography
                variant="h1"
                component="p"
                sx={{
                  ...tabularNums,
                  color: "primary.main",
                  fontSize: { xs: "3.2rem", md: "4.5rem" },
                  lineHeight: 1,
                }}
              >
                {match.score}
              </Typography>
              {match.penaltyScore !== null ? (
                <Typography
                  variant="body2"
                  sx={{ ...tabularNums, color: "text.secondary", mt: 0.75 }}
                >
                  {match.penaltyScore} on penalties
                </Typography>
              ) : null}
            </Box>
            <Typography
              variant="h2"
              component="p"
              sx={{
                fontSize: { xs: "1.5rem", md: "2rem" },
                textAlign: { xs: "center", sm: "left" },
                lineHeight: 1.15,
              }}
            >
              {match.awayTeam.name}
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              justifyContent: "center",
              mt: { xs: 2.5, md: 3 },
              flexWrap: "wrap",
              rowGap: 1,
            }}
          >
            {match.winnerName !== null ? (
              <Chip
                label={`Winner: ${match.winnerName}`}
                size="small"
                sx={{
                  bgcolor: "primary.main",
                  color: atlas.deepNavy,
                  fontWeight: 700,
                }}
              />
            ) : (
              <Chip
                label="Draw"
                size="small"
                variant="outlined"
                sx={{ color: "text.secondary", borderColor: atlas.border }}
              />
            )}
            {match.decidedByPenalties ? (
              <Chip
                label="Decided by penalty shootout"
                size="small"
                sx={{
                  bgcolor: atlas.cyanTint,
                  color: atlas.cyan,
                  border: `1px solid ${atlas.cyanSoft}`,
                  fontWeight: 600,
                }}
              />
            ) : null}
          </Stack>
        </Box>

        <Typography
          component={Link}
          href={`/tournaments/${match.tournamentYear}`}
          variant="body2"
          sx={{
            mt: 4,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            color: "text.secondary",
            "&:hover": { color: "primary.main" },
          }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 16 }} /> {match.tournamentName}
        </Typography>
      </PageContainer>
    </HeroSurface>
  );
}
