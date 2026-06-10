import EmptyState from "@/components/ui/EmptyState";
import PlayerEventRow, { PlayerEventRowGroup } from "./PlayerEventRow";
import { formatMinute } from "@/lib/format";
import type { PlayerGoalDto } from "@/server/queries/types";

const GOAL_CHIP = { label: "Goal", color: "#06111F", background: "#F4C95D" };
const PENALTY_CHIP = {
  label: "Penalty Goal",
  color: "#06111F",
  background: "#C9A13F",
};
const OWN_GOAL_CHIP = {
  label: "Own Goal",
  color: "#F8FAFC",
  background: "#7F1D1D",
};

export default function PlayerGoalList({ goals }: { goals: PlayerGoalDto[] }) {
  if (goals.length === 0) {
    return (
      <EmptyState
        title="No goals"
        description="No goals by this player are in the imported dataset."
      />
    );
  }

  return (
    <PlayerEventRowGroup>
      {goals.map((goal, index) => (
        <PlayerEventRow
          key={index}
          matchSlug={goal.matchSlug}
          matchLabel={goal.matchLabel}
          tournamentYear={goal.tournamentYear}
          minuteLabel={formatMinute(goal.minute, goal.stoppageMinute)}
          chip={
            goal.isOwnGoal
              ? OWN_GOAL_CHIP
              : goal.isPenalty
                ? PENALTY_CHIP
                : GOAL_CHIP
          }
          detail={[
            goal.opponent !== null ? `vs ${goal.opponent}` : null,
            goal.stage,
          ]
            .filter((part): part is string => part !== null)
            .join(" · ")}
        />
      ))}
    </PlayerEventRowGroup>
  );
}
