// Validate step: cross-file invariants over the parsed bundle + staged DTOs.
// Pure. A failing BLOCKER aborts every write; a failure listed in
// KNOWN_CONFLICTS is reported (and surfaced in the UI as incomplete data)
// but does not block, because the import deliberately leaves that value NULL.

import type { ParsedBundle } from "./bundle";
import { EXPECTED_STAGE_COUNTS, TOURNAMENT_YEAR } from "./constants";
import { foldName, sharedTokenCount, type StagedBundle } from "./stage";

export type CheckSeverity = "BLOCKER" | "WARN";
export type CheckStatus = "PASS" | "FAIL" | "KNOWN_CONFLICT" | "WARN";

export type ValidationCheck = {
  id: string;
  description: string;
  severity: CheckSeverity;
  status: CheckStatus;
  detail?: string;
};

export type KnownConflict = {
  id: string;
  area: string;
  record: string;
  candidateValue: string;
  officialValue: string;
  decision: string;
};

/**
 * Reviewed conflicts. Each one names the canonical decision so the outcome is
 * deterministic and auditable — never a silent pick between values.
 */
export const KNOWN_CONFLICTS: KnownConflict[] = [
  {
    id: "M96_KNOCKOUT_DRAW_WITHOUT_OUTCOME",
    area: "match_outcome",
    record: "Match 96 (Round of 16): Switzerland 0–0 Colombia",
    candidateValue: "result_type=Regular, no extra-time/penalty data, no shootout events",
    officialValue: "Not supplied in the bundle",
    decision:
      "Import the 0–0 scoreline; leave extraTime, penalty scores and winningTeamId NULL and flag the match as outcome-incomplete. Switzerland's later quarter-final is NOT used to infer a shootout result.",
  },
  {
    id: "PLAYER_MINUTES_MBAPPE",
    area: "player_minutes",
    record: "Kylian Mbappé",
    candidateValue: "711 (lineups)",
    officialValue: "769 (FIFA awards)",
    decision: "Lineup minutes are not imported; FIFA's 769 is shown with the Golden Boot award only.",
  },
  {
    id: "PLAYER_MINUTES_BELLINGHAM",
    area: "player_minutes",
    record: "Jude Bellingham",
    candidateValue: "596 (lineups)",
    officialValue: "698 (FIFA awards)",
    decision: "Lineup minutes are not imported; FIFA's 698 is shown with the Bronze Boot award only.",
  },
  {
    id: "NO_SUBSTITUTION_EVENTS",
    area: "match_events",
    record: "All matches",
    candidateValue: "0 substitution events",
    officialValue: "Required by the Substitution model",
    decision: "Substitution stays empty for 2026; match pages show an explicit 'not recorded' state.",
  },
  {
    id: "INCOMPLETE_BOOKINGS",
    area: "match_events",
    record: "All matches",
    candidateValue: "35 yellow / 12 red cards across 104 matches",
    officialValue: "Not supplied in the bundle",
    decision: "Bookings withheld from canonical tables (raw records only) until reconciled with official match reports.",
  },
  {
    id: "NO_IN_MATCH_PENALTY_FLAG",
    area: "goals",
    record: "All goals",
    candidateValue: "Goal events do not distinguish penalties",
    officialValue: "Not supplied in the bundle",
    decision: "Goal.isPenalty is left false (schema default); documented as unrecorded for 2026 in docs/DATA_ISSUES.md.",
  },
];

const KNOWN_CHECK_FAILURES = new Map<string, Set<string>>([
  ["knockout-draws-have-outcome", new Set(["96"])],
]);

export type ValidationResult = {
  ok: boolean;
  checks: ValidationCheck[];
  blockers: ValidationCheck[];
  knownConflicts: KnownConflict[];
};

