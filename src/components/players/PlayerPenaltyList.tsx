import EmptyState from "@/components/ui/EmptyState";
import PlayerEventRow, { PlayerEventRowGroup } from "./PlayerEventRow";
import { formatMinute, formatPenaltyType } from "@/lib/format";
import type { PlayerPenaltyKickDto } from "@/server/queries/types";

const CONVERTED_CHIP = {
  label: "Converted",
  color: "#22C55E",
  background: "rgba(34, 197, 94, 0.14)",
};
const NOT_CONVERTED_CHIP = {
  label: "Not converted",
  color: "#EF4444",
  background: "rgba(239, 68, 68, 0.14)",
};

export default function PlayerPenaltyList({
  kicks,
}: {
  kicks: PlayerPenaltyKickDto[];
}) {
  if (kicks.length === 0) {
    return (
      <EmptyState
        title="No penalty kicks"
        description="No shootout penalty kicks by this player are in the imported dataset. In-match penalty goals appear in the goals list."
      />
    );
  }

  return (
    <PlayerEventRowGroup>
      {kicks.map((kick, index) => {
        const outcome = kick.converted
          ? CONVERTED_CHIP
          : {
              ...NOT_CONVERTED_CHIP,
              label: kick.isSaved
                ? "Saved"
                : kick.isMissed
                  ? "Missed"
                  : "Not converted",
            };
        return (
          <PlayerEventRow
            key={index}
            matchSlug={kick.matchSlug}
            matchLabel={kick.matchLabel}
            tournamentYear={kick.tournamentYear}
            minuteLabel={formatMinute(kick.minute, kick.stoppageMinute)}
            chip={outcome}
            detail={[
              kick.opponent !== null ? `vs ${kick.opponent}` : null,
              formatPenaltyType(kick.type),
            ]
              .filter((part): part is string => part !== null)
              .join(" · ")}
          />
        );
      })}
    </PlayerEventRowGroup>
  );
}
