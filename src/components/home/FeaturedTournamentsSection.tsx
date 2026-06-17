// Featured Tournaments (Phase 4). A 3-up (desktop) grid of the most recent
// editions, each with an approved HERO media band or a CSS fallback. Honest
// label — these are the latest tournaments in the archive, not editorial picks.

import Box from "@mui/material/Box";
import VaultSection from "@/components/vault/VaultSection";
import EmptyState from "@/components/ui/EmptyState";
import FeaturedTournamentCard from "./FeaturedTournamentCard";
import type { HomeFeaturedTournament } from "@/server/home/queries";

const GRID = {
  display: "grid",
  gap: 3,
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
};

export default function FeaturedTournamentsSection({
  tournaments,
}: {
  tournaments: HomeFeaturedTournament[];
}) {
  return (
    <VaultSection
      eyebrow="Latest editions"
      title="Featured Tournaments"
      action={{ label: "All tournaments", href: "/tournaments" }}
    >
      {tournaments.length > 0 ? (
        <Box sx={GRID}>
          {tournaments.map((tournament) => (
            <FeaturedTournamentCard
              key={tournament.id}
              tournament={tournament}
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
  );
}
