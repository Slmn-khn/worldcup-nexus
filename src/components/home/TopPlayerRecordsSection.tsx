// Top Player Records (Phase 4). The archive's all-time leading scorers as
// portrait cards. Honest label + scope note: this is database-computed goal
// data across all imported tournaments, not an editorial legends list.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import VaultSection from "@/components/vault/VaultSection";
import EmptyState from "@/components/ui/EmptyState";
import PlayerRecordCard from "./PlayerRecordCard";
import { atlas } from "@/theme/tokens";
import type { HomePlayerRecord } from "@/server/home/queries";

const GRID = {
  display: "grid",
  gap: 3,
  gridTemplateColumns: {
    xs: "1fr 1fr",
    sm: "repeat(3, 1fr)",
    md: "repeat(6, 1fr)",
  },
};

export default function TopPlayerRecordsSection({
  players,
}: {
  players: HomePlayerRecord[];
}) {
  return (
    <VaultSection
      eyebrow="The pantheon"
      title="Top Player Records"
      description="The archive's all-time leading scorers, computed from imported goal data."
      action={{ label: "All players", href: "/players" }}
    >
      {players.length > 0 ? (
        <>
          <Box sx={GRID}>
            {players.map((player) => (
              <PlayerRecordCard key={player.id} player={player} />
            ))}
          </Box>
          <Typography
            variant="caption"
            sx={{ color: atlas.textMuted, display: "block", mt: 3 }}
          >
            Goals counted across all imported tournaments (men&apos;s and
            women&apos;s). Squad selections are not match appearances.
          </Typography>
        </>
      ) : (
        <EmptyState
          title="Players coming soon"
          description="Player data has not been imported yet."
        />
      )}
    </VaultSection>
  );
}
