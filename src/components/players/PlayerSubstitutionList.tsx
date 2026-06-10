import EmptyState from "@/components/ui/EmptyState";
import PlayerEventRow, { PlayerEventRowGroup } from "./PlayerEventRow";
import { formatMinute } from "@/lib/format";
import type { PlayerSubstitutionDto } from "@/server/queries/types";

const IN_CHIP = { label: "Subbed In", color: "#F8FAFC", background: "#1F7A4D" };
const OUT_CHIP = {
  label: "Subbed Out",
  color: "#CBD5E1",
  background: "#253449",
};

export default function PlayerSubstitutionList({
  substitutions,
}: {
  substitutions: PlayerSubstitutionDto[];
}) {
  if (substitutions.length === 0) {
    return (
      <EmptyState
        title="No substitutions"
        description="No substitutions involving this player are in the imported dataset."
      />
    );
  }

  return (
    <PlayerEventRowGroup>
      {substitutions.map((sub, index) => (
        <PlayerEventRow
          key={index}
          matchSlug={sub.matchSlug}
          matchLabel={sub.matchLabel}
          tournamentYear={sub.tournamentYear}
          minuteLabel={formatMinute(sub.minute, sub.stoppageMinute)}
          chip={sub.direction === "IN" ? IN_CHIP : OUT_CHIP}
          detail={[
            sub.opponent !== null ? `vs ${sub.opponent}` : null,
            sub.stage,
          ]
            .filter((part): part is string => part !== null)
            .join(" · ")}
        />
      ))}
    </PlayerEventRowGroup>
  );
}
