// Records & Firsts (Phase 4). Database-backed leaderboard highlights — one
// marquee card per record category, each showing the current leader and an
// honest description. Links to the full /records surface.

import Box from "@mui/material/Box";
import VaultSection from "@/components/vault/VaultSection";
import EmptyState from "@/components/ui/EmptyState";
import RecordHighlightCard from "./RecordHighlightCard";
import { formatNumber } from "@/lib/format";
import type { RecordLeaderboardDto } from "@/server/queries/types";

const GRID = {
  display: "grid",
  gap: 3,
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
};

export default function RecordsFirstsSection({
  records,
}: {
  records: RecordLeaderboardDto[];
}) {
  const cards = records
    .map((board) => {
      const top = board.items[0];
      if (top === undefined) return null;
      return {
        key: board.key,
        title: board.title,
        value: `${top.label} — ${top.detail ?? formatNumber(top.value)}`,
        description: board.description,
        href: top.href ?? "/records",
      };
    })
    .filter((card): card is NonNullable<typeof card> => card !== null);

  return (
    <VaultSection
      band
      eyebrow="Still standing"
      title="Records & Firsts"
      description="Database-backed leaderboards computed from imported events."
      action={{ label: "All records", href: "/records" }}
      sx={{ borderBottom: "none" }}
    >
      {cards.length > 0 ? (
        <Box sx={GRID}>
          {cards.map((card) => (
            <RecordHighlightCard
              key={card.key}
              title={card.title}
              value={card.value}
              description={card.description}
              href={card.href}
            />
          ))}
        </Box>
      ) : (
        <EmptyState
          title="Records coming soon"
          description="Leaderboards appear once event data is imported."
        />
      )}
    </VaultSection>
  );
}
