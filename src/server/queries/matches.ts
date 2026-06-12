// Match queries for DB-backed pages (Checkpoint 4D; filters in 7D).

import { prisma } from "@/server/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { finalStageFilter, matchCardInclude, toMatchCardDto } from "./helpers";
import type {
  FilterOptionDto,
  MatchCardDto,
  MatchDetailDto,
  MatchFilterOptions,
  MatchIndexDto,
  MatchIndexFilterMetaDto,
} from "./types";

function matchWhere(options: MatchFilterOptions): Prisma.MatchWhereInput {
  const where: Prisma.MatchWhereInput = {};
  const and: Prisma.MatchWhereInput[] = [];

  if (options.tournamentYear !== undefined) {
    and.push({ tournament: { year: options.tournamentYear } });
  }
  if (options.countrySlug !== undefined) {
    and.push({
      OR: [
        { homeTeam: { country: { slug: options.countrySlug } } },
        { awayTeam: { country: { slug: options.countrySlug } } },
      ],
    });
  }
  if (options.stage !== undefined) {
    and.push({ stage: { equals: options.stage, mode: "insensitive" } });
  }
  if (options.decidedByPenalties !== undefined) {
    and.push({ decidedByPenalties: options.decidedByPenalties });
  }
  const q = options.q?.trim();
  if (q !== undefined && q !== "") {
    const qOr: Prisma.MatchWhereInput[] = [
      { homeTeam: { name: { contains: q, mode: "insensitive" } } },
      { awayTeam: { name: { contains: q, mode: "insensitive" } } },
      { stage: { contains: q, mode: "insensitive" } },
      { stadium: { name: { contains: q, mode: "insensitive" } } },
    ];
    const asYear = Number(q);
    if (Number.isInteger(asYear) && asYear >= 1900 && asYear <= 2100) {
      qOr.push({ tournament: { year: asYear } });
    }
    and.push({ OR: qOr });
  }

  if (and.length > 0) where.AND = and;
  return where;
}

/**
 * Paged, filterable match cards for the /matches index. Score-derived sorts
 * (highest-scoring, biggest-margin) rank the filtered ids in memory first —
 * Prisma cannot order by computed columns — then fetch just the page.
 */
export async function getMatchCards(
  options: MatchFilterOptions = {},
): Promise<MatchIndexDto> {
  const { page = 1, pageSize = 30, sort = "newest" } = options;
  const where = matchWhere(options);
  const skip = Math.max(0, page - 1) * pageSize;

  const withHref = (match: Parameters<typeof toMatchCardDto>[0]) => {
    const card = toMatchCardDto(match);
    // slug is unique and always set by the import; id is the fallback.
    return {
      ...card,
      href: `/matches/${card.slug !== "" ? card.slug : card.id}`,
    };
  };

  if (sort === "highest-scoring" || sort === "biggest-margin") {
    const scored = await prisma.match.findMany({
      where,
      select: { id: true, homeScore: true, awayScore: true, matchDate: true },
    });
    scored.sort((a, b) => {
      const aValue =
        sort === "highest-scoring"
          ? a.homeScore + a.awayScore
          : Math.abs(a.homeScore - a.awayScore);
      const bValue =
        sort === "highest-scoring"
          ? b.homeScore + b.awayScore
          : Math.abs(b.homeScore - b.awayScore);
      return (
        bValue - aValue ||
        (b.matchDate?.getTime() ?? 0) - (a.matchDate?.getTime() ?? 0)
      );
    });
    const pageIds = scored.slice(skip, skip + pageSize).map((m) => m.id);
    const pageMatches = await prisma.match.findMany({
      where: { id: { in: pageIds } },
      include: matchCardInclude,
    });
    const byId = new Map(pageMatches.map((m) => [m.id, m]));
    return {
      matches: pageIds
        .map((id) => byId.get(id))
        .filter((m): m is NonNullable<typeof m> => m !== undefined)
        .map(withHref),
      totalCount: scored.length,
      page,
      pageSize,
    };
  }

  const dateOrder = sort === "oldest" ? ("asc" as const) : ("desc" as const);
  const [matches, totalCount] = await Promise.all([
    prisma.match.findMany({
      where,
      include: matchCardInclude,
      orderBy: [
        { tournament: { year: dateOrder } },
        { matchDate: dateOrder },
        { matchNumber: dateOrder },
      ],
      skip,
      take: pageSize,
    }),
    prisma.match.count({ where }),
  ]);

  return {
    matches: matches.map(withHref),
    totalCount,
    page,
    pageSize,
  };
}

