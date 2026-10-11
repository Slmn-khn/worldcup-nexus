// Archive-hub query layer for canonical tournaments with group-labelled
// matches (2026 today; any future edition imported the same way). Reads ONLY
// the canonical tables — the quarantined WorldCup2026* copy is never touched
// here. Server-only. Every DTO is built from imported rows; nothing about
// champions, awards or totals is hard-coded.

import { cache } from "react";

import { prisma } from "@/server/db/prisma";
import { foldDiacritics } from "@/server/search/indexing";
import { getCountryDirectory, resolveHostCountries, type HostCountryRef } from "./hostCountries";
import {
  buildBracket,
  computeArchiveGroups,
  type ArchiveBracket,
  type ArchiveGroup,
} from "./tournamentArchiveModel";
import type { ArchiveMatchDto, ArchiveTeamRef } from "./tournamentArchiveTypes";

export type { ArchiveMatchDto, ArchiveTeamRef } from "./tournamentArchiveTypes";
export type { ArchiveBracket, ArchiveGroup } from "./tournamentArchiveModel";

export type ArchiveAwardDto = {
  id: string;
  name: string;
  officialName: string | null;
  rank: number | null;
  player: { name: string; slug: string } | null;
  team: ArchiveTeamRef | null;
  details: { goals?: number; assists?: number; minutes?: number; shirtNumber?: number };
  sourceUrl: string | null;
  verified: boolean;
};

export type ArchiveLeader = { player: { name: string; slug: string }; team: ArchiveTeamRef | null; value: number; secondary: number };

export type ArchiveVenueDto = { id: string; name: string; city: string | null; country: string | null; capacity: number | null; matches: number };

export type ArchiveSquadPlayerDto = { name: string; slug: string; position: string | null; team: ArchiveTeamRef };

export type TournamentArchive = {
  year: number;
  name: string;
  hosts: string[];
  /** Hosts resolved against the Country table (drives the hero host map). */
  hostCountries: HostCountryRef[];
  startDate: string | null;
  endDate: string | null;
  attendance: number | null;
  sourceUrl: string | null;
  verificationStatus: string | null;
  lastUpdated: string;
  counts: { teams: number; matches: number; goals: number; venues: number; players: number };
  podium: { champion: ArchiveTeamRef | null; runnerUp: ArchiveTeamRef | null; third: ArchiveTeamRef | null; fourth: ArchiveTeamRef | null };
  finalMatch: ArchiveMatchDto | null;
  matches: ArchiveMatchDto[];
  groups: ArchiveGroup[];
  bracket: ArchiveBracket;
  teams: (ArchiveTeamRef & { groupLetter: string | null })[];
  venues: ArchiveVenueDto[];
  awards: ArchiveAwardDto[];
  topScorers: ArchiveLeader[];
  topAssists: ArchiveLeader[];
  /** Coverage flags so pages can say "not recorded" instead of showing 0. */
  coverage: { bookings: number; substitutions: number; shootoutKicks: number; incompleteOutcomes: number };
};

/** True when the canonical tournament has group-labelled matches (hub layout). */
export async function hasTournamentArchiveHub(year: number): Promise<boolean> {
  const count = await prisma.match
    .count({ where: { tournament: { year }, groupName: { not: null } } })
    .catch(() => 0);
  return count > 0;
}

function isoDay(date: Date | null): string | null {
  return date === null ? null : date.toISOString().slice(0, 10);
}

const teamSelect = {
  id: true,
  name: true,
  slug: true,
  code: true,
  country: { select: { slug: true } },
} as const;

type TeamRow = { id: string; name: string; slug: string; code: string | null; country: { slug: string } | null };

function teamRef(team: TeamRow): ArchiveTeamRef {
  return { id: team.id, name: team.name, slug: team.slug, code: team.code, countrySlug: team.country?.slug ?? null };
}

