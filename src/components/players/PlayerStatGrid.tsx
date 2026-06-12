import StatCard from "@/components/ui/StatCard";
import StaggerContainer from "@/components/motion/StaggerContainer";
import { formatNumber } from "@/lib/format";
import type { PlayerProfileDto } from "@/server/queries/types";

/**
 * No "appearances" stat — match appearance data is not imported. Squad
 * selections are labeled as such.
 */
export default function PlayerStatGrid({
  player,
}: {
  player: PlayerProfileDto;
}) {
  const { totals } = player;
  const stats: { label: string; value: string }[] = [
    {
      label: "Squad tournaments",
      value: formatNumber(totals.selectedTournaments),
    },
    { label: "Goals", value: formatNumber(totals.goals) },
    {
      label: "Penalties converted",
      value: formatNumber(totals.penaltyKicksConverted),
    },
    { label: "Penalties taken", value: formatNumber(totals.penaltyKicksTotal) },
    { label: "Cards", value: formatNumber(totals.bookings) },
    { label: "Subbed in", value: formatNumber(totals.substitutionsIn) },
    { label: "Subbed out", value: formatNumber(totals.substitutionsOut) },
    { label: "Awards", value: formatNumber(totals.awards) },
  ];

  return (
    <StaggerContainer
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
      }}
    >
      {stats.map((stat) => (
        <StatCard key={stat.label} label={stat.label} value={stat.value} />
      ))}
    </StaggerContainer>
  );
}
