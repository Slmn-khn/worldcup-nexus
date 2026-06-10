// Explicit column mappings from Fjelstul CSV rows to Prisma inputs.
// Raw columns are never spread into models — every field is mapped by hand
// against the actual headers (data/sources/fjelstul/reports/headers.json).
// Source: jfjelstul/worldcup (GitHub), CC BY 4.0 — see docs/DATA_SOURCES.md.

import type { Prisma } from "../../../src/generated/prisma/client";
import type { RawRow } from "./csv";
import { SlugRegistry, slugify } from "./slug";
import {
  cleanString,
  joinName,
  toBool,
  toDateTimeUTC,
  toDateUTC,
  toInt,
} from "./values";

/** Required columns per dataset, validated against the cached CSV headers. */
export const REQUIRED_COLUMNS: Record<string, string[]> = {
  tournaments: [
    "tournament_id",
    "tournament_name",
    "year",
    "start_date",
    "end_date",
    "host_country",
    "winner",
    "count_teams",
  ],
  teams: ["team_id", "team_name", "team_code"],
  players: [
    "player_id",
    "family_name",
    "given_name",
    "birth_date",
    "goal_keeper",
    "defender",
    "midfielder",
    "forward",
  ],
  stadiums: ["stadium_id", "stadium_name", "city_name", "country_name"],
  referees: ["referee_id", "family_name", "given_name", "country_name"],
  qualified_teams: ["tournament_id", "team_id", "team_name", "team_code"],
  matches: [
    "match_id",
    "tournament_id",
    "match_name",
    "stage_name",
    "match_date",
    "match_time",
    "stadium_id",
    "home_team_id",
    "away_team_id",
    "home_team_score",
    "away_team_score",
    "penalty_shootout",
    "home_team_score_penalties",
    "away_team_score_penalties",
    "home_team_win",
    "away_team_win",
    "draw",
  ],
  squads: [
    "tournament_id",
    "team_id",
    "player_id",
    "shirt_number",
    "position_name",
    "position_code",
  ],
};

/** Composite source id for Team rows (a team participates per tournament). */
export function teamSourceId(tournamentId: string, teamId: string): string {
  return `${tournamentId}:${teamId}`;
}

export function mapTournament(
  row: RawRow,
): Prisma.TournamentUncheckedCreateInput {
  const sourceId = cleanString(row.tournament_id);
  const name = cleanString(row.tournament_name);
  const year = toInt(row.year);
  if (sourceId === null || name === null || year === null) {
    throw new Error(
      `tournaments: row is missing tournament_id/tournament_name/year (${JSON.stringify(row.tournament_id)})`,
    );
  }
  return {
    sourceId,
    year,
    name,
    slug: String(year),
    hostName: cleanString(row.host_country),
    startDate: toDateUTC(row.start_date),
    endDate: toDateUTC(row.end_date),
    teamsCount: toInt(row.count_teams),
  };
}

export function mapCountry(
  row: RawRow,
): Prisma.CountryUncheckedCreateInput | null {
  const sourceId = cleanString(row.team_id);
  const name = cleanString(row.team_name);
  if (sourceId === null || name === null) return null;
  return {
    sourceId,
    name,
    slug: slugify(name),
    // team_code is an ISO 3166-1 alpha-3 style code in this source (e.g. DZA),
    // not a FIFA code — fifaCode is intentionally left null.
    code: cleanString(row.team_code),
  };
}

export function mapTeam(
  row: RawRow,
  tournamentDbId: string,
  countryDbId: string | null,
): Prisma.TeamUncheckedCreateInput | null {
  const tournamentId = cleanString(row.tournament_id);
  const teamId = cleanString(row.team_id);
  const name = cleanString(row.team_name);
  if (tournamentId === null || teamId === null || name === null) return null;
  return {
    sourceId: teamSourceId(tournamentId, teamId),
    tournamentId: tournamentDbId,
    countryId: countryDbId,
    name,
    slug: slugify(name),
    code: cleanString(row.team_code),
  };
}

export function mapStadium(
  row: RawRow,
  slugs: SlugRegistry,
): Prisma.StadiumUncheckedCreateInput | null {
  const sourceId = cleanString(row.stadium_id);
  const name = cleanString(row.stadium_name);
  if (sourceId === null || name === null) return null;
  const city = cleanString(row.city_name);
  return {
    sourceId,
    name,
    slug: slugs.claim(
      slugify(city !== null ? `${name} ${city}` : name),
      sourceId,
    ),
    city,
    country: cleanString(row.country_name),
  };
}

export function mapReferee(
  row: RawRow,
  slugs: SlugRegistry,
): Prisma.RefereeUncheckedCreateInput | null {
  const sourceId = cleanString(row.referee_id);
  const name = joinName(row.given_name, row.family_name);
  if (sourceId === null || name === null) return null;
  return {
    sourceId,
    name,
    slug: slugs.claim(slugify(name), sourceId),
    country: cleanString(row.country_name),
  };
}

const POSITION_FLAGS: { column: string; code: string }[] = [
  { column: "goal_keeper", code: "GK" },
  { column: "defender", code: "DF" },
  { column: "midfielder", code: "MF" },
  { column: "forward", code: "FW" },
];

