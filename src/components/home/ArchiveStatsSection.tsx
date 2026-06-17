// Archive at a Glance (Phase 4). Five spec cells over the DB-backed archive
// counters. Values are real (getHomeViewModel → getArchiveStats); the champions
// count and span are derived from tournament data, never hardcoded. When the
// archive is empty the section shows an honest "not imported yet" panel.

import Box from "@mui/material/Box";
import VaultSection from "@/components/vault/VaultSection";
import VaultSpecCell from "@/components/vault/VaultSpecCell";
import EmptyState from "@/components/ui/EmptyState";
import { formatNumber } from "@/lib/format";
import type { HomeArchiveStats } from "@/server/home/queries";

const GRID = {
  display: "grid",
  gap: 3,
  gridTemplateColumns: {
    xs: "1fr 1fr",
    sm: "repeat(3, 1fr)",
    md: "repeat(5, 1fr)",
  },
};

export default function ArchiveStatsSection({
  stats,
}: {
  stats: HomeArchiveStats;
}) {
  const span =
    stats.spanStart !== null && stats.spanEnd !== null
      ? `${stats.spanStart}–${stats.spanEnd}`
      : null;
  const isEmpty =
    stats.tournaments === 0 && stats.matches === 0 && stats.goals === 0;

  return (
    <VaultSection eyebrow="The numbers" title="Archive at a Glance">
      {isEmpty ? (
        <EmptyState
          title="Archive coming soon"
          description="Tournament, match, and goal data appears here once the historical import is connected."
        />
      ) : (
        <Box sx={GRID}>
          <VaultSpecCell
            value={formatNumber(stats.tournaments)}
            label="Tournaments"
            sublabel={span ?? undefined}
          />
          <VaultSpecCell value={formatNumber(stats.matches)} label="Matches" />
          <VaultSpecCell value={formatNumber(stats.goals)} label="Goals" />
          <VaultSpecCell value={formatNumber(stats.nations)} label="Nations" />
          <VaultSpecCell
            value={formatNumber(stats.champions)}
            label="Champions"
            emphasis
          />
        </Box>
      )}
    </VaultSection>
  );
}
