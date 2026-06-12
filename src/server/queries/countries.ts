// Country queries for DB-backed pages (Checkpoints 4D/5D).
// Notes:
// - SquadPlayer rows are squad selections, not match appearances — nothing
//   here is labeled "appearances".
// - Titles come from Tournament.winnerTeamId (resolved from the source's
//   winner column), so titles without a single final match (1950) count.
// - Win/draw/loss comes from the match winner field; shootout wins count as
//   wins, matching the source's result column. Nothing infers stage reached.

import { prisma } from "@/server/db/prisma";
import { FINAL_STAGE, matchCardInclude, toMatchCardDto } from "./helpers";
import type {
  CountryCardDto,
  CountryFilterOptions,
  CountryMatchDto,
  CountryProfileDto,
  TopScorerDto,
} from "./types";

export async function getCountryCards(): Promise<CountryCardDto[]> {
  const [countries, teams, matches, goalsByTeam, tournaments] =
    await Promise.all([
      prisma.country.findMany({
        include: { _count: { select: { teams: true, players: true } } },
        orderBy: { name: "asc" },
      }),
      prisma.team.findMany({ select: { id: true, countryId: true } }),
      prisma.match.findMany({ select: { homeTeamId: true, awayTeamId: true } }),
      prisma.goal.groupBy({ by: ["teamId"], _count: { _all: true } }),
      prisma.tournament.findMany({ select: { winnerTeamId: true } }),
    ]);

  const countryIdByTeamId = new Map(
    teams.map((team) => [team.id, team.countryId]),
  );

  const matchesByCountry = new Map<string, number>();
  for (const match of matches) {
    // A team never plays a team of the same country, so this counts each
    // match at most once per country.
    for (const teamId of [match.homeTeamId, match.awayTeamId]) {
      const countryId = countryIdByTeamId.get(teamId) ?? null;
      if (countryId !== null) {
        matchesByCountry.set(
          countryId,
          (matchesByCountry.get(countryId) ?? 0) + 1,
        );
      }
    }
  }

  const goalsByCountry = new Map<string, number>();
  for (const group of goalsByTeam) {
    const countryId = countryIdByTeamId.get(group.teamId) ?? null;
    if (countryId !== null) {
      goalsByCountry.set(
        countryId,
        (goalsByCountry.get(countryId) ?? 0) + group._count._all,
      );
    }
  }

  const titlesByCountry = new Map<string, number>();
  for (const tournament of tournaments) {
    const countryId =
      tournament.winnerTeamId !== null
        ? (countryIdByTeamId.get(tournament.winnerTeamId) ?? null)
        : null;
    if (countryId !== null) {
      titlesByCountry.set(countryId, (titlesByCountry.get(countryId) ?? 0) + 1);
    }
  }

  return countries.map((country) => ({
    id: country.id,
    name: country.name,
    slug: country.slug,
    code: country.code,
    flagEmoji: country.flagEmoji,
    tournamentsEntered: country._count.teams,
    playersCount: country._count.players,
    matchesCount: matchesByCountry.get(country.id) ?? 0,
    goalsFor: goalsByCountry.get(country.id) ?? 0,
    titlesCount: titlesByCountry.get(country.id) ?? 0,
  }));
}

/**
 * Filtered + sorted country cards for the /countries index. The archive
 * holds under a hundred nations, so filtering happens in memory over the
 * same aggregates the unfiltered page renders. Title counts come from
 * Tournament.winnerTeamId (source-resolved) — safe to filter on.
 */
