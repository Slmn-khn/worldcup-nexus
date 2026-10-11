// Stage step: map parsed bundle rows onto canonical-shaped DTOs. Pure — no
// database, no clock, no I/O — so the transformation is unit-testable and the
// same snapshot always yields the same staged output.
//
// Trust tiers are enforced here: tournament + awards come ONLY from
// 01_verified_official; everything else is candidate data. Fields the policy
// withholds (bookings, VAR, team stats, lineups/minutes, xG, POTM, market
// values, rankings) are counted but never staged.

import type { ParsedBundle } from "./bundle";
import {
  AWARD_NAME_MAP,
  CANONICAL_TOURNAMENT_NAME,
  COUNTRY_BY_FIFA_CODE,
  POSITION_MAP,
  STAGE_MAP,
  VENUE_COUNTRY,
  type CountryResolution,
} from "./constants";

// --- name helpers -----------------------------------------------------------

/** Same algorithm as scripts/import/utils/slug.ts so slugs stay consistent. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Accent-, case- and punctuation-insensitive form used ONLY for matching. */
export function foldName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[øØ]/g, "o")
    .replace(/[łŁ]/g, "l")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function nameTokens(value: string): Set<string> {
  return new Set(foldName(value).split(" ").filter((token) => token.length > 1));
}

export function sharedTokenCount(a: string, b: string): number {
  const left = nameTokens(a);
  let shared = 0;
  for (const token of nameTokens(b)) if (left.has(token)) shared += 1;
  return shared;
}

/** "Mexico City Stadium (Estadio Azteca)" → "Estadio Azteca". */
export function venueCommonName(tournamentName: string): string {
  const match = /\(([^)]+)\)\s*$/.exec(tournamentName);
  return (match?.[1] ?? tournamentName).trim();
}

// --- staged DTOs ------------------------------------------------------------

export type StagedTeam = {
  srcId: number;
  fifaCode: string;
  sourceName: string;
  groupLetter: string;
  country: CountryResolution;
};

export type StagedVenue = {
  srcId: number;
  name: string;
  tournamentName: string;
  city: string;
  country: string;
  capacity: number | null;
  latitude: number | null;
  longitude: number | null;
};

export type StagedReferee = { srcId: number; name: string; country: string };

export type StagedPlayer = {
  srcId: number;
  teamSrcId: number;
  /** Display name for a NEW canonical player (official FIFA name wins). */
  name: string;
  candidateName: string;
  officialName: string | null;
  position: string | null;
  dateOfBirth: string | null;
  /** Only from the official awards file — the candidate has no shirt numbers. */
  shirtNumber: number | null;
};

export type StagedMatch = {
  srcId: number;
  matchNumber: number;
  stage: string;
  groupName: string | null;
  kickoffUtc: string;
  venueSrcId: number;
  homeSrcId: number;
  awaySrcId: number;
  refereeSrcId: number | null;
  homeScore: number;
  awayScore: number;
  homeScorePenalties: number | null;
  awayScorePenalties: number | null;
  decidedByPenalties: boolean;
  /** null = outcome not recorded by the source (never guessed). */
  extraTime: boolean | null;
  winnerSrcId: number | null;
  outcomeIncomplete: boolean;
};

export type StagedGoal = {
  eventId: number;
  matchSrcId: number;
  /** Team credited with the goal (for own goals: the opponent). */
  teamSrcId: number;
  playerSrcId: number;
  assistPlayerSrcId: number | null;
  minute: number;
  isOwnGoal: boolean;
};

export type StagedShootoutKick = {
  eventId: number;
  matchSrcId: number;
  teamSrcId: number;
  playerSrcId: number;
  order: number;
  converted: boolean;
};

export type StagedAward = {
  slug: string;
  name: string;
  officialName: string;
  rank: number;
  teamSrcId: number;
  playerSrcId: number | null;
  sourceUrl: string;
  details: Record<string, string | number>;
};

export type StagedTournament = {
  name: string;
  officialName: string;
  startDate: string;
  endDate: string;
  hostCountries: string[];
  teamsCount: number;
  matchesCount: number;
  goalsCount: number;
  venuesCount: number;
  attendance: number;
  championSrcId: number;
  runnerUpSrcId: number;
  thirdSrcId: number;
  fourthSrcId: number;
  finalMatchSrcId: number;
  sourceUrl: string;
};

export type WithheldSummary = Record<string, { rows: number; reason: string }>;

export type StagedBundle = {
  tournament: StagedTournament;
  teams: StagedTeam[];
  venues: StagedVenue[];
  referees: StagedReferee[];
  players: StagedPlayer[];
  matches: StagedMatch[];
  goals: StagedGoal[];
  shootoutKicks: StagedShootoutKick[];
  awards: StagedAward[];
  withheld: WithheldSummary;
  stagingErrors: string[];
};

function kickoffIso(date: string, time: string): string {
  return `${date}T${time}:00.000Z`;
}

