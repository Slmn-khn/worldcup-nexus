// Explicit column mappings for event-level Fjelstul datasets (Checkpoint 4C):
// goals, bookings, substitutions, penalty_kicks, award_winners.
// Mapped by hand against the actual headers — raw rows are never spread into
// Prisma models. Source: jfjelstul/worldcup (GitHub), CC BY 4.0.

import type { Prisma } from "../../../src/generated/prisma/client";
import type { RawRow } from "../utils/csv";
import { cleanString, toBool, toInt } from "../utils/values";

/** Required columns per event dataset, validated against cached CSV headers. */
export const EVENT_REQUIRED_COLUMNS: Record<string, string[]> = {
  goals: [
    "goal_id",
    "tournament_id",
    "match_id",
    "team_id",
    "player_id",
    "minute_regulation",
    "minute_stoppage",
    "own_goal",
    "penalty",
  ],
  bookings: [
    "booking_id",
    "tournament_id",
    "match_id",
    "team_id",
    "player_id",
    "minute_regulation",
    "minute_stoppage",
    "yellow_card",
    "red_card",
    "second_yellow_card",
  ],
  substitutions: [
    "substitution_id",
    "tournament_id",
    "match_id",
    "team_id",
    "player_id",
    "minute_regulation",
    "minute_stoppage",
    "going_off",
    "coming_on",
  ],
  penalty_kicks: [
    "penalty_kick_id",
    "tournament_id",
    "match_id",
    "team_id",
    "player_id",
    "converted",
  ],
  award_winners: [
    "tournament_id",
    "award_id",
    "award_name",
    "player_id",
    "team_id",
  ],
};

export type EventResolveContext = {
  tournamentIdBySource: Map<string, string>;
  /** Keyed by `${tournamentSourceId}:${teamSourceId}` (teams are per tournament). */
  teamIdBySource: Map<string, string>;
  playerIdBySource: Map<string, string>;
  matchBySource: Map<string, { id: string; decidedByPenalties: boolean }>;
};

export type MapResult<T> =
  | { ok: true; data: T; warning?: string }
  | { ok: false; reason: string };

/** The source records stoppage minute 0 for "not in stoppage time". */
function stoppage(value: string | undefined): number | null {
  const minutes = toInt(value);
  return minutes !== null && minutes > 0 ? minutes : null;
}

type ResolvedEventBase = { matchId: string; teamId: string };

/** Resolves the match + credited team shared by all event datasets. */
function resolveMatchAndTeam(
  row: RawRow,
  ctx: EventResolveContext,
): MapResult<ResolvedEventBase> {
  const tournamentSource = cleanString(row.tournament_id);
  const matchSource = cleanString(row.match_id);
  const teamSource = cleanString(row.team_id);
  if (
    tournamentSource === null ||
    matchSource === null ||
    teamSource === null
  ) {
    return { ok: false, reason: "missing tournament/match/team id" };
  }
  const match = ctx.matchBySource.get(matchSource);
  if (match === undefined) {
    return { ok: false, reason: `unknown match ${matchSource}` };
  }
  const teamId = ctx.teamIdBySource.get(`${tournamentSource}:${teamSource}`);
  if (teamId === undefined) {
    return { ok: false, reason: `${matchSource}: unknown team ${teamSource}` };
  }
  return { ok: true, data: { matchId: match.id, teamId } };
}

