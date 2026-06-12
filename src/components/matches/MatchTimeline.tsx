import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import EmptyState from "@/components/ui/EmptyState";
import FadeIn from "@/components/motion/FadeIn";
import { formatMinute } from "@/lib/format";
import type { MatchDetailDto } from "@/server/queries/types";

type TimelineEvent = {
  key: string;
  minute: number | null;
  stoppageMinute: number | null;
  chip: { label: string; color: string; background: string };
  primary: string;
  primarySlug: string | null;
  detail: string;
};

// Goals are solid gold (the headline event); cards keep their literal card
// colors; substitutions are quiet tints. Labels always carry the meaning.
const CHIPS = {
  goal: { label: "Goal", color: "#07111F", background: "#F4C95D" },
  ownGoal: {
    label: "Own Goal",
    color: "#FCA5A5",
    background: "rgba(239, 68, 68, 0.16)",
  },
  penaltyGoal: {
    label: "Penalty Goal",
    color: "#07111F",
    background: "#D6A84F",
  },
  yellow: { label: "Yellow Card", color: "#07111F", background: "#FACC15" },
  secondYellow: {
    label: "Second Yellow",
    color: "#07111F",
    background: "#FB923C",
  },
  red: { label: "Red Card", color: "#F8FAFC", background: "#EF4444" },
  subOn: {
    label: "Sub On",
    color: "#4ADE80",
    background: "rgba(34, 197, 94, 0.14)",
  },
  subOff: {
    label: "Sub Off",
    color: "#CBD5E1",
    background: "rgba(148, 163, 184, 0.12)",
  },
};

function buildEvents(match: MatchDetailDto): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  match.goals.forEach((goal, index) => {
    events.push({
      key: `goal-${index}`,
      minute: goal.minute,
      stoppageMinute: goal.stoppageMinute,
      chip: goal.isOwnGoal
        ? CHIPS.ownGoal
        : goal.isPenalty
          ? CHIPS.penaltyGoal
          : CHIPS.goal,
      primary: goal.playerName,
      primarySlug: goal.playerSlug,
      detail: goal.isOwnGoal
        ? `Goal credited to ${goal.teamName}`
        : goal.teamName,
    });
  });

  match.bookings.forEach((booking, index) => {
    events.push({
      key: `booking-${index}`,
      minute: booking.minute,
      stoppageMinute: booking.stoppageMinute,
      chip:
        booking.cardType === "RED"
          ? CHIPS.red
          : booking.cardType === "SECOND_YELLOW"
            ? CHIPS.secondYellow
            : CHIPS.yellow,
      primary: booking.playerName,
      primarySlug: booking.playerSlug,
      detail: booking.teamName,
    });
  });

  // Substitution source rows are one-sided (ISSUE-007): each row is either a
  // player coming on or going off — they are shown as separate events.
  match.substitutions.forEach((sub, index) => {
    if (sub.playerInName !== null) {
      events.push({
        key: `sub-on-${index}`,
        minute: sub.minute,
        stoppageMinute: sub.stoppageMinute,
        chip: CHIPS.subOn,
        primary: sub.playerInName,
        primarySlug: sub.playerInSlug,
        detail: sub.teamName,
      });
    }
    if (sub.playerOutName !== null) {
      events.push({
        key: `sub-off-${index}`,
        minute: sub.minute,
        stoppageMinute: sub.stoppageMinute,
        chip: CHIPS.subOff,
        primary: sub.playerOutName,
        primarySlug: sub.playerOutSlug,
        detail: sub.teamName,
      });
    }
  });

  return events.sort(
    (a, b) =>
      (a.minute ?? Number.MAX_SAFE_INTEGER) -
        (b.minute ?? Number.MAX_SAFE_INTEGER) ||
      (a.stoppageMinute ?? 0) - (b.stoppageMinute ?? 0),
  );
}

export default function MatchTimeline({ match }: { match: MatchDetailDto }) {
  const events = buildEvents(match);

  if (events.length === 0) {
    return (
      <EmptyState
        title="No event data for this match"
        description="Goals, cards, and substitutions for this match are not in the imported dataset."
      />
    );
  }

  return (
    <FadeIn>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        {events.map((event) => (
          <Box
            key={event.key}
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "48px auto 1fr",
                md: "64px 140px 1fr auto",
              },
              alignItems: "center",
              gap: { xs: 1.5, md: 2 },
              px: 2,
              py: 1.25,
              borderBottom: "1px solid",
              borderColor: "divider",
              "&:last-of-type": { borderBottom: "none" },
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "primary.main", fontWeight: 700 }}
            >
              {formatMinute(event.minute, event.stoppageMinute) ?? "—"}
            </Typography>
            <Chip
              label={event.chip.label}
              size="small"
              sx={{
                bgcolor: event.chip.background,
                color: event.chip.color,
                fontWeight: 700,
                justifySelf: "start",
              }}
            />
            <Box>
              {event.primarySlug !== null ? (
                <Typography
                  component={Link}
                  href={`/players/${event.primarySlug}`}
                  variant="body2"
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  {event.primary}
                </Typography>
              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: "text.primary", fontWeight: 600 }}
                >
                  {event.primary}
                </Typography>
              )}
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: { xs: "block", md: "none" },
                }}
              >
                {event.detail}
              </Typography>
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: { xs: "none", md: "block" },
              }}
            >
              {event.detail}
            </Typography>
          </Box>
        ))}
      </Box>
    </FadeIn>
  );
}
