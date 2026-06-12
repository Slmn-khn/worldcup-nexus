import StatCard from "@/components/ui/StatCard";
import StaggerContainer from "@/components/motion/StaggerContainer";
import { formatNumber } from "@/lib/format";
import type { CountryProfileDto } from "@/server/queries/types";

export default function CountryStatGrid({
  country,
}: {
  country: CountryProfileDto;
}) {
  const { totals } = country;
  const goalDifference =
    totals.goalDifference > 0
      ? `+${formatNumber(totals.goalDifference)}`
      : formatNumber(totals.goalDifference);

  const stats: { label: string; value: string }[] = [
    { label: "Tournaments", value: formatNumber(totals.tournamentsEntered) },
    { label: "Titles", value: formatNumber(totals.titles) },
    { label: "Finals", value: formatNumber(totals.finalsPlayed) },
    { label: "Matches", value: formatNumber(totals.matchesPlayed) },
    { label: "Wins", value: formatNumber(totals.wins) },
    { label: "Draws", value: formatNumber(totals.draws) },
    { label: "Losses", value: formatNumber(totals.losses) },
    { label: "Goals for", value: formatNumber(totals.goalsFor) },
    { label: "Goals against", value: formatNumber(totals.goalsAgainst) },
    { label: "Goal difference", value: goalDifference },
  ];

  return (
    <StaggerContainer
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr 1fr",
          sm: "repeat(3, 1fr)",
          md: "repeat(5, 1fr)",
        },
      }}
    >
      {stats.map((stat) => (
        <StatCard key={stat.label} label={stat.label} value={stat.value} />
      ))}
    </StaggerContainer>
  );
}
