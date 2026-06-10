// Tournament queries for DB-backed pages (Checkpoint 4D).

import { prisma } from "@/server/db/prisma";
import {
  finalStageFilter,
  formatFinalScore,
  matchCardInclude,
  toIso,
  toMatchCardDto,
} from "./helpers";
import type {
  TopScorerDto,
  TournamentCardDto,
  TournamentDetailDto,
  MatchCardDto,
} from "./types";

/** Resolves team names for the scalar winner/runner-up ids on tournaments. */
async function teamNamesByIds(
  ids: (string | null)[],
): Promise<Map<string, string>> {
  const wanted = ids.filter((id): id is string => id !== null);
  if (wanted.length === 0) return new Map();
  const teams = await prisma.team.findMany({
    where: { id: { in: wanted } },
    select: { id: true, name: true },
  });
  return new Map(teams.map((team) => [team.id, team.name]));
}

/** Final-match display score per tournament id (tournaments without a "final" stage are absent). */
async function finalScoreByTournamentId(): Promise<Map<string, string>> {
  const finals = await prisma.match.findMany({
    where: { stage: finalStageFilter },
    select: {
      tournamentId: true,
      homeScore: true,
      awayScore: true,
      homeScorePenalties: true,
      awayScorePenalties: true,
      decidedByPenalties: true,
    },
  });
  return new Map(
    finals.map((final) => [final.tournamentId, formatFinalScore(final)]),
  );
}

export async function getTournamentCards(): Promise<TournamentCardDto[]> {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { year: "desc" },
  });
  const names = await teamNamesByIds(
    tournaments.flatMap((t) => [t.winnerTeamId, t.runnerUpTeamId]),
  );
  const finalScores = await finalScoreByTournamentId();

  return tournaments.map((t) => ({
    id: t.id,
    year: t.year,
    name: t.name,
    slug: t.slug,
    hostName: t.hostName,
    teamsCount: t.teamsCount,
    matchesCount: t.matchesCount,
    goalsCount: t.goalsCount,
    winner:
      t.winnerTeamId !== null ? (names.get(t.winnerTeamId) ?? null) : null,
    runnerUp:
      t.runnerUpTeamId !== null ? (names.get(t.runnerUpTeamId) ?? null) : null,
    finalScore: finalScores.get(t.id) ?? null,
  }));
}

async function topScorersForTournament(
  tournamentId: string,
  take: number,
): Promise<TopScorerDto[]> {
  const grouped = await prisma.goal.groupBy({
    by: ["playerId"],
    where: { match: { tournamentId }, isOwnGoal: false },
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

export async function getTournamentByYear(
  year: number,
): Promise<TournamentDetailDto | null> {
  const tournament = await prisma.tournament.findUnique({
    where: { year },
    include: {
      teams: {
        select: { id: true, name: true, slug: true, code: true },
        orderBy: { name: "asc" },
      },
    },
  });
  if (tournament === null) return null;

  const [
    matches,
    topScorers,
    awards,
    penaltyShootouts,
    bookings,
    substitutions,
    names,
    finalScores,
  ] = await Promise.all([
    prisma.match.findMany({
      where: { tournamentId: tournament.id },
      include: matchCardInclude,
      orderBy: [{ matchDate: "asc" }, { matchNumber: "asc" }],
    }),
    topScorersForTournament(tournament.id, 5),
    prisma.award.findMany({
      where: { tournamentId: tournament.id },
      include: {
        player: { select: { name: true, slug: true } },
        team: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.match.count({
      where: { tournamentId: tournament.id, decidedByPenalties: true },
    }),
    prisma.booking.count({ where: { match: { tournamentId: tournament.id } } }),
    prisma.substitution.count({
      where: { match: { tournamentId: tournament.id } },
    }),
    teamNamesByIds([tournament.winnerTeamId, tournament.runnerUpTeamId]),
    finalScoreByTournamentId(),
  ]);

  return {
    id: tournament.id,
    year: tournament.year,
    name: tournament.name,
    slug: tournament.slug,
    hostName: tournament.hostName,
    teamsCount: tournament.teamsCount,
    matchesCount: tournament.matchesCount,
    goalsCount: tournament.goalsCount,
    winner:
      tournament.winnerTeamId !== null
        ? (names.get(tournament.winnerTeamId) ?? null)
        : null,
    runnerUp:
      tournament.runnerUpTeamId !== null
        ? (names.get(tournament.runnerUpTeamId) ?? null)
        : null,
    finalScore: finalScores.get(tournament.id) ?? null,
    startDate: toIso(tournament.startDate),
    endDate: toIso(tournament.endDate),
    teams: tournament.teams,
    matches: matches.map(toMatchCardDto),
    topScorers,
    awards: awards.map((award) => ({
      name: award.name,
      playerName: award.player?.name ?? null,
      playerSlug: award.player?.slug ?? null,
      teamName: award.team?.name ?? null,
    })),
    stats: { penaltyShootouts, bookings, substitutions },
  };
}

export async function getTournamentMatches(
  year: number,
): Promise<MatchCardDto[]> {
  const matches = await prisma.match.findMany({
    where: { tournament: { year } },
    include: matchCardInclude,
    orderBy: [{ matchDate: "asc" }, { matchNumber: "asc" }],
  });
  return matches.map(toMatchCardDto);
}
