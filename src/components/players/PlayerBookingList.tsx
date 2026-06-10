import EmptyState from "@/components/ui/EmptyState";
import PlayerEventRow, { PlayerEventRowGroup } from "./PlayerEventRow";
import { formatCardType, formatMinute } from "@/lib/format";
import type { PlayerBookingDto } from "@/server/queries/types";

const CARD_CHIPS = {
  YELLOW: { label: "Yellow Card", color: "#06111F", background: "#FACC15" },
  SECOND_YELLOW: {
    label: "Second Yellow",
    color: "#06111F",
    background: "#FB923C",
  },
  RED: { label: "Red Card", color: "#F8FAFC", background: "#EF4444" },
};

export default function PlayerBookingList({
  bookings,
}: {
  bookings: PlayerBookingDto[];
}) {
  if (bookings.length === 0) {
    return (
      <EmptyState
        title="No cards"
        description="No bookings for this player are in the imported dataset."
      />
    );
  }

  return (
    <PlayerEventRowGroup>
      {bookings.map((booking, index) => (
        <PlayerEventRow
          key={index}
          matchSlug={booking.matchSlug}
          matchLabel={booking.matchLabel}
          tournamentYear={booking.tournamentYear}
          minuteLabel={formatMinute(booking.minute, booking.stoppageMinute)}
          chip={{
            ...CARD_CHIPS[booking.cardType],
            label: formatCardType(booking.cardType),
          }}
          detail={[
            booking.opponent !== null ? `vs ${booking.opponent}` : null,
            booking.stage,
          ]
            .filter((part): part is string => part !== null)
            .join(" · ")}
        />
      ))}
    </PlayerEventRowGroup>
  );
}
