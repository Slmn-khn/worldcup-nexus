import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Link from "@/components/Link";
import PageContainer from "@/components/layout/PageContainer";
import FootballConstellation from "@/components/visual/FootballConstellation";
import { formatDate } from "@/lib/format";
import type { MatchDetailDto } from "@/server/queries/types";

export default function MatchHero({ match }: { match: MatchDetailDto }) {
  const date = formatDate(match.matchDate);

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderBottom: "1px solid",
        borderColor: "divider",
        background:
          "radial-gradient(ellipse 70% 70% at 50% -20%, rgba(244, 201, 93, 0.13), transparent), " +
          "radial-gradient(ellipse 50% 50% at 90% 110%, rgba(34, 211, 238, 0.08), transparent), " +
          "radial-gradient(ellipse 40% 40% at 5% 90%, rgba(139, 92, 246, 0.06), transparent), #050B14",
      }}
    >
      <FootballConstellation
        variant="match"
        intensity="low"
        seed={match.slug}
      />
      <PageContainer sx={{ position: "relative", py: { xs: 5, md: 8 } }}>
        <Breadcrumbs
          separator="/"
          sx={{
            mb: 3,
            "& .MuiBreadcrumbs-separator": { color: "text.secondary" },
          }}
        >
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

        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 3, flexWrap: "wrap", rowGap: 1 }}
        >
          <Chip
            label={match.tournamentName}
            size="small"
            variant="outlined"
            sx={{ color: "text.secondary", borderColor: "divider" }}
          />
          <Chip
            label={match.stage}
            size="small"
            sx={{
              bgcolor: "rgba(244, 201, 93, 0.12)",
              color: "primary.main",
              fontWeight: 700,
            }}
          />
          {date !== null ? (
            <Chip
              label={date}
              size="small"
              variant="outlined"
              sx={{ color: "text.secondary", borderColor: "divider" }}
            />
          ) : null}
        </Stack>

        {/* Scoreline */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr auto 1fr" },
            alignItems: "center",
            gap: { xs: 1.5, sm: 3 },
            textAlign: "center",
            maxWidth: 860,
            mx: "auto",
            py: { xs: 1, md: 2 },
          }}
        >
          <Typography
            variant="h2"
            component="p"
            sx={{
              fontSize: { xs: "1.6rem", md: "2.25rem" },
              textAlign: { sm: "right" },
            }}
          >
            {match.homeTeam.name}
          </Typography>
          <Box>
            <Typography
              variant="h1"
              component="p"
              sx={{
                color: "primary.main",
                fontSize: { xs: "2.75rem", md: "3.75rem" },
                lineHeight: 1,
                textShadow: "0 0 32px rgba(244, 201, 93, 0.35)",
              }}
            >
              {match.score}
            </Typography>
            {match.penaltyScore !== null ? (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 0.75 }}
              >
                {match.penaltyScore} on penalties
              </Typography>
            ) : null}
          </Box>
          <Typography
            variant="h2"
            component="p"
            sx={{
              fontSize: { xs: "1.6rem", md: "2.25rem" },
              textAlign: { sm: "left" },
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
            mt: 1.5,
            flexWrap: "wrap",
            rowGap: 1,
          }}
        >
          {match.decidedByPenalties ? (
            <Chip
              label="Decided by penalty shootout"
              size="small"
              sx={{
                bgcolor: "rgba(34, 211, 238, 0.14)",
                color: "#22D3EE",
                border: "1px solid rgba(34, 211, 238, 0.35)",
                fontWeight: 700,
              }}
            />
          ) : null}
          {match.winnerName !== null ? (
            <Chip
              label={`Winner: ${match.winnerName}`}
              size="small"
              sx={{
                bgcolor: "primary.main",
                color: "#06111F",
                fontWeight: 700,
              }}
            />
          ) : (
            <Chip
              label="Draw"
              size="small"
              variant="outlined"
              sx={{ color: "text.secondary", borderColor: "divider" }}
            />
          )}
        </Stack>

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
    </Box>
  );
}
