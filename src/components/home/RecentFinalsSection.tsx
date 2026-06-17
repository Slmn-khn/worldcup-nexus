// Recent Finals / Iconic Matches (Phase 4). The most recent deciding finals in
// the archive as flag + scoreline event cards. Honest label — "Recent Finals"
// (data-backed by match stage = "final"), never an editorial "iconic" claim.

import Box from "@mui/material/Box";
import VaultSection from "@/components/vault/VaultSection";
import EmptyState from "@/components/ui/EmptyState";
import FinalMatchCard from "./FinalMatchCard";
import type { HomeFinal } from "@/server/home/queries";

const GRID = {
  display: "grid",
  gap: 3,
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
};

export default function RecentFinalsSection({
  finals,
}: {
  finals: HomeFinal[];
}) {
  return (
    <VaultSection
      band
      eyebrow="Deciding moments"
      title="Recent Finals"
      description="The most recent deciding finals in the archive."
      action={{ label: "All matches", href: "/matches" }}
    >
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
    </VaultSection>
  );
}
