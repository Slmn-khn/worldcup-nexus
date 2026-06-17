// Recent Finals / Iconic Matches (neon pass). The most recent deciding finals
// as a premium results board of glowing cards. Honest label — "Recent Finals"
// (data-backed by match stage = "final"), never an editorial "iconic" claim.

import Box from "@mui/material/Box";
import HomeSection from "./HomeSection";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";
import FinalMatchCard from "./FinalMatchCard";
import type { HomeFinal } from "@/server/home/queries";

const GRID = {
  display: "grid",
  gap: { xs: 2.5, md: 3 },
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
};

export default function RecentFinalsSection({
  finals,
}: {
  finals: HomeFinal[];
}) {
  return (
    <HomeSection divider>
      <SectionHeader
        eyebrow="Deciding moments"
        title="Recent Finals"
        accent="gold"
        subtitle="The most recent deciding finals in the archive."
        action={{ label: "All matches", href: "/matches" }}
      />
      {finals.length > 0 ? (
        <Box sx={GRID}>
          {finals.map((match) => (
            <FinalMatchCard key={match.id} match={match} />
          ))}
        </Box>
      ) : (
        <EmptyState
          title="Finals coming soon"
          description="Match data has not been imported yet."
        />
      )}
    </HomeSection>
  );
}
