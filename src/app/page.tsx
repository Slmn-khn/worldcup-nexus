// DB-backed home page (Checkpoint 5A). All numbers and lists come from the
// server query layer (getHomePageData) — nothing is hardcoded or mocked.
// Sections without data render an honest empty state.

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Link from "@/components/Link";
import PageContainer from "@/components/layout/PageContainer";
import SectionHeading from "@/components/ui/SectionHeading";
import StatCard from "@/components/ui/StatCard";
import GlobalSearch from "@/components/ui/GlobalSearch";
import EmptyState from "@/components/ui/EmptyState";
import TournamentCard from "@/components/tournaments/TournamentCard";
import MatchCard from "@/components/matches/MatchCard";
import CountryCard from "@/components/countries/CountryCard";
import PlayerCard from "@/components/players/PlayerCard";
import RecordCard from "@/components/records/RecordCard";
import { formatDate, formatNumber } from "@/lib/format";
import { getHomePageData } from "@/server/queries/home";
import type { MatchCardDto } from "@/server/queries/types";

// Live archive data — always render from the current database state.
export const dynamic = "force-dynamic";

const SECTION_PADDING = { py: { xs: 6, md: 8 } };
const CARD_GRID_3 = {
  display: "grid",
  gap: 2.5,
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
};
const CARD_GRID_4 = {
  display: "grid",
  gap: 2.5,
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
};

function ViewAllLink({ href, label }: { href: string; label: string }) {
  return (
    <Button
      component={Link}
      href={href}
      size="small"
      endIcon={<ArrowForwardRoundedIcon />}
      sx={{ color: "primary.main" }}
    >
      {label}
    </Button>
  );
}

function matchSummary(match: MatchCardDto): string | undefined {
  const date = formatDate(match.matchDate);
  const parts = [
    date,
    match.decidedByPenalties ? "Decided on penalties" : null,
  ].filter((part): part is string => part !== null);
  return parts.length > 0 ? parts.join(" — ") : undefined;
}

