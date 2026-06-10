// Match queries for DB-backed pages (Checkpoint 4D).

import { prisma } from "@/server/db/prisma";
import { finalStageFilter, matchCardInclude, toMatchCardDto } from "./helpers";
import type { MatchCardDto, MatchDetailDto } from "./types";

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
