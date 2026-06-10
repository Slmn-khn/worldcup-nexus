// Records / leaderboard queries (Checkpoint 4D).
// Every leaderboard is computed from imported data only and labeled with
// exactly what the data supports. There are deliberately NO "appearances"
// records — match appearance data is not imported (squads are selections,
// not appearances).

import { prisma } from "@/server/db/prisma";
import { formatScore } from "./helpers";
import type { RecordItemDto, RecordLeaderboardDto } from "./types";

const SCOPE_NOTE =
  "Across all imported tournaments (men's and women's editions, 1930–2022).";

async function playerItems(
  grouped: { playerId: string; count: number }[],
): Promise<RecordItemDto[]> {
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
  return grouped.flatMap((g, index) => {
    const player = byId.get(g.playerId);
    if (player === undefined) return [];
    return [
      {
        rank: index + 1,
        label: player.name,
        slug: player.slug,
        value: g.count,
        detail: player.country?.name ?? null,
      },
    ];
  });
}

async function topGoalScorers(take: number): Promise<RecordLeaderboardDto> {
  const grouped = await prisma.goal.groupBy({
    by: ["playerId"],
    where: { isOwnGoal: false },
    _count: { _all: true },
    orderBy: { _count: { playerId: "desc" } },
    take,
  });
  return {
    key: "top-goal-scorers",
    title: "Most goals",
    description: `Goals scored, excluding own goals. ${SCOPE_NOTE}`,
    items: await playerItems(
      grouped.map((g) => ({ playerId: g.playerId, count: g._count._all })),
    ),
  };
}

async function mostGoalsByCountry(take: number): Promise<RecordLeaderboardDto> {
  const grouped = await prisma.goal.groupBy({
    by: ["teamId"],
    _count: { _all: true },
  });
  const teams = await prisma.team.findMany({
    where: { id: { in: grouped.map((g) => g.teamId) } },
    select: {
      id: true,
      country: { select: { id: true, name: true, slug: true } },
    },
  });
  const teamById = new Map(teams.map((t) => [t.id, t]));

  const byCountry = new Map<
    string,
    { name: string; slug: string; goals: number }
  >();
  for (const group of grouped) {
    const country = teamById.get(group.teamId)?.country;
    if (country === undefined || country === null) continue;
    const entry = byCountry.get(country.id) ?? {
      name: country.name,
      slug: country.slug,
      goals: 0,
    };
    entry.goals += group._count._all;
    byCountry.set(country.id, entry);
  }
  const items = [...byCountry.values()]
    .sort((a, b) => b.goals - a.goals)
    .slice(0, take)
    .map((entry, index) => ({
      rank: index + 1,
      label: entry.name,
      slug: entry.slug,
      value: entry.goals,
      detail: null,
    }));
  return {
    key: "most-goals-by-country",
    title: "Most goals by a nation",
    description: `Goals credited to the nation's teams (own goals count for the credited team). ${SCOPE_NOTE}`,
    items,
  };
}

async function mostShootoutConversions(
  take: number,
): Promise<RecordLeaderboardDto> {
  const grouped = await prisma.penaltyKick.groupBy({
    by: ["playerId"],
    where: { converted: true, type: "SHOOTOUT", playerId: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { playerId: "desc" } },
    take,
  });
  return {
    key: "most-shootout-conversions",
    title: "Most shootout penalties converted",
    description: `Converted kicks in penalty shootouts only — in-match penalties are counted as goals. ${SCOPE_NOTE}`,
    items: await playerItems(
      grouped.flatMap((g) =>
        g.playerId === null
          ? []
          : [{ playerId: g.playerId, count: g._count._all }],
      ),
    ),
  };
}

async function mostBookings(take: number): Promise<RecordLeaderboardDto> {
  const grouped = await prisma.booking.groupBy({
    by: ["playerId"],
    _count: { _all: true },
    orderBy: { _count: { playerId: "desc" } },
    take,
  });
  return {
    key: "most-bookings",
    title: "Most cards received",
    description: `Yellow, second yellow, and red cards combined. ${SCOPE_NOTE}`,
    items: await playerItems(
      grouped.map((g) => ({ playerId: g.playerId, count: g._count._all })),
    ),
  };
}

async function highestScoringMatches(
  take: number,
): Promise<RecordLeaderboardDto> {
  const matches = await prisma.match.findMany({
    select: {
      slug: true,
      homeScore: true,
      awayScore: true,
      stage: true,
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
      tournament: { select: { year: true } },
    },
  });
  const items = matches
    .map((match) => ({ match, total: match.homeScore + match.awayScore }))
    .sort((a, b) => b.total - a.total)
    .slice(0, take)
    .map(({ match, total }, index) => ({
      rank: index + 1,
      label: `${match.homeTeam.name} ${formatScore(match.homeScore, match.awayScore)} ${match.awayTeam.name}`,
      slug: match.slug,
      value: total,
      detail: `${match.tournament.year}, ${match.stage}`,
    }));
  return {
    key: "highest-scoring-matches",
    title: "Highest-scoring matches",
    description: `Total goals in a single match. ${SCOPE_NOTE}`,
    items,
  };
}

async function highestScoringTournaments(
  take: number,
): Promise<RecordLeaderboardDto> {
  const tournaments = await prisma.tournament.findMany({
    where: { goalsCount: { not: null } },
    orderBy: { goalsCount: "desc" },
    take,
    select: {
      name: true,
      slug: true,
      year: true,
      goalsCount: true,
      matchesCount: true,
    },
  });
  return {
    key: "highest-scoring-tournaments",
    title: "Highest-scoring tournaments",
    description: `Total goals per tournament, counted from imported goal events. ${SCOPE_NOTE}`,
    items: tournaments.map((t, index) => ({
      rank: index + 1,
      label: t.name,
      slug: t.slug,
      value: t.goalsCount ?? 0,
      detail: t.matchesCount !== null ? `${t.matchesCount} matches` : null,
    })),
  };
}

export async function getRecordsOverview(): Promise<RecordLeaderboardDto[]> {
  return Promise.all([
    topGoalScorers(10),
    mostGoalsByCountry(10),
    mostShootoutConversions(10),
    mostBookings(10),
    highestScoringMatches(10),
    highestScoringTournaments(10),
  ]);
}
