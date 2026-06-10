import Box from "@mui/material/Box";
import StatCard from "@/components/ui/StatCard";
import { formatNumber } from "@/lib/format";
import type { TournamentDetailDto } from "@/server/queries/types";

export default function TournamentStatGrid({
  tournament,
}: {
  tournament: TournamentDetailDto;
}) {
  const stats = [
    { label: "Teams", value: tournament.teamsCount },
    { label: "Matches", value: tournament.matchesCount },
    { label: "Goals", value: tournament.goalsCount },
    { label: "Cards", value: tournament.stats.bookings },
    { label: "Substitutions", value: tournament.stats.substitutions },
    { label: "Penalty shootouts", value: tournament.stats.penaltyShootouts },
    { label: "Shootout kicks", value: tournament.stats.penaltyKicks },
    { label: "Awards", value: tournament.awards.length },
  ].filter(
    (stat): stat is { label: string; value: number } => stat.value !== null,
  );

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr 1fr",
          sm: "repeat(3, 1fr)",
          md: "repeat(4, 1fr)",
        },
      }}
    >
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={formatNumber(stat.value)}
        />
      ))}
    </Box>
  );
}