export const getTournamentArchive = cache(async (year: number): Promise<TournamentArchive | null> => {
  const tournament = await prisma.tournament.findUnique({ where: { year } });
  if (tournament === null) return null;

  const [matchRows, teams, awards, goals, squadCount, bookings, substitutions, shootoutKicks] = await Promise.all([
    prisma.match.findMany({
      where: { tournamentId: tournament.id },
      include: {
        homeTeam: { select: teamSelect },
        awayTeam: { select: teamSelect },
        stadium: { select: { id: true, name: true, city: true, country: true, capacity: true } },
      },
      orderBy: [{ matchDate: "asc" }, { matchNumber: "asc" }],
    }),
    prisma.team.findMany({ where: { tournamentId: tournament.id }, select: teamSelect, orderBy: { name: "asc" } }),
    prisma.award.findMany({
      where: { tournamentId: tournament.id },
      include: { player: { select: { name: true, slug: true } }, team: { select: teamSelect } },
      orderBy: [{ rank: "asc" }, { name: "asc" }],
    }),
    prisma.goal.findMany({
      where: { match: { tournamentId: tournament.id } },
      select: {
        isOwnGoal: true,
        teamId: true,
        player: { select: { id: true, name: true, slug: true } },
        assistPlayer: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.squadPlayer.count({ where: { tournamentId: tournament.id } }),
    prisma.booking.count({ where: { match: { tournamentId: tournament.id } } }),
    prisma.substitution.count({ where: { match: { tournamentId: tournament.id } } }),
    prisma.penaltyKick.count({ where: { match: { tournamentId: tournament.id }, type: "SHOOTOUT" } }),
  ]);

  const matches: ArchiveMatchDto[] = matchRows.map((m) => ({
    id: m.id,
    slug: m.slug,
    matchNumber: m.matchNumber,
    date: isoDay(m.matchDate),
    kickoffUtc: m.matchDate?.toISOString() ?? null,
    stage: m.stage,
    groupName: m.groupName,
    venueName: m.stadium?.name ?? null,
    cityName: m.stadium?.city ?? null,
    homeTeam: teamRef(m.homeTeam),
    awayTeam: teamRef(m.awayTeam),
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    homeScorePenalties: m.homeScorePenalties,
    awayScorePenalties: m.awayScorePenalties,
    decidedByPenalties: m.decidedByPenalties,
    extraTime: m.extraTime,
    winnerSide: m.winningTeamId === null ? null : m.winningTeamId === m.homeTeamId ? "home" : "away",
    outcomeIncomplete: m.stage !== "group stage" && m.homeScore === m.awayScore && !m.decidedByPenalties,
  }));

  const teamById = new Map(teams.map((t) => [t.id, teamRef(t)]));
  const groupOfTeam = new Map<string, string>();
  for (const m of matches) {
    if (m.groupName === null) continue;
    const letter = m.groupName.replace(/^Group\s+/i, "");
    groupOfTeam.set(m.homeTeam.id, letter);
    groupOfTeam.set(m.awayTeam.id, letter);
  }

  const venues = new Map<string, ArchiveVenueDto>();
  for (const m of matchRows) {
    if (m.stadium === null) continue;
    const venue = venues.get(m.stadium.id) ?? { ...m.stadium, matches: 0 };
    venue.matches += 1;
    venues.set(m.stadium.id, venue);
  }

  // Leaders computed from imported goal events (own goals excluded; shootout
  // kicks live in PenaltyKick and never reach this list).
  const leaders = (pick: (g: (typeof goals)[number]) => { id: string; name: string; slug: string } | null) => {
    const map = new Map<string, ArchiveLeader & { teamId: string }>();
    for (const goal of goals) {
      if (goal.isOwnGoal) continue;
      const player = pick(goal);
      if (player === null) continue;
      const entry = map.get(player.id) ?? { player: { name: player.name, slug: player.slug }, team: teamById.get(goal.teamId) ?? null, teamId: goal.teamId, value: 0, secondary: 0 };
      entry.value += 1;
      map.set(player.id, entry);
    }
    return map;
  };
  const scorers = leaders((g) => g.player);
  const assisters = leaders((g) => g.assistPlayer);
  for (const [id, entry] of scorers) entry.secondary = assisters.get(id)?.value ?? 0;
  for (const [id, entry] of assisters) entry.secondary = scorers.get(id)?.value ?? 0;
  const rank = (map: Map<string, ArchiveLeader>) =>
    [...map.values()]
      .sort((a, b) => b.value - a.value || b.secondary - a.secondary || a.player.name.localeCompare(b.player.name))
      .slice(0, 10)
      .map(({ player, team, value, secondary }) => ({ player, team, value, secondary }));

  const finalMatch = matches.find((m) => m.stage === "final") ?? null;
  const ref = (id: string | null) => (id === null ? null : (teamById.get(id) ?? null));
  const goalTotal = matches.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0);

  return {
    year: tournament.year,
    name: tournament.name,
    hosts: tournament.hostCountries.length > 0 ? tournament.hostCountries : tournament.hostName !== null ? [tournament.hostName] : [],
    hostCountries: resolveHostCountries(tournament.hostName, tournament.hostCountries, await getCountryDirectory()),
    startDate: isoDay(tournament.startDate),
    endDate: isoDay(tournament.endDate),
    attendance: tournament.attendance,
    sourceUrl: tournament.sourceUrl,
    verificationStatus: tournament.verificationStatus,
    lastUpdated: tournament.updatedAt.toISOString().slice(0, 10),
    counts: {
      teams: teams.length,
      matches: matches.length,
      goals: goalTotal,
      venues: venues.size,
      players: squadCount,
    },
    podium: {
      champion: ref(tournament.winnerTeamId),
      runnerUp: ref(tournament.runnerUpTeamId),
      third: ref(tournament.thirdPlaceTeamId),
      fourth: ref(tournament.fourthPlaceTeamId),
    },
    finalMatch,
    matches,
    groups: computeArchiveGroups(matches),
    bracket: buildBracket(matches),
    teams: teams
      .map((t) => ({ ...teamRef(t), groupLetter: groupOfTeam.get(t.id) ?? null }))
      .sort((a, b) => (a.groupLetter ?? "~").localeCompare(b.groupLetter ?? "~") || a.name.localeCompare(b.name)),
    venues: [...venues.values()].sort((a, b) => (a.country ?? "").localeCompare(b.country ?? "") || a.name.localeCompare(b.name)),
    awards: awards.map((a) => {
      const details = (a.details ?? {}) as Record<string, unknown>;
      const num = (key: string) => (typeof details[key] === "number" ? (details[key] as number) : undefined);
      return {
        id: a.id,
        name: a.name,
        officialName: typeof details.officialName === "string" ? details.officialName : null,
        rank: a.rank,
        player: a.player,
        team: a.team === null ? null : teamRef(a.team),
        details: {
          ...(num("goals") !== undefined ? { goals: num("goals") } : {}),
          ...(num("assists") !== undefined ? { assists: num("assists") } : {}),
          ...(num("minutes") !== undefined ? { minutes: num("minutes") } : {}),
          ...(num("shirtNumber") !== undefined ? { shirtNumber: num("shirtNumber") } : {}),
        },
        sourceUrl: a.sourceUrl,
        verified: a.verificationStatus === "FIFA_OFFICIAL",
      };
    }),
    topScorers: rank(scorers),
    topAssists: rank(assisters),
    coverage: {
      bookings,
      substitutions,
      shootoutKicks,
      incompleteOutcomes: matches.filter((m) => m.outcomeIncomplete).length,
    },
  };
});

/**
 * Squad search for the hub. The 1,248-row squad list stays on the server;
 * only the requested page is rendered. Matching is accent-insensitive, so
 * "Cubarsi" finds "Cubarsí".
 */
export async function searchTournamentSquads(
  year: number,
  query: string | undefined,
  limit = 48,
): Promise<{ players: ArchiveSquadPlayerDto[]; total: number }> {
  const rows = await prisma.squadPlayer.findMany({
    where: { tournament: { year } },
    select: {
      position: true,
      player: { select: { name: true, slug: true } },
      team: { select: teamSelect },
    },
  });
  const fold = (value: string) => (foldDiacritics(value) ?? value).toLowerCase();
  const needle = query === undefined ? null : fold(query.trim());
  const matched = rows
    .filter((row) => needle === null || needle === "" || fold(row.player.name).includes(needle) || fold(row.team.name).includes(needle))
    .sort((a, b) => a.team.name.localeCompare(b.team.name) || a.player.name.localeCompare(b.player.name));
  return {
    total: matched.length,
    players: matched.slice(0, limit).map((row) => ({
      name: row.player.name,
      slug: row.player.slug,
      position: row.position,
      team: teamRef(row.team),
    })),
  };
}