export function mapGoal(
  row: RawRow,
  ctx: EventResolveContext,
): MapResult<Prisma.GoalUncheckedCreateInput> {
  const sourceId = cleanString(row.goal_id);
  if (sourceId === null) return { ok: false, reason: "missing goal_id" };
  const base = resolveMatchAndTeam(row, ctx);
  if (!base.ok) return { ok: false, reason: `${sourceId}: ${base.reason}` };

  const playerSource = cleanString(row.player_id);
  const playerId =
    playerSource !== null ? ctx.playerIdBySource.get(playerSource) : undefined;
  if (playerId === undefined) {
    return {
      ok: false,
      reason: `${sourceId}: unknown scorer ${playerSource ?? "?"}`,
    };
  }

  return {
    ok: true,
    data: {
      sourceId,
      matchId: base.data.matchId,
      // team_id is the team the goal counts FOR; for own goals the scorer's
      // own team is in player_team_id (preserved in RawSourceRecord).
      teamId: base.data.teamId,
      playerId,
      // goals.csv has no assist column — assists stay null (ISSUE-006).
      assistPlayerId: null,
      minute: toInt(row.minute_regulation),
      stoppageMinute: stoppage(row.minute_stoppage),
      isOwnGoal: toBool(row.own_goal),
      isPenalty: toBool(row.penalty),
    },
  };
}

export function mapBooking(
  row: RawRow,
  ctx: EventResolveContext,
): MapResult<Prisma.BookingUncheckedCreateInput> {
  const sourceId = cleanString(row.booking_id);
  if (sourceId === null) return { ok: false, reason: "missing booking_id" };
  const base = resolveMatchAndTeam(row, ctx);
  if (!base.ok) return { ok: false, reason: `${sourceId}: ${base.reason}` };

  const playerSource = cleanString(row.player_id);
  const playerId =
    playerSource !== null ? ctx.playerIdBySource.get(playerSource) : undefined;
  if (playerId === undefined) {
    return {
      ok: false,
      reason: `${sourceId}: unknown player ${playerSource ?? "?"}`,
    };
  }

  // Source encodes the card as three boolean flags; second yellow wins over
  // the plain yellow flag, red is checked next.
  const cardType = toBool(row.second_yellow_card)
    ? "SECOND_YELLOW"
    : toBool(row.red_card)
      ? "RED"
      : toBool(row.yellow_card)
        ? "YELLOW"
        : null;
  if (cardType === null) {
    return {
      ok: false,
      reason:
        `${sourceId}: unmappable card flags ` +
        `(yellow=${row.yellow_card}, second_yellow=${row.second_yellow_card}, red=${row.red_card})`,
    };
  }

  return {
    ok: true,
    data: {
      sourceId,
      matchId: base.data.matchId,
      teamId: base.data.teamId,
      playerId,
      cardType,
      minute: toInt(row.minute_regulation),
      stoppageMinute: stoppage(row.minute_stoppage),
    },
  };
}

export function mapSubstitution(
  row: RawRow,
  ctx: EventResolveContext,
): MapResult<Prisma.SubstitutionUncheckedCreateInput> {
  const sourceId = cleanString(row.substitution_id);
  if (sourceId === null)
    return { ok: false, reason: "missing substitution_id" };
  const base = resolveMatchAndTeam(row, ctx);
  if (!base.ok) return { ok: false, reason: `${sourceId}: ${base.reason}` };

  // Each source row is one side of a substitution (going_off XOR coming_on);
  // the source provides no pairing key, so rows are imported one-sided
  // (ISSUE-007). playerIn/playerOut are nullable by schema.
  const playerSource = cleanString(row.player_id);
  const playerId =
    playerSource !== null
      ? (ctx.playerIdBySource.get(playerSource) ?? null)
      : null;
  const comingOn = toBool(row.coming_on);
  const goingOff = toBool(row.going_off);

  let warning: string | undefined;
  if (playerId === null) {
    warning = `substitutions ${sourceId}: unresolved player ${playerSource ?? "?"} (kept with null player)`;
  } else if (!comingOn && !goingOff) {
    warning = `substitutions ${sourceId}: neither going_off nor coming_on set (kept with null players)`;
  }

  return {
    ok: true,
    warning,
    data: {
      sourceId,
      matchId: base.data.matchId,
      teamId: base.data.teamId,
      playerInId: comingOn ? playerId : null,
      playerOutId: goingOff ? playerId : null,
      minute: toInt(row.minute_regulation),
      stoppageMinute: stoppage(row.minute_stoppage),
    },
  };
}

