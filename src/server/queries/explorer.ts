// Data explorer queries (Checkpoint 5G). Normalizes matches and event rows
// (goals, bookings, substitutions, penalty kicks, awards) into one
// frontend-friendly row shape. Raw Prisma models and RawSourceRecord are
// never exposed.
//
// Pagination across the combined view: each selected type is fetched with
// the same sort order up to the requested window (page × pageSize), merged
// in memory, and sliced. Correct for any page; intentionally simple v1 —
// deep pages fetch larger windows, which is fine at the current data size.

import { prisma } from "@/server/db/prisma";
import { formatCardType } from "@/lib/format";
import { formatScore, toIso } from "./helpers";
import type {
  ExplorerDataDto,
  ExplorerEventType,
  ExplorerQueryOptions,
  ExplorerRowDto,
} from "./types";

export const EXPLORER_EVENT_TYPES: ExplorerEventType[] = [
  "Match",
  "Goal",
  "Booking",
  "Substitution",
  "PenaltyKick",
  "Award",
];

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

/** Sort tuple shared by all event types: year desc, date desc, minute asc. */
type SortableRow = {
  row: ExplorerRowDto;
  year: number;
  dateMs: number; // -Infinity when no date (sorts last within the year)
  minute: number; // -1 for matches so they appear before their own events
};

function compareRows(a: SortableRow, b: SortableRow): number {
  return (
    b.year - a.year ||
    b.dateMs - a.dateMs ||
    a.minute - b.minute ||
    a.row.id.localeCompare(b.row.id)
  );
}

const eventMatchSelect = {
  select: {
    slug: true,
    stage: true,
    matchDate: true,
    homeTeam: { select: { name: true } },
    awayTeam: { select: { name: true } },
    tournament: { select: { year: true, name: true } },
  },
} as const;

type EventMatch = {
  slug: string;
  stage: string;
  matchDate: Date | null;
  homeTeam: { name: string };
  awayTeam: { name: string };
  tournament: { year: number; name: string };
};

/** Row fields shared by all match-scoped events. */
function matchContext(match: EventMatch) {
  return {
    tournamentYear: match.tournament.year,
    tournamentName: match.tournament.name,
    matchLabel: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
    matchSlug: match.slug,
    stage: match.stage,
    date: toIso(match.matchDate),
    href: `/matches/${match.slug}`,
  };
}

function sortable(
  row: ExplorerRowDto,
  match: { tournament: { year: number }; matchDate: Date | null },
  minute: number | null,
): SortableRow {
  return {
    row,
    year: match.tournament.year,
    dateMs: match.matchDate?.getTime() ?? Number.NEGATIVE_INFINITY,
    minute: minute ?? -1,
  };
}

// ------------------------------------------------------------- per type --

type YearFilter = number | undefined;

async function fetchMatchRows(
  window: number,
  year: YearFilter,
): Promise<SortableRow[]> {
  const matches = await prisma.match.findMany({
    where: year !== undefined ? { tournament: { year } } : undefined,
    select: {
      id: true,
      slug: true,
      stage: true,
      matchDate: true,
      homeScore: true,
      awayScore: true,
      homeScorePenalties: true,
      awayScorePenalties: true,
      decidedByPenalties: true,
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
      stadium: { select: { name: true } },
      tournament: { select: { year: true, name: true } },
    },
    orderBy: [
      { tournament: { year: "desc" } },
      { matchDate: "desc" },
      { matchNumber: "desc" },
    ],
    take: window,
  });
  return matches.map((match) => {
    const penalties =
      match.decidedByPenalties &&
      match.homeScorePenalties !== null &&
      match.awayScorePenalties !== null
        ? ` (${formatScore(match.homeScorePenalties, match.awayScorePenalties)} pens)`
        : "";
    return sortable(
      {
        id: `match-${match.id}`,
        eventType: "Match",
        ...matchContext(match),
        teamName: null,
        playerName: null,
        playerSlug: null,
        minute: null,
        stoppageMinute: null,
        detail: match.stadium?.name ?? null,
        outcome: `${formatScore(match.homeScore, match.awayScore)}${penalties}`,
      },
      match,
      null,
    );
  });
}

