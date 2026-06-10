// Country queries for DB-backed pages (Checkpoint 4D).
// Note: SquadPlayer rows are squad selections, not match appearances —
// nothing here is labeled "appearances".

import { prisma } from "@/server/db/prisma";
import { finalStageFilter, matchCardInclude, toMatchCardDto } from "./helpers";
import type { CountryCardDto, CountryProfileDto, TopScorerDto } from "./types";

export async function getCountryCards(): Promise<CountryCardDto[]> {
  const countries = await prisma.country.findMany({
    include: { _count: { select: { teams: true, players: true } } },
    orderBy: { name: "asc" },
  });
  return countries.map((country) => ({
    id: country.id,
    name: country.name,
    slug: country.slug,
    code: country.code,
    tournamentsEntered: country._count.teams,
    playersCount: country._count.players,
  }));
}

async function topScorersForTeams(
  teamIds: string[],
  take: number,
): Promise<TopScorerDto[]> {
  if (teamIds.length === 0) return [];
  const grouped = await prisma.goal.groupBy({
    by: ["playerId"],
    where: { teamId: { in: teamIds }, isOwnGoal: false },
    _count: { _all: true },
    orderBy: { _count: { playerId: "desc" } },
    take,
  });
  const players = await prisma.player.findMany({
    where: { id: { in: grouped.map((g) => g.playerId) } },
    select: { id: true, name: true, slug: true },
  });
  const byId = new Map(players.map((p) => [p.id, p]));
  return grouped.flatMap((g) => {
    const player = byId.get(g.playerId);
    if (player === undefined) return [];
    return [
      {
        playerId: player.id,
        name: player.name,
        slug: player.slug,
        goals: g._count._all,
      },
    ];
  });
}

export async function getCountryProfile(
  slug: string,
): Promise<CountryProfileDto | null> {
  const country = await prisma.country.findUnique({
    where: { slug },
    include: {
      teams: {
        include: {
          tournament: { select: { year: true, slug: true, name: true } },
        },
        orderBy: { tournament: { year: "asc" } },
      },
    },
  });
  if (country === null) return null;

  const teamIds = country.teams.map((team) => team.id);
  const matchInvolvingCountry = {
    OR: [{ homeTeamId: { in: teamIds } }, { awayTeamId: { in: teamIds } }],
  };

  const [
    matchesPlayed,
    goalsFor,
    goalsAgainst,
    finals,
    topScorers,
    squadLeaders,
  ] = await Promise.all([
    teamIds.length > 0
      ? prisma.match.count({ where: matchInvolvingCountry })
      : 0,
    teamIds.length > 0
      ? prisma.goal.count({ where: { teamId: { in: teamIds } } })
      : 0,
    teamIds.length > 0
      ? prisma.goal.count({
          where: { match: matchInvolvingCountry, teamId: { notIn: teamIds } },
        })
      : 0,
    teamIds.length > 0
      ? prisma.match.findMany({
          where: { ...matchInvolvingCountry, stage: finalStageFilter },
          include: matchCardInclude,
          orderBy: { matchDate: "asc" },
        })
      : [],
    topScorersForTeams(teamIds, 5),
    teamIds.length > 0
      ? prisma.squadPlayer.groupBy({
          by: ["playerId"],
          where: { teamId: { in: teamIds } },
          _count: { _all: true },
          orderBy: { _count: { playerId: "desc" } },
          take: 5,
        })
      : [],
  ]);

  const squadLeaderPlayers = await prisma.player.findMany({
    where: { id: { in: squadLeaders.map((leader) => leader.playerId) } },
    select: { id: true, name: true, slug: true },
  });
  const squadLeaderById = new Map(squadLeaderPlayers.map((p) => [p.id, p]));

  return {
    id: country.id,
    name: country.name,
    slug: country.slug,
    code: country.code,
    participations: country.teams.map((team) => ({
      tournamentYear: team.tournament.year,
      tournamentSlug: team.tournament.slug,
      tournamentName: team.tournament.name,
      teamId: team.id,
    })),
    totals: {
      tournamentsEntered: teamIds.length,
      matchesPlayed,
      goalsFor,
      goalsAgainst,
      finalsPlayed: finals.length,
    },
    topScorers,
    mostSquadTournaments: squadLeaders.flatMap((leader) => {
      const player = squadLeaderById.get(leader.playerId);
      if (player === undefined) return [];
      return [
        {
          playerId: player.id,
          name: player.name,
          slug: player.slug,
          squadTournaments: leader._count._all,
        },
      ];
    }),
    finals: finals.map(toMatchCardDto),
  };
}