export function mapPenaltyKick(
  row: RawRow,
  ctx: EventResolveContext,
): MapResult<Prisma.PenaltyKickUncheckedCreateInput> {
  const sourceId = cleanString(row.penalty_kick_id);
  if (sourceId === null)
    return { ok: false, reason: "missing penalty_kick_id" };
  const base = resolveMatchAndTeam(row, ctx);
  if (!base.ok) return { ok: false, reason: `${sourceId}: ${base.reason}` };

  const matchSource = cleanString(row.match_id) as string;
  const match = ctx.matchBySource.get(matchSource);

  const playerSource = cleanString(row.player_id);
  const playerId =
    playerSource !== null
      ? (ctx.playerIdBySource.get(playerSource) ?? null)
      : null;
  let warning: string | undefined;
  if (playerId === null) {
    warning = `penalty_kicks ${sourceId}: unresolved player ${playerSource ?? "?"} (kept with null player)`;
  }

  // penalty_kicks.csv records shootout kicks (no minute/order columns).
  // The match's penalty_shootout flag is the source-backed signal; a kick in
  // a non-shootout match would be unexpected, so it is flagged (ISSUE-008).
  const isShootout = match?.decidedByPenalties === true;
  if (!isShootout) {
    warning = `penalty_kicks ${sourceId}: match ${matchSource} is not marked as decided by penalties — imported as IN_MATCH`;
  }

  return {
    ok: true,
    warning,
    data: {
      sourceId,
      matchId: base.data.matchId,
      teamId: base.data.teamId,
      playerId,
      type: isShootout ? "SHOOTOUT" : "IN_MATCH",
      // The source provides no kick order or minute — left null (ISSUE-008).
      order: null,
      minute: null,
      stoppageMinute: null,
      converted: toBool(row.converted),
      isSaved: null,
      isMissed: null,
    },
  };
}

/** Awards repeat per tournament (and can be shared), so the sourceId is composite. */
export function awardSourceId(row: RawRow): string | null {
  const tournament = cleanString(row.tournament_id);
  const award = cleanString(row.award_id);
  if (tournament === null || award === null) return null;
  const winner =
    cleanString(row.player_id) ?? cleanString(row.team_id) ?? "none";
  return `${tournament}:${award}:${winner}`;
}

export function mapAward(
  row: RawRow,
  ctx: EventResolveContext,
): MapResult<Prisma.AwardUncheckedCreateInput> {
  const sourceId = awardSourceId(row);
  const name = cleanString(row.award_name);
  const tournamentSource = cleanString(row.tournament_id);
  if (sourceId === null || name === null || tournamentSource === null) {
    return { ok: false, reason: "missing tournament_id/award_id/award_name" };
  }
  const tournamentId = ctx.tournamentIdBySource.get(tournamentSource);
  if (tournamentId === undefined) {
    return {
      ok: false,
      reason: `${sourceId}: unknown tournament ${tournamentSource}`,
    };
  }

  const playerSource = cleanString(row.player_id);
  const playerId =
    playerSource !== null
      ? (ctx.playerIdBySource.get(playerSource) ?? null)
      : null;
  const teamSource = cleanString(row.team_id);
  const teamId =
    teamSource !== null
      ? (ctx.teamIdBySource.get(`${tournamentSource}:${teamSource}`) ?? null)
      : null;

  let warning: string | undefined;
  if (playerSource !== null && playerId === null) {
    warning = `award_winners ${sourceId}: unresolved player ${playerSource} (kept with null player)`;
  } else if (teamSource !== null && teamId === null) {
    warning = `award_winners ${sourceId}: unresolved team ${teamSource} (kept with null team)`;
  }

  return {
    ok: true,
    warning,
    data: {
      sourceId,
      tournamentId,
      playerId,
      teamId,
      name,
      // award_winners.csv has no description column.
      description: null,
    },
  };
}
