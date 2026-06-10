// Player queries for DB-backed pages (Checkpoints 4D/5E).
// Data honesty: SquadPlayer rows are squad selections, not match appearances
// — DTOs and labels use "selected tournaments"/"squads", never "appearances".
// No assists, caps, minutes played, or lineups are derived (not in source).

import { prisma } from "@/server/db/prisma";
import { matchLabel, toIso } from "./helpers";
import type {
  PlayerCardDto,
  PlayerProfileDto,
  PlayerSubstitutionDto,
} from "./types";

export async function getPlayerCount(): Promise<number> {
  return prisma.player.count();
}

export async function getPlayerCards(
  options: { take?: number; skip?: number; search?: string } = {},
): Promise<PlayerCardDto[]> {
  const { take = 50, skip = 0, search } = options;
  const players = await prisma.player.findMany({
    where:
      search !== undefined && search.trim() !== ""
        ? { name: { contains: search.trim(), mode: "insensitive" } }
        : undefined,
    include: {
      country: { select: { name: true, slug: true, flagEmoji: true } },
      _count: {
        select: {
          squadPlayers: true,
          goals: { where: { isOwnGoal: false } },
          bookings: true,
          awards: true,
        },
      },
    },
    orderBy: { name: "asc" },
    take,
    skip,
  });
  return players.map((player) => ({
    id: player.id,
    name: player.name,
    slug: player.slug,
    countryName: player.country?.name ?? null,
    countrySlug: player.country?.slug ?? null,
    countryFlagEmoji: player.country?.flagEmoji ?? null,
    position: player.position,
    selectedTournamentsCount: player._count.squadPlayers,
    goalsCount: player._count.goals,
    bookingsCount: player._count.bookings,
    awardsCount: player._count.awards,
  }));
}

const eventMatchSelect = {
  select: {
    slug: true,
    stage: true,
    matchDate: true,
    homeTeam: { select: { name: true } },
    awayTeam: { select: { name: true } },
    tournament: { select: { year: true } },
  },
} as const;

type EventMatch = {
  slug: string;
  stage: string;
  matchDate: Date | null;
  homeTeam: { name: string };
  awayTeam: { name: string };
  tournament: { year: number };
};

/** The other team in the match relative to `teamName`; null when ambiguous. */
function opponentOf(match: EventMatch, teamName: string): string | null {
  if (match.homeTeam.name === teamName) return match.awayTeam.name;
  if (match.awayTeam.name === teamName) return match.homeTeam.name;
  return null;
}

function eventContext(
  match: EventMatch,
  teamName: string,
  opponent: string | null,
) {
  return {
    matchSlug: match.slug,
    matchLabel: matchLabel(match),
    tournamentYear: match.tournament.year,
    stage: match.stage,
    matchDate: toIso(match.matchDate),
    teamName,
    opponent,
  };
}

