// All-tournaments page (Checkpoint 5A) — database-backed via the query layer.

import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PageContainer from "@/components/layout/PageContainer";
import EmptyState from "@/components/ui/EmptyState";
import TournamentCard from "@/components/tournaments/TournamentCard";
import { formatNumber } from "@/lib/format";
import { getTournamentCards } from "@/server/queries/tournaments";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tournaments — WorldCup Atlas",
  description:
    "Browse every FIFA World Cup tournament in the WorldCup Atlas archive.",
};

export default async function TournamentsPage() {
  const tournaments = await getTournamentCards();

  return (
    <Box>
      <Box
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          background:
            "radial-gradient(ellipse 70% 70% at 80% -20%, rgba(244, 201, 93, 0.1), transparent), #06111F",
        }}
      >
        <PageContainer sx={{ py: { xs: 6, md: 9 } }}>
          <Typography
            variant="overline"
            sx={{
              color: "primary.main",
              letterSpacing: "0.2em",
              display: "block",
              mb: 1.5,
            }}
          >
            The Archive
          </Typography>
          <Typography
            variant="h2"
            component="h1"
            sx={{ fontSize: { xs: "2rem", md: "2.75rem" }, mb: 1.5 }}
          >
            World Cup Tournaments
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{ color: "text.secondary", fontWeight: 400, maxWidth: 640 }}
          >
            Browse every tournament in the archive, from the earliest editions
            to the modern era.
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 2.5 }}>
            {formatNumber(tournaments.length)} tournaments in the archive
          </Typography>
        </PageContainer>
      </Box>

      <PageContainer sx={{ py: { xs: 5, md: 7 } }}>
        {tournaments.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gap: 2.5,
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
