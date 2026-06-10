// Player queries for DB-backed pages (Checkpoint 4D).
// SquadPlayer rows are squad selections, not match appearances — DTOs use
// "squad tournaments" wording, never "appearances".

import { prisma } from "@/server/db/prisma";
import { matchLabel, toIso } from "./helpers";
import type { PlayerCardDto, PlayerProfileDto } from "./types";

export async function getPlayerCards(
  options: { take?: number; skip?: number; search?: string } = {},
): Promise<PlayerCardDto[]> {
  const { take = 50, skip = 0, search } = options;
  const players = await prisma.player.findMany({
    where:
      search !== undefined && search.trim() !== ""
        ? { name: { contains: search.trim(), mode: "insensitive" } }
        : undefined,
    include: { country: { select: { name: true, slug: true } } },
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
    position: player.position,
  }));
}

const eventMatchSelect = {
  select: {
    slug: true,
    homeTeam: { select: { name: true } },
    awayTeam: { select: { name: true } },
    tournament: { select: { year: true } },
  },
} as const;

export async function getPlayerProfile(
  slug: string,
): Promise<PlayerProfileDto | null> {
  const player = await prisma.player.findUnique({
    where: { slug },
    include: {
      country: { select: { name: true, slug: true } },
      squadPlayers: {
        include: {
          tournament: { select: { year: true, slug: true } },
          team: { select: { name: true } },
        },
        orderBy: { tournament: { year: "asc" } },
      },
      goals: {
        include: { match: eventMatchSelect },
        orderBy: [{ match: { matchDate: "asc" } }, { minute: "asc" }],
      },
      bookings: {
        include: { match: eventMatchSelect },
        orderBy: [{ match: { matchDate: "asc" } }, { minute: "asc" }],
      },
      penaltyKicks: {
        include: { match: eventMatchSelect },
        orderBy: { sourceId: "asc" },
      },
      awards: {
        include: { tournament: { select: { year: true, slug: true } } },
        orderBy: { tournament: { year: "asc" } },
      },
      _count: { select: { substitutionsIn: true, substitutionsOut: true } },
    },
  });
  if (player === null) return null;

  const goals = player.goals.map((goal) => ({
    matchSlug: goal.match.slug,
    matchLabel: matchLabel(goal.match),
    tournamentYear: goal.match.tournament.year,
    minute: goal.minute,
    stoppageMinute: goal.stoppageMinute,
    isOwnGoal: goal.isOwnGoal,
    isPenalty: goal.isPenalty,
  }));
  const shootoutKicks = player.penaltyKicks.filter(
    (kick) => kick.type === "SHOOTOUT",
  );

  return {
    id: player.id,
    name: player.name,
    slug: player.slug,
    position: player.position,
    dateOfBirth: toIso(player.dateOfBirth),
    country:
      player.country !== null
        ? { name: player.country.name, slug: player.country.slug }
        : null,
    squadTournaments: player.squadPlayers.map((entry) => ({
      tournamentYear: entry.tournament.year,
      tournamentSlug: entry.tournament.slug,
      teamName: entry.team.name,
      shirtNumber: entry.shirtNumber,
      position: entry.position,
    })),
    goals,
    bookings: player.bookings.map((booking) => ({
      matchSlug: booking.match.slug,
      matchLabel: matchLabel(booking.match),
      tournamentYear: booking.match.tournament.year,
      cardType: booking.cardType,
      minute: booking.minute,
    })),
    penaltyKicks: player.penaltyKicks.map((kick) => ({
      matchSlug: kick.match.slug,
      matchLabel: matchLabel(kick.match),
      tournamentYear: kick.match.tournament.year,
      type: kick.type,
      converted: kick.converted,
    })),
    awards: player.awards.map((award) => ({
      name: award.name,
      tournamentYear: award.tournament.year,
      tournamentSlug: award.tournament.slug,
    })),
    totals: {
      goals: goals.filter((goal) => !goal.isOwnGoal).length,
      ownGoals: goals.filter((goal) => goal.isOwnGoal).length,
      bookings: player.bookings.length,
      substitutionsIn: player._count.substitutionsIn,
      substitutionsOut: player._count.substitutionsOut,
      shootoutPenaltiesTaken: shootoutKicks.length,
      shootoutPenaltiesConverted: shootoutKicks.filter((kick) => kick.converted)
        .length,
      awards: player.awards.length,
    },
  };
}
