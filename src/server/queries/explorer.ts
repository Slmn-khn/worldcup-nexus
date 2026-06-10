// Data explorer queries (Checkpoints 5G/6B). Normalizes matches and event
// rows (goals, bookings, substitutions, penalty kicks, awards) into one
// frontend-friendly row shape with filterable access. Raw Prisma models and
// RawSourceRecord are never exposed.
//
// Filtering happens DB-side per event type (shared between fetch and count),
// so the windowed merge-pagination stays correct under any filter combo:
// each selected type is fetched with the same sort order up to the requested
// window (page × pageSize), merged in memory, and sliced.
//
// Structural filter rules:
// - playerSlug excludes Match rows (matches have no single player).
// - stage excludes Award rows (awards have no stage).

import { prisma } from "@/server/db/prisma";
import { formatCardType } from "@/lib/format";
import { formatScore, toIso } from "./helpers";
import type {
  ExplorerActiveFilters,
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
/** Hard cap for export mode — exports never stream unbounded data. */
export const EXPLORER_EXPORT_CAP = 5000;
/** Cap for the player filter dropdown (see filterOptions below). */
const PLAYER_OPTION_CAP = 200;

type Filters = {
  year?: number;
  countrySlug?: string;
  playerSlug?: string;
  stage?: string;
  q?: string;
};

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

// ------------------------------------------------------- where builders --
// Builders return plain filter objects cast at the call site. The shapes
// follow each model's relations; sharing one builder across goal-like
// events is safe because their relation names are identical.

function contains(value: string) {
  return { contains: value, mode: "insensitive" as const };
}

function matchWhere(f: Filters): Record<string, unknown> {
  const and: Record<string, unknown>[] = [];
  if (f.year !== undefined) and.push({ tournament: { year: f.year } });
  if (f.countrySlug !== undefined) {
    and.push({
      OR: [
        { homeTeam: { country: { slug: f.countrySlug } } },
        { awayTeam: { country: { slug: f.countrySlug } } },
      ],
    });
  }
  if (f.stage !== undefined)
    and.push({ stage: { equals: f.stage, mode: "insensitive" } });
  if (f.q !== undefined) {
    and.push({
      OR: [
        { homeTeam: { name: contains(f.q) } },
        { awayTeam: { name: contains(f.q) } },
        { stage: contains(f.q) },
        { tournament: { name: contains(f.q) } },
        { stadium: { name: contains(f.q) } },
      ],
    });
  }
  return and.length > 0 ? { AND: and } : {};
}

/** Shared by Goal, Booking, and PenaltyKick (identical relation names). */
function goalLikeWhere(f: Filters): Record<string, unknown> {
  const and: Record<string, unknown>[] = [];
  if (f.year !== undefined)
    and.push({ match: { tournament: { year: f.year } } });
  if (f.countrySlug !== undefined)
    and.push({ team: { country: { slug: f.countrySlug } } });
  if (f.playerSlug !== undefined) and.push({ player: { slug: f.playerSlug } });
  if (f.stage !== undefined) {
    and.push({ match: { stage: { equals: f.stage, mode: "insensitive" } } });
  }
  if (f.q !== undefined) {
    and.push({
      OR: [
        { player: { name: contains(f.q) } },
        { team: { name: contains(f.q) } },
        { match: { homeTeam: { name: contains(f.q) } } },
        { match: { awayTeam: { name: contains(f.q) } } },
        { match: { stage: contains(f.q) } },
        { match: { tournament: { name: contains(f.q) } } },
      ],
    });
  }
  return and.length > 0 ? { AND: and } : {};
}

function substitutionWhere(f: Filters): Record<string, unknown> {
  const and: Record<string, unknown>[] = [];
  if (f.year !== undefined)
    and.push({ match: { tournament: { year: f.year } } });
  if (f.countrySlug !== undefined)
    and.push({ team: { country: { slug: f.countrySlug } } });
  if (f.playerSlug !== undefined) {
    and.push({
      OR: [
        { playerIn: { slug: f.playerSlug } },
        { playerOut: { slug: f.playerSlug } },
      ],
    });
  }
  if (f.stage !== undefined) {
    and.push({ match: { stage: { equals: f.stage, mode: "insensitive" } } });
  }
  if (f.q !== undefined) {
    and.push({
      OR: [
        { playerIn: { name: contains(f.q) } },
        { playerOut: { name: contains(f.q) } },
        { team: { name: contains(f.q) } },
        { match: { homeTeam: { name: contains(f.q) } } },
        { match: { awayTeam: { name: contains(f.q) } } },
        { match: { stage: contains(f.q) } },
        { match: { tournament: { name: contains(f.q) } } },
      ],
    });
  }
  return and.length > 0 ? { AND: and } : {};
}

function awardWhere(f: Filters): Record<string, unknown> {
  const and: Record<string, unknown>[] = [];
  if (f.year !== undefined) and.push({ tournament: { year: f.year } });
  if (f.countrySlug !== undefined) {
    and.push({
      OR: [
        { team: { country: { slug: f.countrySlug } } },
        { player: { country: { slug: f.countrySlug } } },
      ],
    });
  }
  if (f.playerSlug !== undefined) and.push({ player: { slug: f.playerSlug } });
  if (f.q !== undefined) {
    and.push({
      OR: [
        { name: contains(f.q) },
        { player: { name: contains(f.q) } },
        { team: { name: contains(f.q) } },
        { tournament: { name: contains(f.q) } },
      ],
    });
  }
  return and.length > 0 ? { AND: and } : {};
}

// ----------------------------------------------------------- row shapes --

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

const eventTeamSelect = {
  select: { name: true, country: { select: { slug: true } } },
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

async function fetchMatchRows(
  window: number,
  f: Filters,
): Promise<SortableRow[]> {
  const matches = await prisma.match.findMany({
    where: matchWhere(f),
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
        teamCountrySlug: null,
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
  f: Filters,
): Promise<SortableRow[]> {
  const goals = await prisma.goal.findMany({
    where: goalLikeWhere(f),
    include: {
      match: eventMatchSelect,
      team: eventTeamSelect,
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
        teamCountrySlug: goal.team.country?.slug ?? null,
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
  f: Filters,
): Promise<SortableRow[]> {
  const bookings = await prisma.booking.findMany({
    where: goalLikeWhere(f),
    include: {
      match: eventMatchSelect,
      team: eventTeamSelect,
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
        teamCountrySlug: booking.team.country?.slug ?? null,
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
  f: Filters,
): Promise<SortableRow[]> {
  const substitutions = await prisma.substitution.findMany({
    where: substitutionWhere(f),
    include: {
      match: eventMatchSelect,
      team: eventTeamSelect,
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
        teamCountrySlug: sub.team.country?.slug ?? null,
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
  f: Filters,
): Promise<SortableRow[]> {
  const kicks = await prisma.penaltyKick.findMany({
    where: goalLikeWhere(f),
    include: {
      match: eventMatchSelect,
      team: eventTeamSelect,
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
        teamCountrySlug: kick.team.country?.slug ?? null,
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
  f: Filters,
): Promise<SortableRow[]> {
  const awards = await prisma.award.findMany({
    where: awardWhere(f),
    include: {
      tournament: { select: { year: true, name: true } },
      player: { select: { name: true, slug: true } },
      team: eventTeamSelect,
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
      teamCountrySlug: award.team?.country?.slug ?? null,
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

function countFor(eventType: ExplorerEventType, f: Filters): Promise<number> {
  switch (eventType) {
    case "Match":
      return prisma.match.count({ where: matchWhere(f) });
    case "Goal":
      return prisma.goal.count({ where: goalLikeWhere(f) });
    case "Booking":
      return prisma.booking.count({ where: goalLikeWhere(f) });
    case "Substitution":
      return prisma.substitution.count({ where: substitutionWhere(f) });
    case "PenaltyKick":
      return prisma.penaltyKick.count({ where: goalLikeWhere(f) });
    case "Award":
      return prisma.award.count({ where: awardWhere(f) });
  }
}

const FETCHERS: Record<
  ExplorerEventType,
  (window: number, f: Filters) => Promise<SortableRow[]>
> = {
  Match: fetchMatchRows,
  Goal: fetchGoalRows,
  Booking: fetchBookingRows,
  Substitution: fetchSubstitutionRows,
  PenaltyKick: fetchPenaltyKickRows,
  Award: fetchAwardRows,
};

// -------------------------------------------------------- filter options --

async function filterOptions(activePlayerSlug: string | undefined) {
  const [tournamentYears, countries, players, stages, activePlayer] =
    await Promise.all([
      prisma.tournament
        .findMany({ select: { year: true }, orderBy: { year: "desc" } })
        .then((tournaments) => tournaments.map((t) => t.year)),
      prisma.country.findMany({
        select: { name: true, slug: true, flagEmoji: true },
        orderBy: { name: "asc" },
      }),
      // The player option list is deliberately capped: only players with at
      // least one event/award (so the filter always matches rows), first
      // PLAYER_OPTION_CAP by name. The active player is appended if missing
      // so a bookmarked filter still shows its label.
      prisma.player.findMany({
        where: {
          OR: [
            { goals: { some: {} } },
            { bookings: { some: {} } },
            { penaltyKicks: { some: {} } },
            { awards: { some: {} } },
          ],
        },
        select: { name: true, slug: true, country: { select: { name: true } } },
        orderBy: { name: "asc" },
        take: PLAYER_OPTION_CAP,
      }),
      prisma.match
        .findMany({
          distinct: ["stage"],
          select: { stage: true },
          orderBy: { stage: "asc" },
        })
        .then((matches) => matches.map((match) => match.stage)),
      activePlayerSlug !== undefined
        ? prisma.player.findUnique({
            where: { slug: activePlayerSlug },
            select: {
              name: true,
              slug: true,
              country: { select: { name: true } },
            },
          })
        : Promise.resolve(null),
    ]);

  const playerOptions = players.map((player) => ({
    name: player.name,
    slug: player.slug,
    countryName: player.country?.name ?? null,
  }));
  if (
    activePlayer !== null &&
    !playerOptions.some((p) => p.slug === activePlayer.slug)
  ) {
    playerOptions.unshift({
      name: activePlayer.name,
      slug: activePlayer.slug,
      countryName: activePlayer.country?.name ?? null,
    });
  }

  return { tournamentYears, countries, players: playerOptions, stages };
}

// -------------------------------------------------------------- overview --

function cleanString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed !== undefined && trimmed !== ""
    ? trimmed.slice(0, 100)
    : undefined;
}

async function getExplorerDataWithCap(
  options: ExplorerQueryOptions,
  maxPageSize: number,
): Promise<ExplorerDataDto> {
  const page = Math.max(1, Math.trunc(options.page ?? 1));
  const pageSize = Math.min(
    maxPageSize,
    Math.max(1, Math.trunc(options.pageSize ?? DEFAULT_PAGE_SIZE)),
  );
  const filters: Filters = {
    year:
      options.tournamentYear !== undefined &&
      Number.isInteger(options.tournamentYear)
        ? options.tournamentYear
        : undefined,
    countrySlug: cleanString(options.countrySlug),
    playerSlug: cleanString(options.playerSlug),
    stage: cleanString(options.stage),
    q: cleanString(options.q),
  };

  const requestedType = EXPLORER_EVENT_TYPES.includes(
    options.eventType as ExplorerEventType,
  )
    ? (options.eventType as ExplorerEventType)
    : null;
  let selectedTypes =
    requestedType !== null ? [requestedType] : [...EXPLORER_EVENT_TYPES];
  // Structural exclusions (see header comment).
  if (filters.playerSlug !== undefined) {
    selectedTypes = selectedTypes.filter((type) => type !== "Match");
  }
  if (filters.stage !== undefined) {
    selectedTypes = selectedTypes.filter((type) => type !== "Award");
  }

  const window = page * pageSize;

  const [options_, counts, ...rowSets] = await Promise.all([
    filterOptions(filters.playerSlug),
    Promise.all(selectedTypes.map((eventType) => countFor(eventType, filters))),
    ...selectedTypes.map((eventType) => FETCHERS[eventType](window, filters)),
  ]);

  const merged = rowSets
    .flat()
    .sort(compareRows)
    .slice((page - 1) * pageSize, page * pageSize)
    .map((sortableRow) => sortableRow.row);

  const activeFilters: ExplorerActiveFilters = {
    eventType: requestedType,
    tournamentYear: filters.year ?? null,
    countrySlug: filters.countrySlug ?? null,
    playerSlug: filters.playerSlug ?? null,
    stage: filters.stage ?? null,
    q: filters.q ?? null,
  };

  return {
    rows: merged,
    total: counts.reduce((sum, count) => sum + count, 0),
    page,
    pageSize,
    filters: {
      eventTypes: EXPLORER_EVENT_TYPES,
      ...options_,
    },
    activeFilters,
  };
}

export async function getExplorerData(
  options: ExplorerQueryOptions = {},
): Promise<ExplorerDataDto> {
  return getExplorerDataWithCap(options, MAX_PAGE_SIZE);
}

/** Export mode: first EXPLORER_EXPORT_CAP rows matching the filters. */
export async function getExplorerExport(
  options: ExplorerQueryOptions = {},
): Promise<ExplorerDataDto> {
  return getExplorerDataWithCap(
    { ...options, page: 1, pageSize: EXPLORER_EXPORT_CAP },
    EXPLORER_EXPORT_CAP,
  );
}