export async function getPlayerProfile(
  slug: string,
): Promise<PlayerProfileDto | null> {
  const player = await prisma.player.findUnique({
    where: { slug },
    include: {
      country: { select: { name: true, slug: true, flagEmoji: true } },
      squadPlayers: {
        include: {
          tournament: { select: { year: true, slug: true } },
          team: { select: { name: true } },
        },
        orderBy: { tournament: { year: "asc" } },
      },
      goals: {
        include: { match: eventMatchSelect, team: { select: { name: true } } },
        orderBy: [{ match: { matchDate: "asc" } }, { minute: "asc" }],
      },
      bookings: {
        include: { match: eventMatchSelect, team: { select: { name: true } } },
        orderBy: [{ match: { matchDate: "asc" } }, { minute: "asc" }],
      },
      penaltyKicks: {
        include: { match: eventMatchSelect, team: { select: { name: true } } },
        orderBy: { sourceId: "asc" },
      },
      substitutionsIn: {
        include: { match: eventMatchSelect, team: { select: { name: true } } },
        orderBy: [{ match: { matchDate: "asc" } }, { minute: "asc" }],
      },
      substitutionsOut: {
        include: { match: eventMatchSelect, team: { select: { name: true } } },
        orderBy: [{ match: { matchDate: "asc" } }, { minute: "asc" }],
      },
      awards: {
        include: {
          tournament: { select: { year: true, slug: true } },
          team: { select: { name: true } },
        },
        orderBy: { tournament: { year: "asc" } },
      },
    },
  });
  if (player === null) return null;

  const goals = player.goals.map((goal) => ({
    // For own goals the credited team is the opposition, so an "opponent"
    // relative to the scorer is ambiguous — returned as null.
    ...eventContext(
      goal.match,
      goal.team.name,
      goal.isOwnGoal ? null : opponentOf(goal.match, goal.team.name),
    ),
    minute: goal.minute,
    stoppageMinute: goal.stoppageMinute,
    isOwnGoal: goal.isOwnGoal,
    isPenalty: goal.isPenalty,
  }));

  const substitutions: PlayerSubstitutionDto[] = [
    ...player.substitutionsIn.map((sub) => ({
      ...eventContext(
        sub.match,
        sub.team.name,
        opponentOf(sub.match, sub.team.name),
      ),
      direction: "IN" as const,
      minute: sub.minute,
      stoppageMinute: sub.stoppageMinute,
    })),
    ...player.substitutionsOut.map((sub) => ({
      ...eventContext(
        sub.match,
        sub.team.name,
        opponentOf(sub.match, sub.team.name),
      ),
      direction: "OUT" as const,
      minute: sub.minute,
      stoppageMinute: sub.stoppageMinute,
    })),
  ].sort(
    (a, b) =>
      a.tournamentYear - b.tournamentYear ||
      (a.matchDate ?? "").localeCompare(b.matchDate ?? "") ||
      (a.minute ?? 0) - (b.minute ?? 0),
  );

  return {
    id: player.id,
    name: player.name,
    slug: player.slug,
    position: player.position,
    dateOfBirth: toIso(player.dateOfBirth),
    country:
      player.country !== null
        ? {
            name: player.country.name,
            slug: player.country.slug,
            flagEmoji: player.country.flagEmoji,
          }
        : null,
    squadTournaments: player.squadPlayers.map((entry) => ({
      tournamentYear: entry.tournament.year,
      tournamentSlug: entry.tournament.slug,
      teamName: entry.team.name,
      shirtNumber: entry.shirtNumber,
      position: entry.position,
      isCaptain: entry.isCaptain,
    })),
    goals,
    bookings: player.bookings.map((booking) => ({
      ...eventContext(
        booking.match,
        booking.team.name,
        opponentOf(booking.match, booking.team.name),
      ),
      cardType: booking.cardType,
      minute: booking.minute,
      stoppageMinute: booking.stoppageMinute,
    })),
    penaltyKicks: player.penaltyKicks.map((kick) => ({
      ...eventContext(
        kick.match,
        kick.team.name,
        opponentOf(kick.match, kick.team.name),
      ),
      type: kick.type,
      converted: kick.converted,
      order: kick.order,
      minute: kick.minute,
      stoppageMinute: kick.stoppageMinute,
      isSaved: kick.isSaved,
      isMissed: kick.isMissed,
    })),
    substitutions,
    awards: player.awards.map((award) => ({
      name: award.name,
      tournamentYear: award.tournament.year,
      tournamentSlug: award.tournament.slug,
      teamName: award.team?.name ?? null,
      description: award.description,
    })),
    totals: {
      selectedTournaments: player.squadPlayers.length,
      goals: goals.filter((goal) => !goal.isOwnGoal).length,
      ownGoals: goals.filter((goal) => goal.isOwnGoal).length,
      penaltyKicksTotal: player.penaltyKicks.length,
      penaltyKicksConverted: player.penaltyKicks.filter(
        (kick) => kick.converted,
      ).length,
      bookings: player.bookings.length,
      substitutionsIn: player.substitutionsIn.length,
      substitutionsOut: player.substitutionsOut.length,
      awards: player.awards.length,
    },
  };
}
