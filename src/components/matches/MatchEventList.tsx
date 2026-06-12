import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import EmptyState from "@/components/ui/EmptyState";
import { formatMinute } from "@/lib/format";
import type { MatchDetailDto } from "@/server/queries/types";

type RowProps = {
  minuteLabel: string | null;
  name: string;
  slug: string | null;
  detail: string;
};

function EventRow({ minuteLabel, name, slug, detail }: RowProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "baseline",
        gap: 1.5,
        px: 2,
        py: 1,
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:last-of-type": { borderBottom: "none" },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: "primary.main",
          fontWeight: 700,
          width: 44,
          flexShrink: 0,
        }}
      >
        {minuteLabel ?? "—"}
      </Typography>
      {slug !== null ? (
        <Typography
          component={Link}
          href={`/players/${slug}`}
          variant="body2"
          sx={{
            color: "text.primary",
            fontWeight: 600,
            "&:hover": { color: "primary.main" },
          }}
        >
          {name}
        </Typography>
      ) : (
        <Typography
          variant="body2"
          sx={{ color: "text.primary", fontWeight: 600 }}
        >
          {name}
        </Typography>
      )}
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", ml: "auto", textAlign: "right" }}
      >
        {detail}
      </Typography>
    </Box>
  );
}

function EventSection({
  title,
  children,
  isEmpty,
  emptyLabel,
}: {
  title: string;
  children: React.ReactNode;
  isEmpty: boolean;
  emptyLabel: string;
}) {
  return (
    <Box>
      <Typography
        variant="overline"
        sx={{
          color: "primary.main",
          letterSpacing: "0.14em",
          display: "block",
          mb: 1,
        }}
      >
        {title}
      </Typography>
      {isEmpty ? (
        <Typography variant="body2" sx={{ color: "text.secondary", px: 0.5 }}>
          {emptyLabel}
        </Typography>
      ) : (
        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 0,
            bgcolor: "background.paper",
            overflow: "hidden",
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
}

/** Per-category event breakdown (goals / cards / substitutions). */
export default function MatchEventList({ match }: { match: MatchDetailDto }) {
  const hasAny =
    match.goals.length > 0 ||
    match.bookings.length > 0 ||
    match.substitutions.length > 0;
  if (!hasAny) {
    return (
      <EmptyState
        title="No event data for this match"
        description="Goals, cards, and substitutions for this match are not in the imported dataset."
      />
    );
  }

  return (
    <Stack spacing={3}>
      <EventSection
        title={`Goals · ${match.goals.length}`}
        isEmpty={match.goals.length === 0}
        emptyLabel="No goals recorded in this match."
      >
        {match.goals.map((goal, index) => (
          <EventRow
            key={index}
            minuteLabel={formatMinute(goal.minute, goal.stoppageMinute)}
            name={goal.playerName}
            slug={goal.playerSlug}
            detail={[
              goal.teamName,
              goal.isPenalty ? "penalty" : null,
              goal.isOwnGoal ? "own goal" : null,
            ]
              .filter((part): part is string => part !== null)
              .join(" · ")}
          />
        ))}
      </EventSection>

      <EventSection
        title={`Cards · ${match.bookings.length}`}
        isEmpty={match.bookings.length === 0}
        emptyLabel="No cards recorded in this match."
      >
        {match.bookings.map((booking, index) => (
          <EventRow
            key={index}
            minuteLabel={formatMinute(booking.minute, booking.stoppageMinute)}
            name={booking.playerName}
            slug={booking.playerSlug}
            detail={`${booking.teamName} · ${
              booking.cardType === "RED"
                ? "red card"
                : booking.cardType === "SECOND_YELLOW"
                  ? "second yellow"
                  : "yellow card"
            }`}
          />
        ))}
      </EventSection>

      <EventSection
        title={`Substitution records · ${match.substitutions.length}`}
        isEmpty={match.substitutions.length === 0}
        emptyLabel="No substitutions recorded in this match."
      >
        {match.substitutions.map((sub, index) => (
          <EventRow
            key={index}
            minuteLabel={formatMinute(sub.minute, sub.stoppageMinute)}
            name={sub.playerInName ?? sub.playerOutName ?? "Unknown player"}
            slug={
              sub.playerInName !== null ? sub.playerInSlug : sub.playerOutSlug
            }
            detail={`${sub.teamName} · ${sub.playerInName !== null ? "on" : "off"}`}
          />
        ))}
      </EventSection>
    </Stack>
  );
}