export function validateBundle(bundle: ParsedBundle, staged: StagedBundle): ValidationResult {
  const checks: ValidationCheck[] = [];
  const check = (
    id: string,
    description: string,
    failures: string[],
    severity: CheckSeverity = "BLOCKER",
  ) => {
    let status: CheckStatus = failures.length === 0 ? "PASS" : severity === "WARN" ? "WARN" : "FAIL";
    const known = KNOWN_CHECK_FAILURES.get(id);
    if (status === "FAIL" && known !== undefined && failures.every((f) => known.has(f))) {
      status = "KNOWN_CONFLICT";
    }
    checks.push({
      id,
      description,
      severity,
      status,
      ...(failures.length > 0 ? { detail: failures.slice(0, 20).join("; ") } : {}),
    });
  };
  const eq = (label: string, actual: number, expected: number) =>
    actual === expected ? [] : [`${label}: ${actual} (expected ${expected})`];

  check("staging", "every row maps to a reviewed canonical value", staged.stagingErrors);

  // Volume / format invariants
  const t = bundle.tournament;
  check("tournament-year", "tournament year is 2026", eq("year", t.year, TOURNAMENT_YEAR));
  check("hosts", "hosts are Canada, Mexico and United States", staged.tournament.hostCountries.join("|") === "Canada|Mexico|United States" ? [] : [staged.tournament.hostCountries.join("|")]);
  check("team-count", "48 teams (candidate = official)", [...eq("candidate", bundle.teams.length, 48), ...eq("official", t.team_count, 48)]);
  check("match-count", "104 matches (candidate = official)", [...eq("candidate", bundle.matches.length, 104), ...eq("official", t.match_count, 104)]);
  check("venue-count", "16 venues (candidate = official)", [...eq("candidate", bundle.venues.length, 16), ...eq("official", t.venue_count, 16)]);
  check("player-count", "1,248 registered squad players", eq("players", bundle.players.length, 1248));
  check("squad-size", "26 players per team", bundle.teams.flatMap((team) => eq(`team ${team.team_id}`, bundle.players.filter((p) => p.team_id === team.team_id).length, 26)));

  const stageCounts = new Map<string, number>();
  for (const m of staged.matches) stageCounts.set(m.stage, (stageCounts.get(m.stage) ?? 0) + 1);
  check(
    "stage-distribution",
    "stage distribution 72/16/8/4/2/1/1",
    [
      ...Object.entries(EXPECTED_STAGE_COUNTS).flatMap(([stage, n]) => eq(stage, stageCounts.get(stage) ?? 0, n)),
      ...[...stageCounts.keys()].filter((s) => !(s in EXPECTED_STAGE_COUNTS)).map((s) => `unexpected stage ${s}`),
    ],
  );

  // Groups A–L, four teams each, six round-robin matches each
  const groupFailures: string[] = [];
  const letters = [...new Set(bundle.teams.map((team) => team.group_letter))].sort();
  if (letters.join("") !== "ABCDEFGHIJKL") groupFailures.push(`groups ${letters.join("")}`);
  const groupOf = new Map(bundle.teams.map((team) => [team.team_id, team.group_letter]));
  for (const letter of letters) {
    const members = bundle.teams.filter((team) => team.group_letter === letter).length;
    if (members !== 4) groupFailures.push(`group ${letter} has ${members} teams`);
    const groupMatches = staged.matches.filter((m) => m.groupName === `Group ${letter}`).length;
    if (groupMatches !== 6) groupFailures.push(`group ${letter} has ${groupMatches} matches`);
  }
  for (const m of staged.matches.filter((match) => match.stage === "group stage")) {
    if (groupOf.get(m.homeSrcId) !== groupOf.get(m.awaySrcId)) groupFailures.push(`match ${m.srcId} crosses groups`);
  }
  check("groups", "12 groups A–L, 4 teams and 6 matches each", groupFailures);

  // Uniqueness + references
  const dupes = (label: string, ids: number[]) => {
    const seen = new Set<number>();
    return ids.filter((id) => (seen.has(id) ? true : (seen.add(id), false))).map((id) => `${label} ${id}`);
  };
  check("unique-ids", "all natural keys are unique", [
    ...dupes("team", bundle.teams.map((r) => r.team_id)),
    ...dupes("venue", bundle.venues.map((r) => r.venue_id)),
    ...dupes("referee", bundle.referees.map((r) => r.referee_id)),
    ...dupes("match", bundle.matches.map((r) => r.match_id)),
    ...dupes("player", bundle.players.map((r) => r.player_id)),
    ...dupes("event", bundle.events.map((r) => r.event_id)),
    ...dupes("fifa_code", bundle.teams.map((r) => r.fifa_code.charCodeAt(0) * 65536 + r.fifa_code.charCodeAt(1) * 256 + r.fifa_code.charCodeAt(2))),
  ]);
  const teamIds = new Set(bundle.teams.map((r) => r.team_id));
  const venueIds = new Set(bundle.venues.map((r) => r.venue_id));
  const refIds = new Set(bundle.referees.map((r) => r.referee_id));
  const playerTeam = new Map(bundle.players.map((r) => [r.player_id, r.team_id]));
  const matchIds = new Set(bundle.matches.map((r) => r.match_id));
  check("foreign-keys", "every team, venue, stage, referee, match and player reference resolves", [
    ...bundle.matches.flatMap((m) => [
      ...(teamIds.has(m.home_team_id) ? [] : [`match ${m.match_id} home team`]),
      ...(teamIds.has(m.away_team_id) ? [] : [`match ${m.match_id} away team`]),
      ...(venueIds.has(m.venue_id) ? [] : [`match ${m.match_id} venue`]),
      ...(m.referee_id === null || refIds.has(m.referee_id) ? [] : [`match ${m.match_id} referee`]),
    ]),
    ...bundle.players.filter((p) => !teamIds.has(p.team_id)).map((p) => `player ${p.player_id} team`),
    ...bundle.events.filter((e) => !matchIds.has(e.match_id) || !playerTeam.has(e.player_id) || !teamIds.has(e.team_id)).map((e) => `event ${e.event_id}`),
    ...bundle.events.filter((e) => playerTeam.get(e.player_id) !== e.team_id).map((e) => `event ${e.event_id} player not in team`),
  ]);
  check(
    "distinct-teams",
    "every match has two distinct teams, one stage and one venue",
    staged.matches.filter((m) => m.homeSrcId === m.awaySrcId || m.stage === "" || m.venueSrcId === undefined).map((m) => `match ${m.srcId}`),
  );
  const matchTeams = new Map(staged.matches.map((m) => [m.srcId, [m.homeSrcId, m.awaySrcId]]));
  check(
    "event-team-in-match",
    "every event's team played in that match",
    bundle.events.filter((e) => !matchTeams.get(e.match_id)?.includes(e.team_id)).map((e) => `event ${e.event_id}`),
  );

  // Goals
  const scoreTotal = bundle.matches.reduce((sum, m) => sum + m.home_score + m.away_score, 0);
  check("goal-total", "scorelines total 308 (= official goal count)", [...eq("scorelines", scoreTotal, 308), ...eq("official", t.goal_count, 308)]);
  check(
    "goals-reconcile",
    "goal + own-goal events reconcile with each team's score",
    staged.matches.flatMap((m) => {
      const home = staged.goals.filter((g) => g.matchSrcId === m.srcId && g.teamSrcId === m.homeSrcId).length;
      const away = staged.goals.filter((g) => g.matchSrcId === m.srcId && g.teamSrcId === m.awaySrcId).length;
      return home === m.homeScore && away === m.awayScore ? [] : [`match ${m.srcId}: events ${home}-${away} vs score ${m.homeScore}-${m.awayScore}`];
    }),
  );
  const assists = bundle.events.filter((e) => e.event_type === "Assist").length;
  const folded = staged.goals.filter((g) => g.assistPlayerSrcId !== null).length;
  check("assists-fold", "every assist attaches to the goal it follows", eq("assists folded", folded, assists));
  check(
    "shootouts-separate",
    "shootout kicks are separate from goals (never counted in scores or Golden Boot)",
    staged.goals.some((g) => staged.shootoutKicks.some((k) => k.eventId === g.eventId)) ? ["overlap"] : [],
  );

  // Shootouts + knockout outcomes
  check(
    "shootouts-reconcile",
    "shootout events reconcile with recorded penalty scores",
    staged.matches.flatMap((m) => {
      const kicks = staged.shootoutKicks.filter((k) => k.matchSrcId === m.srcId);
      if (!m.decidedByPenalties) return kicks.length === 0 ? [] : [`match ${m.srcId}: kicks without penalty score`];
      const home = kicks.filter((k) => k.teamSrcId === m.homeSrcId && k.converted).length;
      const away = kicks.filter((k) => k.teamSrcId === m.awaySrcId && k.converted).length;
      const issues: string[] = [];
      if (home !== m.homeScorePenalties || away !== m.awayScorePenalties) issues.push(`match ${m.srcId}: kicks ${home}-${away} vs pens ${m.homeScorePenalties}-${m.awayScorePenalties}`);
      if (m.homeScore !== m.awayScore) issues.push(`match ${m.srcId}: shootout after a decisive score`);
      return issues;
    }),
  );
  check(
    "knockout-draws-have-outcome",
    "knockout draws have a valid extra-time or shootout outcome",
    staged.matches.filter((m) => m.outcomeIncomplete).map((m) => String(m.srcId)),
  );
  check("group-no-shootouts", "group matches are never decided by penalties", staged.matches.filter((m) => m.stage === "group stage" && m.decidedByPenalties).map((m) => `match ${m.srcId}`));

  // Official cross-checks (FIFA tier vs candidate tier)
  const teamName = (id: number) => bundle.teams.find((team) => team.team_id === id)?.team_name;
  const finalMatch = staged.matches.find((m) => m.srcId === t.final_match_id);
  const thirdMatch = staged.matches.find((m) => m.stage === "third-place match");
  const loser = (m: typeof finalMatch) => (m === undefined || m.winnerSrcId === null ? null : m.winnerSrcId === m.homeSrcId ? m.awaySrcId : m.homeSrcId);
  check("podium-official", "FIFA podium: Spain, Argentina, England, France", [
    ...(teamName(t.champion_team_id) === "Spain" && t.champion === "Spain" ? [] : ["champion"]),
    ...(teamName(t.runner_up_team_id) === "Argentina" && t.runner_up === "Argentina" ? [] : ["runner-up"]),
    ...(teamName(t.third_place_team_id) === "England" && t.third_place === "England" ? [] : ["third"]),
    ...(teamName(t.fourth_place_team_id) === "France" && t.fourth_place === "France" ? [] : ["fourth"]),
  ]);
  check("final-official", "final: Spain 1–0 Argentina after extra time on 19 July 2026", [
    ...(finalMatch?.stage === "final" ? [] : ["final match id is not the final"]),
    ...(finalMatch?.homeSrcId === t.champion_team_id && finalMatch.awaySrcId === t.runner_up_team_id ? [] : ["final teams"]),
    ...(finalMatch?.homeScore === 1 && finalMatch.awayScore === 0 ? [] : ["final score"]),
    ...(finalMatch?.extraTime === true ? [] : ["final not after extra time"]),
    ...(finalMatch?.kickoffUtc.startsWith("2026-07-19") ? [] : ["final date"]),
  ]);
  check("podium-candidate-agrees", "candidate results agree with the FIFA podium", [
    ...(finalMatch?.winnerSrcId === t.champion_team_id ? [] : ["final winner"]),
    ...(loser(finalMatch) === t.runner_up_team_id ? [] : ["final loser"]),
    ...(thirdMatch?.winnerSrcId === t.third_place_team_id ? [] : ["third-place winner"]),
    ...(loser(thirdMatch) === t.fourth_place_team_id ? [] : ["third-place loser"]),
  ]);
  const hostsFromVenues = [...new Set(staged.venues.map((v) => v.country))].sort().join("|");
  check("hosts-venues", "venue countries equal the official hosts", hostsFromVenues === staged.tournament.hostCountries.join("|") ? [] : [hostsFromVenues]);
  const dates = bundle.matches.map((m) => m.date).sort();
  check("dates", "match dates span the official start/end dates", dates[0] === t.start_date && dates.at(-1) === t.end_date ? [] : [`${dates[0]}..${dates.at(-1)}`]);

  // Awards
  const awardFailures: string[] = [];
  const expectedAwards = ["FIFA Fair Play Trophy", "Golden Boot", "Silver Boot", "Bronze Boot", "Golden Glove", "Golden Ball", "Silver Ball", "Bronze Ball", "Young Player Award"];
  const categories = bundle.awards.map((a) => a.award_category).sort();
  if (categories.join("|") !== [...expectedAwards].sort().join("|")) awardFailures.push(`categories: ${categories.join(", ")}`);
  for (const award of bundle.awards) {
    if (teamName(award.team_id) !== award.team_name) awardFailures.push(`${award.award_category}: team ${award.team_id} is not ${award.team_name}`);
    if (award.recipient_type === "PLAYER") {
      const player = bundle.players.find((p) => p.player_id === award.player_id);
      if (player === undefined) awardFailures.push(`${award.award_category}: player ${award.player_id} missing`);
      else if (player.team_id !== award.team_id) awardFailures.push(`${award.award_category}: player team mismatch`);
      else if (sharedTokenCount(player.player_name, award.player_name) === 0) awardFailures.push(`${award.award_category}: "${award.player_name}" does not match candidate "${player.player_name}"`);
    }
  }
  check("awards-official", "nine official awards resolve to the right player/team", awardFailures);

  const bootWarnings: string[] = [];
  for (const award of bundle.awards.filter((a) => a.award_category.endsWith("Boot"))) {
    const scored = staged.goals.filter((g) => g.playerSrcId === award.player_id && !g.isOwnGoal).length;
    const assisted = staged.goals.filter((g) => g.assistPlayerSrcId === award.player_id).length;
    if (award.goals !== null && scored !== award.goals) bootWarnings.push(`${award.award_category}: candidate goals ${scored} vs official ${award.goals}`);
    if (award.assists !== null && assisted !== award.assists) bootWarnings.push(`${award.award_category}: candidate assists ${assisted} vs official ${award.assists}`);
  }
  check("boot-goals-agree", "candidate goal/assist events agree with official Boot figures", bootWarnings, "WARN");

  // Identity prerequisites
  check("player-dob", "every player has a date of birth for identity resolution", bundle.players.filter((p) => p.date_of_birth === "").map((p) => `player ${p.player_id}`), "WARN");
  const dupNames = new Map<string, number>();
  for (const p of bundle.players) dupNames.set(foldName(p.player_name), (dupNames.get(foldName(p.player_name)) ?? 0) + 1);
  check(
    "player-names-unique",
    "player display names are unique (duplicates get deterministic slugs)",
    [...dupNames.entries()].filter(([, n]) => n > 1).map(([name, n]) => `${name} ×${n}`),
    "WARN",
  );
  check("no-substitutions", "source has no substitution events (Substitution stays blocked)", bundle.events.some((e) => (e.event_type as string) === "Substitution") ? ["substitution events present — review before enabling"] : [], "WARN");

  const blockers = checks.filter((c) => c.status === "FAIL" && c.severity === "BLOCKER");
  return { ok: blockers.length === 0, checks, blockers, knownConflicts: KNOWN_CONFLICTS };
}
