// DB-backed home page — Checkpoint 7C Revised (World Cup Vault editorial
// redesign). All numbers and lists come from the server query layer
// (getHomePageData + getTournamentCards) — nothing is hardcoded or mocked.
// Sections without data render an honest empty state.

import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import PageContainer from "@/components/layout/PageContainer";
import VaultEyebrow from "@/components/vault/VaultEyebrow";
import VaultButton from "@/components/vault/VaultButton";
import VaultSection from "@/components/vault/VaultSection";
import VaultSpecCell from "@/components/vault/VaultSpecCell";
import TournamentTimelineStrip from "@/components/vault/TournamentTimelineStrip";
import GlobalSearch from "@/components/ui/GlobalSearch";
import EmptyState from "@/components/ui/EmptyState";
import TournamentCard from "@/components/tournaments/TournamentCard";
import MatchRowList from "@/components/matches/MatchRowList";
import CountryCard from "@/components/countries/CountryCard";
import PlayerCard from "@/components/players/PlayerCard";
import RecordCard from "@/components/records/RecordCard";
import { formatDate, formatNumber } from "@/lib/format";
import { getHomePageData } from "@/server/queries/home";
import { getTournamentCards } from "@/server/queries/tournaments";
import { atlas } from "@/theme/tokens";

// Live archive data — always render from the current database state.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "WorldCup Atlas — Independent World Cup Archive" },
  description:
    "Explore every World Cup tournament, nation, player, match, goal, and penalty in one independent historical archive.",
};

const CARD_GRID_3 = {
  display: "grid",
  gap: 3,
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
};
const CARD_GRID_4 = {
  display: "grid",
  gap: 3,
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
};

export default async function Home() {
  const [data, tournaments] = await Promise.all([
    getHomePageData(),
    getTournamentCards(),
  ]);
  const { archiveStats } = data;

  // Archive span derived from imported tournaments — never hardcoded.
  const years = tournaments.map((tournament) => tournament.year);
  const spanStart = years.length > 0 ? Math.min(...years) : null;
  const spanEnd = years.length > 0 ? Math.max(...years) : null;
  const span =
    spanStart !== null && spanEnd !== null ? `${spanStart}–${spanEnd}` : null;

  const timelineEntries = [...tournaments]
    .sort((a, b) => a.year - b.year)
    .map((tournament) => ({
      year: tournament.year,
      winner: tournament.winner,
    }));

  const finalsRows = data.iconicMatches.map((match) => ({
    key: match.id,
    year: match.tournamentYear,
    homeName: match.homeTeam.name,
    awayName: match.awayTeam.name,
    score:
      match.penaltyScore !== null
        ? `${match.score} (${match.penaltyScore} pens)`
        : match.score,
    context: match.tournamentName,
    note: [
      formatDate(match.matchDate),
      match.decidedByPenalties ? "Decided on penalties" : null,
    ]
      .filter((part): part is string => part !== null)
      .join(" — "),
    href: `/matches/${match.slug}`,
  }));

  return (
    <Box>
      {/* Hero — black cinematic band */}
      <Box sx={{ borderBottom: `1px solid ${atlas.border}` }}>
        <PageContainer sx={{ py: { xs: 9, md: 14 } }}>
          <VaultEyebrow
            label={span !== null ? `The Archive · ${span}` : "The Archive"}
            sx={{ mb: 3 }}
          />
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "3rem", sm: "4rem", md: "5.2rem" },
              maxWidth: 1000,
              mb: 3,
            }}
          >
            Explore the Complete History of the World Cup
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: atlas.textSecondary,
              fontSize: { xs: "1rem", md: "1.1rem" },
              maxWidth: 620,
              mb: 5,
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
            <VaultButton component={Link} href="/tournaments" variant="primary">
              Explore the Archive
            </VaultButton>
            <VaultButton component={Link} href="/records" variant="outline">
              Records
            </VaultButton>
          </Stack>
          <Box sx={{ maxWidth: 680 }}>
            <GlobalSearch />
          </Box>
        </PageContainer>
      </Box>

      {/* Archive stat strip */}
      <VaultSection sx={{ py: { xs: 6, md: 8 } }}>
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          }}
        >
          <VaultSpecCell
            value={formatNumber(archiveStats.tournaments)}
            label="Tournaments"
          />
          <VaultSpecCell
            value={formatNumber(archiveStats.matches)}
            label="Matches"
          />
          <VaultSpecCell
            value={formatNumber(archiveStats.goals)}
            label="Goals"
          />
          <VaultSpecCell
            value={span ?? "—"}
            label="Archive span"
            sublabel={
              span !== null
                ? `${formatNumber(archiveStats.countries)} nations recorded`
                : undefined
            }
            emphasis
          />
        </Box>
      </VaultSection>

      {/* Tournament timeline */}
      <VaultSection
        band
        eyebrow={span ?? "The editions"}
        title="The Tournament Timeline"
        action={{ label: "All World Cups", href: "/tournaments" }}
      >
        {timelineEntries.length > 0 ? (
          <TournamentTimelineStrip entries={timelineEntries} />
        ) : (
          <EmptyState
            title="Timeline coming soon"
            description="Tournament data has not been imported yet."
          />
        )}
      </VaultSection>

      {/* Featured tournaments */}
      <VaultSection
        eyebrow="Latest editions"
        title="Featured Tournaments"
        action={{ label: "All tournaments", href: "/tournaments" }}
      >
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
      </VaultSection>

      {/* Recent finals — honest label: editorial "iconic" curation is not
          stored in the database. */}
      <VaultSection
        band
        eyebrow="Deciding moments"
        title="Recent Finals"
        description="The most recent deciding finals in the archive."
        action={{ label: "All matches", href: "/matches" }}
      >
        {finalsRows.length > 0 ? (
          <MatchRowList rows={finalsRows} />
        ) : (
          <EmptyState
            title="Finals coming soon"
            description="Match data has not been imported yet."
          />
        )}
      </VaultSection>

      {/* Nations */}
      <VaultSection
        eyebrow="The nations"
        title="Explore by Country"
        description="Nations with the most tournament entries."
        action={{ label: "All countries", href: "/countries" }}
      >
        {data.featuredCountries.length > 0 ? (
          <Box sx={CARD_GRID_4}>
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
          </Box>
        ) : (
          <EmptyState
            title="Countries coming soon"
            description="Country data has not been imported yet."
          />
        )}
      </VaultSection>

      {/* Player records — honest label: these are the archive's leading
          scorers, not a curated legends list. */}
      <VaultSection
        eyebrow="The pantheon"
        title="Top Player Records"
        description="The archive's all-time leading scorers."
        action={{ label: "All players", href: "/players" }}
      >
        {data.featuredPlayers.length > 0 ? (
          <Box sx={CARD_GRID_4}>
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
          </Box>
        ) : (
          <EmptyState
            title="Players coming soon"
            description="Player data has not been imported yet."
          />
        )}
      </VaultSection>

      {/* Records & firsts */}
      <VaultSection
        band
        eyebrow="Still standing"
        title="Records & Firsts"
        description="Database-backed leaderboards computed from imported events."
        action={{ label: "All records", href: "/records" }}
        sx={{ borderBottom: "none" }}
      >
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
      </VaultSection>
    </Box>
  );
}
