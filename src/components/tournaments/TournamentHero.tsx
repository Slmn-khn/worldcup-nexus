import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Link from "@/components/Link";
import PageContainer from "@/components/layout/PageContainer";
import HeroSurface from "@/components/visual/HeroSurface";
import FootballConstellation from "@/components/visual/FootballConstellation";
import { formatDate } from "@/lib/format";
import { eyebrowSx } from "@/theme/tokens";
import type { TournamentDetailDto } from "@/server/queries/types";

export default function TournamentHero({
  tournament,
}: {
  tournament: TournamentDetailDto;
}) {
  const startDate = formatDate(tournament.startDate);
  const endDate = formatDate(tournament.endDate);

  return (
    <HeroSurface>
      <FootballConstellation
        variant="subtle"
        intensity="low"
        seed={tournament.year}
      />
      <PageContainer sx={{ position: "relative", py: { xs: 5, md: 7.5 } }}>
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
          <Typography variant="body2" sx={{ color: "text.primary" }}>
            {tournament.year}
          </Typography>
        </Breadcrumbs>

        <Typography
          variant="overline"
          component="p"
          sx={{ ...eyebrowSx, color: "primary.main", mb: 1.5 }}
        >
          Tournament Archive
        </Typography>
        <Typography
          variant="h1"
          sx={{ fontSize: { xs: "2.2rem", md: "3.1rem" }, mb: 1 }}
        >
          {tournament.name}
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
          {[
            tournament.hostName !== null
              ? `Hosted by ${tournament.hostName}`
              : null,
            startDate !== null && endDate !== null
              ? `${startDate} – ${endDate}`
              : null,
          ]
            .filter((part): part is string => part !== null)
            .join(" · ")}
        </Typography>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ flexWrap: "wrap", rowGap: 1.5 }}
        >
          {tournament.winner !== null ? (
            <Chip
              icon={
                <EmojiEventsRoundedIcon sx={{ "&&": { color: "#06111F" } }} />
              }
              label={`Champions: ${tournament.winner}`}
              sx={{
                bgcolor: "primary.main",
                color: "#06111F",
                fontWeight: 700,
              }}
            />
          ) : null}
          {tournament.runnerUp !== null ? (
            <Chip
              label={`Runners-up: ${tournament.runnerUp}`}
              variant="outlined"
              sx={{ color: "text.primary", borderColor: "divider" }}
            />
          ) : null}
          {tournament.finalScore !== null ? (
            <Chip
              label={`Final: ${tournament.finalScore}`}
              variant="outlined"
              sx={{ color: "text.secondary", borderColor: "divider" }}
            />
          ) : null}
        </Stack>

        <Typography
          component={Link}
          href="/tournaments"
          variant="body2"
          sx={{
            mt: 3.5,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            color: "text.secondary",
            "&:hover": { color: "primary.main" },
          }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 16 }} /> All tournaments
        </Typography>
      </PageContainer>
    </HeroSurface>
  );
}