export async function getCountryIndex(options: CountryFilterOptions = {}): Promise<{
  countries: CountryCardDto[];
  total: number;
  filteredTotal: number;
}> {
  const all = await getCountryCards();

  const q = options.q?.trim().toLowerCase();
  let filtered = all.filter((country) => {
    const titles = country.titlesCount ?? 0;
    if (options.hasTitles === true && titles === 0) return false;
    if (options.hasTitles === false && titles > 0) return false;
    if (
      options.minTournaments !== undefined &&
      (country.tournamentsEntered ?? 0) < options.minTournaments
    ) {
      return false;
    }
    if (q !== undefined && q !== "") {
      const haystack = `${country.name} ${country.code ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const sort = options.sort ?? "name";
  filtered = [...filtered].sort((a, b) => {
    switch (sort) {
      case "most-tournaments":
        return (
          (b.tournamentsEntered ?? 0) - (a.tournamentsEntered ?? 0) ||
          a.name.localeCompare(b.name)
        );
      case "most-matches":
        return (
          (b.matchesCount ?? 0) - (a.matchesCount ?? 0) ||
          a.name.localeCompare(b.name)
        );
      case "most-goals":
        return (
          (b.goalsFor ?? 0) - (a.goalsFor ?? 0) || a.name.localeCompare(b.name)
        );
      case "most-titles":
        return (
          (b.titlesCount ?? 0) - (a.titlesCount ?? 0) ||
          a.name.localeCompare(b.name)
        );
      case "name":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return { countries: filtered, total: all.length, filteredTotal: filtered.length };
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
    select: {
      id: true,
      name: true,
      slug: true,
      country: { select: { name: true } },
    },
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
        countryName: player.country?.name ?? null,
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
          tournament: {
            select: {
              year: true,
              slug: true,
              name: true,
              winnerTeamId: true,
              runnerUpTeamId: true,
            },
          },
        },
        orderBy: { tournament: { year: "asc" } },
      },
    },
  });
  if (country === null) return null;

  const teamIds = country.teams.map((team) => team.id);
  const teamIdSet = new Set(teamIds);
  const matchInvolvingCountry = {
    OR: [{ homeTeamId: { in: teamIds } }, { awayTeamId: { in: teamIds } }],
  };

  const [rawMatches, goalsFor, goalsAgainst, topScorers, squadLeaders] =
    await Promise.all([
      teamIds.length > 0
        ? prisma.match.findMany({
            where: matchInvolvingCountry,
            include: matchCardInclude,
            orderBy: [{ matchDate: "desc" }, { matchNumber: "desc" }],
          })
        : [],
      teamIds.length > 0
        ? prisma.goal.count({ where: { teamId: { in: teamIds } } })
        : 0,
      teamIds.length > 0
        ? prisma.goal.count({
            where: { match: matchInvolvingCountry, teamId: { notIn: teamIds } },
          })
        : 0,
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

  const matches: CountryMatchDto[] = rawMatches.map((match) => {
    const isHome = teamIdSet.has(match.homeTeamId);
    return {
      ...toMatchCardDto(match),
      opponent: isHome ? match.awayTeam.name : match.homeTeam.name,
      result:
        match.winningTeamId === null
          ? "D"
          : teamIdSet.has(match.winningTeamId)
            ? "W"
            : "L",
    };
  });

  const finals = matches.filter(
    (match) => match.stage.toLowerCase() === FINAL_STAGE,
  );
  const wins = matches.filter((match) => match.result === "W").length;
  const draws = matches.filter((match) => match.result === "D").length;
  const titles = country.teams.filter(
    (team) => team.tournament.winnerTeamId === team.id,
  ).length;

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
    flagEmoji: country.flagEmoji,
    participations: country.teams.map((team) => ({
      tournamentYear: team.tournament.year,
      tournamentSlug: team.tournament.slug,
      tournamentName: team.tournament.name,
      teamId: team.id,
      result:
        team.tournament.winnerTeamId === team.id
          ? "Champions"
          : team.tournament.runnerUpTeamId === team.id
            ? "Runners-up"
            : null,
    })),
    totals: {
      tournamentsEntered: teamIds.length,
      titles,
      finalsPlayed: finals.length,
      finalsWon: finals.filter((final) => final.result === "W").length,
      matchesPlayed: matches.length,
      wins,
      draws,
      losses: matches.length - wins - draws,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst,
    },
    matches,
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
    finals,
  };
}