export default async function Home() {
  const data = await getHomePageData();
  const { archiveStats } = data;

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          background:
            "radial-gradient(ellipse 80% 60% at 70% -10%, rgba(244, 201, 93, 0.12), transparent), " +
            "radial-gradient(ellipse 60% 50% at 20% 110%, rgba(31, 122, 77, 0.18), transparent), " +
            "#06111F",
        }}
      >
        <PageContainer sx={{ py: { xs: 8, md: 12 } }}>
          <Typography
            variant="overline"
            sx={{
              color: "primary.main",
              letterSpacing: "0.2em",
              display: "block",
              mb: 2,
            }}
          >
            The Football Archive
          </Typography>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2.25rem", sm: "3rem", md: "3.75rem" },
              maxWidth: 820,
              mb: 2.5,
            }}
          >
            Explore the Complete History of the World Cup
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{
              color: "text.secondary",
              fontWeight: 400,
              maxWidth: 640,
              mb: 4,
            }}
          >
            Every tournament, nation, player, match, goal, and penalty in one
            independent historical archive.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 7 }}
          >
            <Button
              component={Link}
              href="/tournaments"
              variant="contained"
              size="large"
            >
              Explore Tournaments
            </Button>
            <Button
              component={Link}
              href="/records"
              variant="outlined"
              size="large"
              sx={{
                color: "text.primary",
                borderColor: "divider",
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              View Records
            </Button>
          </Stack>
          <Box sx={{ maxWidth: 720 }}>
            <GlobalSearch />
          </Box>
        </PageContainer>
      </Box>

      {/* Archive at a Glance */}
      <PageContainer sx={SECTION_PADDING}>
        <SectionHeading
          title="Archive at a Glance"
          subtitle="Live counts from the imported archive."
        />
        <Box
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          }}
        >
          <StatCard
            label="Tournaments"
            value={formatNumber(archiveStats.tournaments)}
          />
          <StatCard
            label="Nations"
            value={formatNumber(archiveStats.countries)}
          />
          <StatCard
            label="Matches"
            value={formatNumber(archiveStats.matches)}
          />
          <StatCard label="Goals" value={formatNumber(archiveStats.goals)} />
        </Box>
      </PageContainer>

      {/* Featured Tournaments */}
      <PageContainer sx={SECTION_PADDING}>
        <SectionHeading
          title="Featured Tournaments"
          subtitle="The latest editions in the archive."
          action={<ViewAllLink href="/tournaments" label="All tournaments" />}
        />
        {data.featuredTournaments.length > 0 ? (
          <Box sx={CARD_GRID_3}>
            {data.featuredTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                year={tournament.year}
                name={tournament.name}
                host={tournament.hostName}
                winner={tournament.winner}
                runnerUp={tournament.runnerUp}
                finalScore={tournament.finalScore}
                teamsCount={tournament.teamsCount}
                matchesCount={tournament.matchesCount}
                goalsCount={tournament.goalsCount}
              />
            ))}
          </Box>
        ) : (
          <EmptyState
            title="Tournaments coming soon"
            description="Tournament data has not been imported yet."
          />
        )}
      </PageContainer>

      {/* Iconic Matches */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <PageContainer sx={SECTION_PADDING}>
          <SectionHeading
            title="Iconic Matches"
            subtitle="The most recent finals in the archive."
            action={<ViewAllLink href="/matches" label="All matches" />}
          />
          {data.iconicMatches.length > 0 ? (
            <Box sx={CARD_GRID_3}>
              {data.iconicMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  title={`${match.homeTeam.name} v ${match.awayTeam.name}`}
                  tournament={match.tournamentName}
                  score={
                    match.penaltyScore !== null
                      ? `${match.score} (${match.penaltyScore} pens)`
                      : match.score
                  }
                  stage={match.stage}
                  summary={matchSummary(match)}
                  href={`/matches/${match.slug}`}
                />
              ))}
            </Box>
          ) : (
            <EmptyState
              title="Matches coming soon"
              description="Match data has not been imported yet."
            />
          )}
        </PageContainer>
      </Box>

      {/* Explore by Country */}
      <PageContainer sx={SECTION_PADDING}>
        <SectionHeading
          title="Explore by Country"
          subtitle="Nations with the most tournament entries."
          action={<ViewAllLink href="/countries" label="All countries" />}
        />
        {data.featuredCountries.length > 0 ? (
          <Box sx={CARD_GRID_4}>
            {data.featuredCountries.map((country) => (
              <CountryCard
                key={country.id}
                name={country.name}
                summary={`${formatNumber(country.tournamentsEntered)} tournament entries · ${formatNumber(country.playersCount)} players in the archive`}
                href={`/countries/${country.slug}`}
              />
            ))}
          </Box>
        ) : (
          <EmptyState
            title="Countries coming soon"
            description="Country data has not been imported yet."
          />
        )}
      </PageContainer>

      {/* Legendary Players */}
      <PageContainer sx={SECTION_PADDING}>
        <SectionHeading
          title="Legendary Players"
          subtitle="The archive's all-time leading scorers."
          action={<ViewAllLink href="/players" label="All players" />}
        />
        {data.featuredPlayers.length > 0 ? (
          <Box sx={CARD_GRID_4}>
            {data.featuredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                name={player.name}
                country={player.countryName ?? "Nation unknown"}
                position={player.position}
                href={`/players/${player.slug}`}
              />
            ))}
          </Box>
        ) : (
          <EmptyState
            title="Players coming soon"
            description="Player data has not been imported yet."
          />
        )}
      </PageContainer>

      {/* Records Preview */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <PageContainer sx={SECTION_PADDING}>
          <SectionHeading
            title="Records"
            subtitle="Database-backed leaderboards computed from imported events."
            action={<ViewAllLink href="/records" label="All records" />}
          />
          {data.recordsPreview.some((board) => board.items.length > 0) ? (
            <Box sx={CARD_GRID_3}>
              {data.recordsPreview
                .filter((board) => board.items.length > 0)
                .map((board) => {
                  const top = board.items[0];
                  return (
                    <RecordCard
                      key={board.key}
                      title={board.title}
                      value={`${top.label} — ${formatNumber(top.value)}`}
                      description={board.description}
                    />
                  );
                })}
            </Box>
          ) : (
            <EmptyState
              title="Records coming soon"
              description="Leaderboards appear once event data is imported."
            />
          )}
        </PageContainer>
      </Box>
    </Box>
  );
}
