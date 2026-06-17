// Featured Tournaments (neon pass). A 3-up (desktop) grid of image-first cards
// for the most recent editions. Honest label — these are the latest tournaments
// in the archive, not editorial picks.

import Box from "@mui/material/Box";
import HomeSection from "./HomeSection";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";
import FeaturedTournamentCard from "./FeaturedTournamentCard";
import type { HomeFeaturedTournament } from "@/server/home/queries";

const GRID = {
  display: "grid",
  gap: { xs: 2.5, md: 3 },
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
};

export default function FeaturedTournamentsSection({
  tournaments,
}: {
  tournaments: HomeFeaturedTournament[];
}) {
  return (
    <HomeSection divider>
      <SectionHeader
        eyebrow="Latest editions"
        title="Featured Tournaments"
        accent="cyan"
        action={{ label: "All tournaments", href: "/tournaments" }}
      />
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
    </HomeSection>
  );
}