/** Filter-option metadata for the /matches index, from actual DB values. */
export async function getMatchFilterMeta(): Promise<MatchIndexFilterMetaDto> {
  const [tournaments, countries, stages] = await Promise.all([
    prisma.tournament.findMany({
      select: { year: true },
      orderBy: { year: "desc" },
    }),
    prisma.country.findMany({
      where: { teams: { some: {} } },
      select: { name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.match.findMany({
      select: { stage: true },
      distinct: ["stage"],
      orderBy: { stage: "asc" },
    }),
  ]);

  const stageOptions: FilterOptionDto[] = stages.map(({ stage }) => ({
    // Display casing happens at render; the value must stay the raw DB value.
    label: stage,
    value: stage,
  }));

  return {
    options: {
      years: tournaments.map(({ year }) => ({
        label: String(year),
        value: String(year),
      })),
      countries: countries.map(({ name, slug }) => ({
        label: name,
        value: slug,
      })),
      stages: stageOptions,
    },
  };
}

const matchDetailInclude = {
  ...matchCardInclude,
  homeTeam: {
    select: {
      name: true,
      slug: true,
      country: { select: { name: true, slug: true } },
    },
  },
  awayTeam: {
    select: {
      name: true,
      slug: true,
      country: { select: { name: true, slug: true } },
    },
  },
  winningTeam: { select: { name: true } },
  stadium: { select: { name: true, city: true, country: true } },
  referee: { select: { name: true, country: true } },
  goals: {
    include: {
      player: { select: { name: true, slug: true } },
      team: { select: { name: true } },
    },
    orderBy: [{ minute: "asc" as const }, { stoppageMinute: "asc" as const }],
  },
  bookings: {
    include: {
      player: { select: { name: true, slug: true } },
      team: { select: { name: true } },
    },
    orderBy: [{ minute: "asc" as const }, { stoppageMinute: "asc" as const }],
  },
  substitutions: {
    include: {
      playerIn: { select: { name: true, slug: true } },
      playerOut: { select: { name: true, slug: true } },
      team: { select: { name: true } },
    },
    orderBy: [{ minute: "asc" as const }, { stoppageMinute: "asc" as const }],
  },
  penaltyKicks: {
    include: {
      player: { select: { name: true, slug: true } },
      team: { select: { name: true } },
    },
    // Source provides no kick order (ISSUE-008); source-id order is file order.
    orderBy: { sourceId: "asc" as const },
  },
};

/** Looks a match up by database id, slug, or source id (e.g. "M-1986-52"). */
export async function getMatchByIdOrSlug(
  idOrSlug: string,
): Promise<MatchDetailDto | null> {
  const match = await prisma.match.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }, { sourceId: idOrSlug }],
    },
    include: matchDetailInclude,
  });
  if (match === null) return null;

  return {
    ...toMatchCardDto(match),
    matchNumber: match.matchNumber,
    winnerName: match.winningTeam?.name ?? null,
    homeScorePenalties: match.homeScorePenalties,
    awayScorePenalties: match.awayScorePenalties,
    homeCountry:
      match.homeTeam.country !== null
        ? {
            name: match.homeTeam.country.name,
            slug: match.homeTeam.country.slug,
          }
        : null,
    awayCountry:
      match.awayTeam.country !== null
        ? {
            name: match.awayTeam.country.name,
            slug: match.awayTeam.country.slug,
          }
        : null,
    stadium:
      match.stadium !== null
        ? {
            name: match.stadium.name,
            city: match.stadium.city,
            country: match.stadium.country,
          }
        : null,
    referee:
      match.referee !== null
        ? { name: match.referee.name, country: match.referee.country }
        : null,
    attendance: match.attendance,
    goals: match.goals.map((goal) => ({
      playerName: goal.player.name,
      playerSlug: goal.player.slug,
      teamName: goal.team.name,
      minute: goal.minute,
      stoppageMinute: goal.stoppageMinute,
      isOwnGoal: goal.isOwnGoal,
      isPenalty: goal.isPenalty,
    })),
    bookings: match.bookings.map((booking) => ({
      playerName: booking.player.name,
      playerSlug: booking.player.slug,
      teamName: booking.team.name,
      cardType: booking.cardType,
      minute: booking.minute,
      stoppageMinute: booking.stoppageMinute,
    })),
    substitutions: match.substitutions.map((sub) => ({
      teamName: sub.team.name,
      playerInName: sub.playerIn?.name ?? null,
      playerInSlug: sub.playerIn?.slug ?? null,
      playerOutName: sub.playerOut?.name ?? null,
      playerOutSlug: sub.playerOut?.slug ?? null,
      minute: sub.minute,
      stoppageMinute: sub.stoppageMinute,
    })),
    penaltyKicks: match.penaltyKicks.map((kick) => ({
      playerName: kick.player?.name ?? null,
      playerSlug: kick.player?.slug ?? null,
      teamName: kick.team.name,
      type: kick.type,
      converted: kick.converted,
      order: kick.order,
      minute: kick.minute,
      stoppageMinute: kick.stoppageMinute,
      isSaved: kick.isSaved,
      isMissed: kick.isMissed,
    })),
  };
}

/**
 * The tournament's deciding "final" stage match (case-insensitive exact
 * match — "final round" group matches deliberately do not qualify).
 * Returns null for tournaments without one (e.g. 1950).
 */
export async function getFinalMatchForTournament(
  tournamentId: string,
): Promise<MatchCardDto | null> {
  const final = await prisma.match.findFirst({
    where: { tournamentId, stage: finalStageFilter },
    include: matchCardInclude,
    orderBy: { matchDate: "desc" },
  });
  return final === null ? null : toMatchCardDto(final);
}