async function fetchGoalRows(
  window: number,
  year: YearFilter,
): Promise<SortableRow[]> {
  const goals = await prisma.goal.findMany({
    where: year !== undefined ? { match: { tournament: { year } } } : undefined,
    include: {
      match: eventMatchSelect,
      team: { select: { name: true } },
      player: { select: { name: true, slug: true } },
    },
    orderBy: [
      { match: { tournament: { year: "desc" } } },
      { match: { matchDate: "desc" } },
      { minute: "asc" },
    ],
    take: window,
  });
  return goals.map((goal) =>
    sortable(
      {
        id: `goal-${goal.id}`,
        eventType: "Goal",
        ...matchContext(goal.match),
        teamName: goal.team.name,
        playerName: goal.player.name,
        playerSlug: goal.player.slug,
        minute: goal.minute,
        stoppageMinute: goal.stoppageMinute,
        detail: goal.isOwnGoal
          ? `Own goal, credited to ${goal.team.name}`
          : null,
        outcome: goal.isOwnGoal
          ? "Own goal"
          : goal.isPenalty
            ? "Penalty goal"
            : "Goal",
      },
      goal.match,
      goal.minute,
    ),
  );
}

async function fetchBookingRows(
  window: number,
  year: YearFilter,
): Promise<SortableRow[]> {
  const bookings = await prisma.booking.findMany({
    where: year !== undefined ? { match: { tournament: { year } } } : undefined,
    include: {
      match: eventMatchSelect,
      team: { select: { name: true } },
      player: { select: { name: true, slug: true } },
    },
    orderBy: [
      { match: { tournament: { year: "desc" } } },
      { match: { matchDate: "desc" } },
      { minute: "asc" },
    ],
    take: window,
  });
  return bookings.map((booking) =>
    sortable(
      {
        id: `booking-${booking.id}`,
        eventType: "Booking",
        ...matchContext(booking.match),
        teamName: booking.team.name,
        playerName: booking.player.name,
        playerSlug: booking.player.slug,
        minute: booking.minute,
        stoppageMinute: booking.stoppageMinute,
        detail: null,
        outcome: formatCardType(booking.cardType),
      },
      booking.match,
      booking.minute,
    ),
  );
}

async function fetchSubstitutionRows(
  window: number,
  year: YearFilter,
): Promise<SortableRow[]> {
  const substitutions = await prisma.substitution.findMany({
    where: year !== undefined ? { match: { tournament: { year } } } : undefined,
    include: {
      match: eventMatchSelect,
      team: { select: { name: true } },
      playerIn: { select: { name: true, slug: true } },
      playerOut: { select: { name: true, slug: true } },
    },
    orderBy: [
      { match: { tournament: { year: "desc" } } },
      { match: { matchDate: "desc" } },
      { minute: "asc" },
    ],
    take: window,
  });
  return substitutions.map((sub) => {
    const player = sub.playerIn ?? sub.playerOut;
    return sortable(
      {
        id: `substitution-${sub.id}`,
        eventType: "Substitution",
        ...matchContext(sub.match),
        teamName: sub.team.name,
        playerName: player?.name ?? null,
        playerSlug: player?.slug ?? null,
        minute: sub.minute,
        stoppageMinute: sub.stoppageMinute,
        detail: null,
        outcome:
          sub.playerIn !== null
            ? "Player in"
            : sub.playerOut !== null
              ? "Player out"
              : null,
      },
      sub.match,
      sub.minute,
    );
  });
}

async function fetchPenaltyKickRows(
  window: number,
  year: YearFilter,
): Promise<SortableRow[]> {
  const kicks = await prisma.penaltyKick.findMany({
    where: year !== undefined ? { match: { tournament: { year } } } : undefined,
    include: {
      match: eventMatchSelect,
      team: { select: { name: true } },
      player: { select: { name: true, slug: true } },
    },
    orderBy: [
      { match: { tournament: { year: "desc" } } },
      { match: { matchDate: "desc" } },
      { sourceId: "asc" },
    ],
    take: window,
  });
  return kicks.map((kick) =>
    sortable(
      {
        id: `penaltykick-${kick.id}`,
        eventType: "PenaltyKick",
        ...matchContext(kick.match),
        teamName: kick.team.name,
        playerName: kick.player?.name ?? null,
        playerSlug: kick.player?.slug ?? null,
        minute: kick.minute,
        stoppageMinute: kick.stoppageMinute,
        detail: kick.type === "SHOOTOUT" ? "Shootout" : "In match",
        // The source does not distinguish missed from saved (ISSUE-008).
        outcome: kick.converted
          ? "Converted"
          : kick.isSaved
            ? "Saved"
            : kick.isMissed
              ? "Missed"
              : "Not converted",
      },
      kick.match,
      kick.minute,
    ),
  );
}

