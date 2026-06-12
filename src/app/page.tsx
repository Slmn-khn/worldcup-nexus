// DB-backed home page (Checkpoint 5A). All numbers and lists come from the
// server query layer (getHomePageData) — nothing is hardcoded or mocked.
// Sections without data render an honest empty state.

import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Link from "@/components/Link";
import PageContainer from "@/components/layout/PageContainer";
import SectionHeading from "@/components/ui/SectionHeading";
import StatCard from "@/components/ui/StatCard";
import EmptyState from "@/components/ui/EmptyState";
import HomeHero from "@/components/home/HomeHero";
import StaggerContainer from "@/components/motion/StaggerContainer";
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

export const metadata: Metadata = {
  title: { absolute: "WorldCup Atlas — Independent World Cup Archive" },
  description:
    "Explore every World Cup tournament, nation, player, match, goal, and penalty in one independent historical archive.",
};

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
      <HomeHero />

      {/* Archive at a Glance */}
      <PageContainer sx={SECTION_PADDING}>
        <SectionHeading
          eyebrow="Live data"
          title="Archive at a Glance"
          subtitle="Live counts from the imported archive."
        />
        <StaggerContainer
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
        </StaggerContainer>
      </PageContainer>

      {/* Featured Tournaments */}
      <PageContainer sx={SECTION_PADDING}>
        <SectionHeading
          title="Featured Tournaments"
          subtitle="The latest editions in the archive."
          action={<ViewAllLink href="/tournaments" label="All tournaments" />}
        />
        {data.featuredTournaments.length > 0 ? (
          <StaggerContainer sx={CARD_GRID_3}>
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
          </StaggerContainer>
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
            <StaggerContainer sx={CARD_GRID_3}>
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
            </StaggerContainer>
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
          <StaggerContainer sx={CARD_GRID_4}>
            {data.featuredCountries.map((country) => (
              <CountryCard
                key={country.id}
                name={country.name}
                flagEmoji={country.flagEmoji}
                code={country.code}
                summary={`${formatNumber(country.tournamentsEntered)} tournament entries · ${formatNumber(country.playersCount)} players in the archive`}
                href={`/countries/${country.slug}`}
              />
            ))}
          </StaggerContainer>
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
          <StaggerContainer sx={CARD_GRID_4}>
            {data.featuredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                name={player.name}
                country={player.countryName ?? "Nation unknown"}
                flagEmoji={player.countryFlagEmoji}
                position={player.position}
                href={`/players/${player.slug}`}
              />
            ))}
          </StaggerContainer>
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
            <StaggerContainer sx={CARD_GRID_3}>
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
            </StaggerContainer>
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