export function mapPlayer(
  row: RawRow,
  slugs: SlugRegistry,
): Prisma.PlayerUncheckedCreateInput | null {
  const sourceId = cleanString(row.player_id);
  const name = joinName(row.given_name, row.family_name);
  if (sourceId === null || name === null) return null;
  const positions = POSITION_FLAGS.filter(({ column }) =>
    toBool(row[column]),
  ).map(({ code }) => code);
  return {
    sourceId,
    name,
    slug: slugs.claim(slugify(name), sourceId),
    position: positions.length > 0 ? positions.join("/") : null,
    dateOfBirth: toDateUTC(row.birth_date),
  };
}

export type MatchResolveContext = {
  tournamentIdBySource: Map<string, string>;
  teamIdBySource: Map<string, string>;
  stadiumIdBySource: Map<string, string>;
};

export type MatchMapResult =
  | { ok: true; data: Prisma.MatchUncheckedCreateInput }
  | { ok: false; reason: string };

export function mapMatch(
  row: RawRow,
  ctx: MatchResolveContext,
): MatchMapResult {
  const sourceId = cleanString(row.match_id);
  const tournamentSource = cleanString(row.tournament_id);
  const homeTeamSource = cleanString(row.home_team_id);
  const awayTeamSource = cleanString(row.away_team_id);
  const stage = cleanString(row.stage_name);

  if (sourceId === null) return { ok: false, reason: "missing match_id" };
  if (tournamentSource === null || stage === null) {
    return {
      ok: false,
      reason: `${sourceId}: missing tournament_id or stage_name`,
    };
  }
  const tournamentId = ctx.tournamentIdBySource.get(tournamentSource);
  if (tournamentId === undefined) {
    return {
      ok: false,
      reason: `${sourceId}: unknown tournament ${tournamentSource}`,
    };
  }
  if (homeTeamSource === null || awayTeamSource === null) {
    return { ok: false, reason: `${sourceId}: missing home/away team id` };
  }
  const homeTeamId = ctx.teamIdBySource.get(
    teamSourceId(tournamentSource, homeTeamSource),
  );
  const awayTeamId = ctx.teamIdBySource.get(
    teamSourceId(tournamentSource, awayTeamSource),
  );
  if (homeTeamId === undefined || awayTeamId === undefined) {
    return {
      ok: false,
      reason: `${sourceId}: unresolved team (home ${homeTeamSource}, away ${awayTeamSource})`,
    };
  }

  const stadiumSource = cleanString(row.stadium_id);
  const stadiumId =
    stadiumSource !== null
      ? (ctx.stadiumIdBySource.get(stadiumSource) ?? null)
      : null;

  const matchName =
    cleanString(row.match_name) ?? `${homeTeamSource} vs ${awayTeamSource}`;
  const decidedByPenalties = toBool(row.penalty_shootout);
  const homeWin = toBool(row.home_team_win);
  const awayWin = toBool(row.away_team_win);

  // Match number is the trailing ordinal of the source match id (M-1930-01 → 1).
  const idSegments = sourceId.split("-");
  const matchNumber = toInt(idSegments[idSegments.length - 1]);

  return {
    ok: true,
    data: {
      sourceId,
      tournamentId,
      homeTeamId,
      awayTeamId,
      winningTeamId: homeWin ? homeTeamId : awayWin ? awayTeamId : null,
      slug: slugify(`${sourceId} ${matchName}`),
      stage,
      matchDate: toDateTimeUTC(row.match_date, row.match_time),
      matchNumber,
      stadiumId,
      // referee links are not present in matches.csv (they live in
      // referee_appointments.csv, which is not part of the selected subset).
      refereeId: null,
      homeScore: toInt(row.home_team_score) ?? 0,
      awayScore: toInt(row.away_team_score) ?? 0,
      homeScorePenalties: decidedByPenalties
        ? toInt(row.home_team_score_penalties)
        : null,
      awayScorePenalties: decidedByPenalties
        ? toInt(row.away_team_score_penalties)
        : null,
      decidedByPenalties,
    },
  };
}

export type SquadResolveContext = {
  tournamentIdBySource: Map<string, string>;
  teamIdBySource: Map<string, string>;
  playerIdBySource: Map<string, string>;
};

export type SquadMapResult =
  | { ok: true; data: Prisma.SquadPlayerUncheckedCreateInput }
  | { ok: false; reason: string };

export function mapSquadPlayer(
  row: RawRow,
  ctx: SquadResolveContext,
): SquadMapResult {
  const tournamentSource = cleanString(row.tournament_id);
  const teamSource = cleanString(row.team_id);
  const playerSource = cleanString(row.player_id);
  if (
    tournamentSource === null ||
    teamSource === null ||
    playerSource === null
  ) {
    return { ok: false, reason: "missing tournament/team/player id" };
  }
  const tournamentId = ctx.tournamentIdBySource.get(tournamentSource);
  const teamId = ctx.teamIdBySource.get(
    teamSourceId(tournamentSource, teamSource),
  );
  const playerId = ctx.playerIdBySource.get(playerSource);
  if (
    tournamentId === undefined ||
    teamId === undefined ||
    playerId === undefined
  ) {
    return {
      ok: false,
      reason: `${tournamentSource}/${teamSource}/${playerSource}: unresolved relation`,
    };
  }
  // The source uses shirt number 0 for "not recorded" (e.g. 1930 squads).
  const shirtNumber = toInt(row.shirt_number);
  return {
    ok: true,
    data: {
      tournamentId,
      teamId,
      playerId,
      shirtNumber: shirtNumber !== null && shirtNumber > 0 ? shirtNumber : null,
      position:
        cleanString(row.position_code) ?? cleanString(row.position_name),
    },
  };
}