async function fetchAwardRows(
  window: number,
  year: YearFilter,
): Promise<SortableRow[]> {
  const awards = await prisma.award.findMany({
    where: year !== undefined ? { tournament: { year } } : undefined,
    include: {
      tournament: { select: { year: true, name: true } },
      player: { select: { name: true, slug: true } },
      team: { select: { name: true } },
    },
    orderBy: [{ tournament: { year: "desc" } }, { name: "asc" }],
    take: window,
  });
  return awards.map((award) => ({
    row: {
      id: `award-${award.id}`,
      eventType: "Award" as const,
      tournamentYear: award.tournament.year,
      tournamentName: award.tournament.name,
      matchLabel: null,
      matchSlug: null,
      stage: null,
      date: null,
      teamName: award.team?.name ?? null,
      playerName: award.player?.name ?? null,
      playerSlug: award.player?.slug ?? null,
      minute: null,
      stoppageMinute: null,
      detail: null,
      outcome: award.name,
      href:
        award.player !== null
          ? `/players/${award.player.slug}`
          : `/tournaments/${award.tournament.year}`,
    },
    year: award.tournament.year,
    dateMs: Number.NEGATIVE_INFINITY,
    minute: -1,
  }));
}

// --------------------------------------------------------------- counts --

function countFor(
  eventType: ExplorerEventType,
  year: YearFilter,
): Promise<number> {
  const matchScoped =
    year !== undefined ? { match: { tournament: { year } } } : undefined;
  switch (eventType) {
    case "Match":
      return prisma.match.count({
        where: year !== undefined ? { tournament: { year } } : undefined,
      });
    case "Goal":
      return prisma.goal.count({ where: matchScoped });
    case "Booking":
      return prisma.booking.count({ where: matchScoped });
    case "Substitution":
      return prisma.substitution.count({ where: matchScoped });
    case "PenaltyKick":
      return prisma.penaltyKick.count({ where: matchScoped });
    case "Award":
      return prisma.award.count({
        where: year !== undefined ? { tournament: { year } } : undefined,
      });
  }
}

const FETCHERS: Record<
  ExplorerEventType,
  (window: number, year: YearFilter) => Promise<SortableRow[]>
> = {
  Match: fetchMatchRows,
  Goal: fetchGoalRows,
  Booking: fetchBookingRows,
  Substitution: fetchSubstitutionRows,
  PenaltyKick: fetchPenaltyKickRows,
  Award: fetchAwardRows,
};

// -------------------------------------------------------------- overview --

export async function getExplorerData(
  options: ExplorerQueryOptions = {},
): Promise<ExplorerDataDto> {
  const page = Math.max(1, Math.trunc(options.page ?? 1));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.trunc(options.pageSize ?? DEFAULT_PAGE_SIZE)),
  );
  const year =
    options.tournamentYear !== undefined &&
    Number.isInteger(options.tournamentYear)
      ? options.tournamentYear
      : undefined;
  const selectedTypes = EXPLORER_EVENT_TYPES.includes(
    options.eventType as ExplorerEventType,
  )
    ? [options.eventType as ExplorerEventType]
    : EXPLORER_EVENT_TYPES;

  // Each type is fetched up to the global window so the merged slice is
  // correct for the requested page.
  const window = page * pageSize;

  const [tournamentYears, counts, ...rowSets] = await Promise.all([
    prisma.tournament
      .findMany({ select: { year: true }, orderBy: { year: "desc" } })
      .then((tournaments) => tournaments.map((t) => t.year)),
    Promise.all(selectedTypes.map((eventType) => countFor(eventType, year))),
    ...selectedTypes.map((eventType) => FETCHERS[eventType](window, year)),
  ]);

  const merged = rowSets
    .flat()
    .sort(compareRows)
    .slice((page - 1) * pageSize, page * pageSize)
    .map((sortableRow) => sortableRow.row);

  return {
    rows: merged,
    total: counts.reduce((sum, count) => sum + count, 0),
    page,
    pageSize,
    filters: {
      eventTypes: EXPLORER_EVENT_TYPES,
      tournamentYears,
    },
  };
}
