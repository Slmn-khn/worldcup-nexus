// All-tournaments page — database-backed via the query layer.

import type { Metadata } from "next";
import Box from "@mui/material/Box";
import PageContainer from "@/components/layout/PageContainer";
import VaultPageHeader from "@/components/vault/VaultPageHeader";
import EmptyState from "@/components/ui/EmptyState";
import TournamentCard from "@/components/tournaments/TournamentCard";
import { formatNumber } from "@/lib/format";
import { getTournamentCards } from "@/server/queries/tournaments";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "World Cup Tournaments",
  description:
    "Browse every FIFA World Cup tournament in the WorldCup Atlas archive.",
};

export default async function TournamentsPage() {
  const tournaments = await getTournamentCards();

  return (
    <Box>
      <VaultPageHeader
        title="World Cup Tournaments"
        lede="Browse every tournament in the archive, from the earliest editions to the modern era."
        meta={`${formatNumber(tournaments.length)} tournaments in the archive`}
      />

      <PageContainer sx={{ py: { xs: 6, md: 10 } }}>
        {tournaments.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "repeat(3, 1fr)",
              },
            }}
          >
            {tournaments.map((tournament) => (
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
                href={`/tournaments/${tournament.year}`}
              />
            ))}
          </Box>
        ) : (
          <EmptyState
            title="No tournaments yet"
            description="Tournament data has not been imported. Run the data import pipeline and refresh."
          />
        )}
      </PageContainer>
    </Box>
  );
}