export function stageBundle(bundle: ParsedBundle): StagedBundle {
  const stagingErrors: string[] = [];
  const stageNameById = new Map(bundle.stages.map((s) => [s.stage_id, s.stage_name]));
  const teamById = new Map(bundle.teams.map((t) => [t.team_id, t]));

  // Teams --------------------------------------------------------------------
  const teams: StagedTeam[] = bundle.teams.map((team) => {
    const mapping = COUNTRY_BY_FIFA_CODE[team.fifa_code];
    if (mapping === undefined) {
      stagingErrors.push(`team ${team.team_id} (${team.team_name}): FIFA code ${team.fifa_code} has no reviewed country mapping`);
    } else if (!mapping.aliases.includes(team.team_name)) {
      stagingErrors.push(`team ${team.team_id}: name "${team.team_name}" is not a reviewed alias for ${team.fifa_code} (${mapping.aliases.join(", ")})`);
    }
    return {
      srcId: team.team_id,
      fifaCode: team.fifa_code,
      sourceName: team.team_name,
      groupLetter: team.group_letter,
      country: mapping?.resolution ?? { kind: "existing", slug: "__unmapped__" },
    };
  });

  // Venues / referees --------------------------------------------------------
  const venues: StagedVenue[] = bundle.venues.map((venue) => ({
    srcId: venue.venue_id,
    name: venueCommonName(venue.stadium_name),
    tournamentName: venue.stadium_name,
    city: venue.city,
    country: VENUE_COUNTRY[venue.country] ?? venue.country,
    capacity: venue.capacity,
    latitude: venue.latitude,
    longitude: venue.longitude,
  }));
  const referees: StagedReferee[] = bundle.referees.map((referee) => ({
    srcId: referee.referee_id,
    name: referee.name,
    country: referee.country,
  }));

  // Players — official award names / shirt numbers take precedence ----------
  const officialByPlayer = new Map<number, { name: string; shirt: number | null }>();
  for (const award of bundle.awards) {
    if (award.player_id === null) continue;
    officialByPlayer.set(award.player_id, {
      name: award.player_name,
      shirt: award.shirt_number,
    });
  }
  const players: StagedPlayer[] = bundle.players.map((player) => {
    const official = officialByPlayer.get(player.player_id) ?? null;
    return {
      srcId: player.player_id,
      teamSrcId: player.team_id,
      name: official?.name ?? player.player_name,
      candidateName: player.player_name,
      officialName: official?.name ?? null,
      position: POSITION_MAP[player.position] ?? null,
      dateOfBirth: player.date_of_birth === "" ? null : player.date_of_birth,
      shirtNumber: official?.shirt ?? null,
    };
  });

  // Matches ------------------------------------------------------------------
  const matches: StagedMatch[] = bundle.matches.map((match) => {
    const sourceStage = stageNameById.get(match.stage_id) ?? "";
    const stage = STAGE_MAP[sourceStage];
    if (stage === undefined) stagingErrors.push(`match ${match.match_id}: unknown stage "${sourceStage}"`);
    const isGroup = stage === "group stage";
    const homeGroup = teamById.get(match.home_team_id)?.group_letter ?? null;

    const hasPens = match.home_penalty_score !== null && match.away_penalty_score !== null;
    let winnerSrcId: number | null = null;
    if (match.home_score !== match.away_score) {
      winnerSrcId = match.home_score > match.away_score ? match.home_team_id : match.away_team_id;
    } else if (hasPens && match.home_penalty_score !== match.away_penalty_score) {
      winnerSrcId =
        match.home_penalty_score! > match.away_penalty_score! ? match.home_team_id : match.away_team_id;
    }
    // A knockout draw needs a recorded extra-time/shootout outcome. When the
    // source has none, the outcome stays NULL — never inferred from the next
    // round's participants.
    const outcomeIncomplete = !isGroup && match.home_score === match.away_score && !hasPens;
    let extraTime: boolean | null;
    if (match.result_type === "AET" || match.result_type === "Penalties") extraTime = true;
    else if (outcomeIncomplete) extraTime = null;
    else extraTime = false;

    return {
      srcId: match.match_id,
      matchNumber: match.match_id,
      stage: stage ?? sourceStage.toLowerCase(),
      groupName: isGroup && homeGroup !== null ? `Group ${homeGroup}` : null,
      kickoffUtc: kickoffIso(match.date, match.kickoff_time_utc),
      venueSrcId: match.venue_id,
      homeSrcId: match.home_team_id,
      awaySrcId: match.away_team_id,
      refereeSrcId: match.referee_id,
      homeScore: match.home_score,
      awayScore: match.away_score,
      homeScorePenalties: hasPens ? match.home_penalty_score : null,
      awayScorePenalties: hasPens ? match.away_penalty_score : null,
      decidedByPenalties: hasPens,
      extraTime,
      winnerSrcId,
      outcomeIncomplete,
    };
  });
  const matchById = new Map(matches.map((m) => [m.srcId, m]));

  // Events → goals (+ folded assists) and shootout kicks ---------------------
  const goals: StagedGoal[] = [];
  const shootoutKicks: StagedShootoutKick[] = [];
  const shootoutOrder = new Map<number, number>();
  const events = [...bundle.events].sort((a, b) => a.event_id - b.event_id);
  events.forEach((event, index) => {
    const match = matchById.get(event.match_id);
    if (match === undefined) return;
    if (event.event_type === "Goal" || event.event_type === "Own Goal") {
      const isOwnGoal = event.event_type === "Own Goal";
      // Candidate own goals carry the scorer's (conceding) team; the canonical
      // Goal.teamId is the team credited with the goal (Fjelstul convention).
      const creditedTeam = isOwnGoal
        ? event.team_id === match.homeSrcId
          ? match.awaySrcId
          : match.homeSrcId
        : event.team_id;
      const next = events[index + 1];
      const assist =
        !isOwnGoal &&
        next !== undefined &&
        next.event_type === "Assist" &&
        next.match_id === event.match_id &&
        next.minute === event.minute &&
        next.team_id === event.team_id
          ? next.player_id
          : null;
      goals.push({
        eventId: event.event_id,
        matchSrcId: event.match_id,
        teamSrcId: creditedTeam,
        playerSrcId: event.player_id,
        assistPlayerSrcId: assist,
        minute: event.minute,
        isOwnGoal,
      });
    } else if (event.event_type === "Penalty Shootout Goal" || event.event_type === "Penalty Shootout Miss") {
      const order = (shootoutOrder.get(event.match_id) ?? 0) + 1;
      shootoutOrder.set(event.match_id, order);
      shootoutKicks.push({
        eventId: event.event_id,
        matchSrcId: event.match_id,
        teamSrcId: event.team_id,
        playerSrcId: event.player_id,
        order,
        converted: event.event_type === "Penalty Shootout Goal",
      });
    }
  });

  // Awards (official tier only) ----------------------------------------------
  const awards: StagedAward[] = bundle.awards.map((award) => {
    const mapped = AWARD_NAME_MAP[award.award_category];
    if (mapped === undefined) stagingErrors.push(`award "${award.award_category}" has no canonical mapping`);
    const details: Record<string, string | number> = { officialName: award.award_category };
    if (award.shirt_number !== null) details.shirtNumber = award.shirt_number;
    if (award.goals !== null) details.goals = award.goals;
    if (award.assists !== null) details.assists = award.assists;
    if (award.minutes !== null) details.minutes = award.minutes;
    if (award.player_name !== "") details.officialRecipientName = award.player_name;
    return {
      slug: mapped?.slug ?? award.award_category.toLowerCase().replace(/\s+/g, "-"),
      name: mapped?.name ?? award.award_category,
      officialName: award.award_category,
      rank: award.rank,
      teamSrcId: award.team_id,
      playerSrcId: award.recipient_type === "PLAYER" ? award.player_id : null,
      sourceUrl: award.source_url,
      details,
    };
  });

  const t = bundle.tournament;
  const tournament: StagedTournament = {
    name: CANONICAL_TOURNAMENT_NAME,
    officialName: t.name,
    startDate: t.start_date,
    endDate: t.end_date,
    hostCountries: t.host_countries.split("|").map((h) => h.trim()),
    teamsCount: t.team_count,
    matchesCount: t.match_count,
    goalsCount: t.goal_count,
    venuesCount: t.venue_count,
    attendance: t.attendance,
    championSrcId: t.champion_team_id,
    runnerUpSrcId: t.runner_up_team_id,
    thirdSrcId: t.third_place_team_id,
    fourthSrcId: t.fourth_place_team_id,
    finalMatchSrcId: t.final_match_id,
    sourceUrl: t.source_url,
  };

  const countType = (type: string) => bundle.events.filter((e) => e.event_type === type).length;
  const withheld: WithheldSummary = {
    bookings: {
      rows: countType("Yellow Card") + countType("Red Card"),
      reason: "Card events are visibly incomplete (well under one yellow card per match) — kept as raw records until reconciled with official match reports.",
    },
    varReviews: { rows: countType("VAR Review"), reason: "No canonical VAR model; kept as raw records." },
    substitutions: { rows: 0, reason: "Source has no substitution events; never inferred from minutes." },
    lineups: {
      rows: bundle.lineups.length,
      reason: "Per-match minutes conflict with FIFA official totals (validation/known_conflicts.csv); no canonical appearance model.",
    },
    teamStats: {
      rows: bundle.teamStats.length,
      reason: "Mixed fifa.com / sofascore.com provenance; usage rights unreviewed.",
    },
    playerOfTheMatch: {
      rows: bundle.matches.filter((m) => m.player_of_the_match_id !== null).length,
      reason: "Candidate-only field with no canonical column; raw only.",
    },
    quarantine: {
      rows: 0,
      reason: "03_quarantine/* (player stats, market values, ELO/rankings, redundant match rows) is never read by this importer.",
    },
  };

  return { tournament, teams, venues, referees, players, matches, goals, shootoutKicks, awards, withheld, stagingErrors };
}
