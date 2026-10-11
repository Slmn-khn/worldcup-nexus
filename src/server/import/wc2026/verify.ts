// Verify step: query the database independently of the importer and re-run
// the mandatory 2026 invariants, plus a fingerprint of every non-2026 row the
// import could conceivably have touched. Read-only.

import type { PrismaClient } from "../../../generated/prisma/client";
import { CANDIDATE_NS, EXPECTED_STAGE_COUNTS, KNOCKOUT_STAGE_ORDER, sourceIdFor } from "./constants";
import type { ValidationCheck } from "./validate";

export type HistoricalFingerprint = Record<string, string | number>;

/**
 * Counts + content hashes of pre-2026 data. Compared before vs after a write:
 * any difference means the import touched historical records.
 */
export async function historicalFingerprint(prisma: PrismaClient): Promise<HistoricalFingerprint> {
  const rows = await prisma.$queryRawUnsafe<Record<string, bigint | number | string | null>[]>(`
    WITH old_t AS (SELECT id FROM "Tournament" WHERE year <> 2026),
         old_m AS (SELECT m.* FROM "Match" m WHERE m."tournamentId" IN (SELECT id FROM old_t))
    SELECT
      (SELECT count(*) FROM old_t) AS tournaments,
      (SELECT md5(coalesce(string_agg(t.id || ':' || t.year || ':' || t.name || ':' || coalesce(t."winnerTeamId",'') || ':' || coalesce(t."goalsCount"::text,''), ',' ORDER BY t.id), '')) FROM "Tournament" t WHERE t.year <> 2026) AS tournaments_hash,
      (SELECT count(*) FROM "Team" WHERE "tournamentId" IN (SELECT id FROM old_t)) AS teams,
      (SELECT count(*) FROM old_m) AS matches,
      (SELECT md5(coalesce(string_agg(id || ':' || "homeScore" || '-' || "awayScore" || ':' || coalesce("winningTeamId",'') || ':' || stage || ':' || coalesce("stadiumId",'') || ':' || coalesce("extraTime"::text,'') || ':' || coalesce("groupName",''), ',' ORDER BY id), '')) FROM old_m) AS matches_hash,
      (SELECT count(*) FROM "Goal" WHERE "matchId" IN (SELECT id FROM old_m)) AS goals,
      (SELECT count(*) FROM "Booking" WHERE "matchId" IN (SELECT id FROM old_m)) AS bookings,
      (SELECT count(*) FROM "Substitution" WHERE "matchId" IN (SELECT id FROM old_m)) AS substitutions,
      (SELECT count(*) FROM "PenaltyKick" WHERE "matchId" IN (SELECT id FROM old_m)) AS penalty_kicks,
      (SELECT count(*) FROM "SquadPlayer" WHERE "tournamentId" IN (SELECT id FROM old_t)) AS squad_players,
      (SELECT count(*) FROM "Award" WHERE "tournamentId" IN (SELECT id FROM old_t)) AS awards,
      (SELECT count(*) FROM "Player" WHERE "sourceId" IS NULL OR "sourceId" NOT LIKE '${CANDIDATE_NS}:%') AS players,
      (SELECT md5(coalesce(string_agg(id || ':' || name || ':' || slug || ':' || coalesce("countryId",'') || ':' || coalesce("dateOfBirth"::text,'') || ':' || coalesce(position,''), ',' ORDER BY id), '')) FROM "Player" WHERE "sourceId" IS NULL OR "sourceId" NOT LIKE '${CANDIDATE_NS}:%') AS players_hash,
      (SELECT md5(coalesce(string_agg(id || ':' || name || ':' || slug || ':' || coalesce(city,'') || ':' || coalesce(country,'') || ':' || coalesce(capacity::text,''), ',' ORDER BY id), '')) FROM "Stadium" WHERE "sourceId" IS NULL OR "sourceId" NOT LIKE '${CANDIDATE_NS}:%') AS stadiums_hash,
      (SELECT md5(coalesce(string_agg(id || ':' || name || ':' || slug || ':' || coalesce(country,''), ',' ORDER BY id), '')) FROM "Referee" WHERE "sourceId" IS NULL OR "sourceId" NOT LIKE '${CANDIDATE_NS}:%') AS referees_hash,
      (SELECT md5(coalesce(string_agg(id || ':' || name || ':' || slug || ':' || coalesce(code,'') || ':' || coalesce("fifaCode",''), ',' ORDER BY id), '')) FROM "Country" WHERE "sourceId" IS NULL OR "sourceId" NOT LIKE 'fifa:%') AS countries_hash
  `);
  const out: HistoricalFingerprint = {};
  for (const [key, value] of Object.entries(rows[0] ?? {})) {
    out[key] = typeof value === "bigint" ? Number(value) : (value ?? "");
  }
  return out;
}

export function compareFingerprints(before: HistoricalFingerprint, after: HistoricalFingerprint): string[] {
  return Object.keys({ ...before, ...after })
    .filter((key) => before[key] !== after[key])
    .map((key) => `${key}: ${before[key]} → ${after[key]}`);
}

export async function verifyDatabase(
  prisma: PrismaClient,
  options: { baseline: HistoricalFingerprint | null },
): Promise<{ ok: boolean; checks: ValidationCheck[] }> {
  const checks: ValidationCheck[] = [];
  const check = (id: string, description: string, failures: string[], known = false) =>
    checks.push({
      id,
      description,
      severity: "BLOCKER",
      status: failures.length === 0 ? "PASS" : known ? "KNOWN_CONFLICT" : "FAIL",
      ...(failures.length > 0 ? { detail: failures.slice(0, 20).join("; ") } : {}),
    });

  const tournament = await prisma.tournament.findUnique({ where: { year: 2026 } });
  if (tournament === null) {
    check("tournament", "tournament 2026 exists", ["missing"]);
    return { ok: false, checks };
  }
  const [teams, matches, squads, goals, kicks, awards, bookings, subs] = await Promise.all([
    prisma.team.findMany({ where: { tournamentId: tournament.id }, select: { id: true, name: true, slug: true, sourceId: true, countryId: true } }),
    prisma.match.findMany({ where: { tournamentId: tournament.id } }),
    prisma.squadPlayer.findMany({ where: { tournamentId: tournament.id }, select: { teamId: true, playerId: true } }),
    prisma.goal.findMany({ where: { match: { tournamentId: tournament.id } }, select: { matchId: true, teamId: true, playerId: true, isOwnGoal: true, assistPlayerId: true } }),
    prisma.penaltyKick.findMany({ where: { match: { tournamentId: tournament.id } }, select: { matchId: true, teamId: true, converted: true, type: true } }),
    prisma.award.findMany({ where: { tournamentId: tournament.id }, include: { player: { select: { name: true } }, team: { select: { name: true } } } }),
    prisma.booking.count({ where: { match: { tournamentId: tournament.id } } }),
    prisma.substitution.count({ where: { match: { tournamentId: tournament.id } } }),
  ]);
  const teamName = new Map(teams.map((t) => [t.id, t.name]));

  check("tournament-source", "tournament 2026 is the official-tier row", tournament.sourceId === sourceIdFor.tournament() && tournament.verificationStatus === "FIFA_OFFICIAL" ? [] : ["sourceId/verificationStatus"]);
  check("hosts", "hosts: Canada, Mexico, United States", tournament.hostCountries.join("|") === "Canada|Mexico|United States" ? [] : [tournament.hostCountries.join("|")]);
  check("teams", "48 participating teams, unique country per team", [
    ...(teams.length === 48 ? [] : [`${teams.length} teams`]),
    ...(new Set(teams.map((t) => t.countryId)).size === 48 ? [] : ["duplicate country"]),
    ...(teams.every((t) => t.countryId !== null) ? [] : ["team without country"]),
  ]);
  const groups = new Map<string, Set<string>>();
  for (const m of matches.filter((x) => x.stage === "group stage")) {
    const set = groups.get(m.groupName ?? "?") ?? new Set<string>();
    set.add(m.homeTeamId).add(m.awayTeamId);
    groups.set(m.groupName ?? "?", set);
  }
  check("groups", "12 groups A–L with 4 teams each", [
    ...([...groups.keys()].sort().join(",") === "ABCDEFGHIJKL".split("").map((l) => `Group ${l}`).join(",") ? [] : [[...groups.keys()].sort().join(",")]),
    ...[...groups.entries()].filter(([, set]) => set.size !== 4).map(([g, set]) => `${g}: ${set.size} teams`),
  ]);
  check("squad-players", "1,248 registered squad players, 26 per team", [
    ...(squads.length === 1248 ? [] : [`${squads.length}`]),
    ...teams.filter((t) => squads.filter((s) => s.teamId === t.id).length !== 26).map((t) => t.name),
  ]);
  check("matches", "104 matches", matches.length === 104 ? [] : [`${matches.length}`]);
  const stageCounts = new Map<string, number>();
  for (const m of matches) stageCounts.set(m.stage, (stageCounts.get(m.stage) ?? 0) + 1);
  check("stages", "stage distribution 72/16/8/4/2/1/1 with round of 32 first-class", Object.entries(EXPECTED_STAGE_COUNTS).flatMap(([s, n]) => (stageCounts.get(s) === n ? [] : [`${s}: ${stageCounts.get(s) ?? 0}`])));
  check("venues", "16 venues used", new Set(matches.map((m) => m.stadiumId)).size === 16 && matches.every((m) => m.stadiumId !== null) ? [] : ["venue count"]);
  check("match-shape", "every match: two distinct teams of this tournament, a stage and a venue", matches.filter((m) => m.homeTeamId === m.awayTeamId || !teamName.has(m.homeTeamId) || !teamName.has(m.awayTeamId) || m.stadiumId === null).map((m) => m.slug));
  const scoreTotal = matches.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0);
  check("goal-total", "308 total scoreline goals = 308 Goal rows = Tournament.goalsCount", [
    ...(scoreTotal === 308 ? [] : [`scores ${scoreTotal}`]),
    ...(goals.length === 308 ? [] : [`goal rows ${goals.length}`]),
    ...(tournament.goalsCount === 308 ? [] : [`goalsCount ${tournament.goalsCount}`]),
  ]);
  check("goals-reconcile", "goal + own-goal rows reconcile with every scoreline", matches.flatMap((m) => {
    const home = goals.filter((g) => g.matchId === m.id && g.teamId === m.homeTeamId).length;
    const away = goals.filter((g) => g.matchId === m.id && g.teamId === m.awayTeamId).length;
    return home === m.homeScore && away === m.awayScore ? [] : [`${m.slug}: ${home}-${away}`];
  }));
  check("shootouts", "shootout kicks reconcile with penalty scores and never count as goals", matches.flatMap((m) => {
    const k = kicks.filter((x) => x.matchId === m.id);
    if (k.some((x) => x.type !== "SHOOTOUT")) return [`${m.slug}: non-shootout kick`];
    if (!m.decidedByPenalties) return k.length === 0 ? [] : [`${m.slug}: kicks without shootout`];
    const home = k.filter((x) => x.teamId === m.homeTeamId && x.converted).length;
    const away = k.filter((x) => x.teamId === m.awayTeamId && x.converted).length;
    return home === m.homeScorePenalties && away === m.awayScorePenalties && m.homeScore === m.awayScore ? [] : [`${m.slug}`];
  }));
  const incomplete = matches.filter((m) => m.stage !== "group stage" && m.homeScore === m.awayScore && !m.decidedByPenalties);
  check(
    "knockout-outcomes",
    "knockout draws have a valid extra-time or shootout outcome",
    incomplete.map((m) => `${m.slug} (outcome NULL by design)`),
    incomplete.every((m) => m.sourceId === sourceIdFor.match(96) && m.winningTeamId === null && m.extraTime === null),
  );
  check("winners", "decided matches carry the correct winner", matches.flatMap((m) => {
    if (m.homeScore !== m.awayScore) return m.winningTeamId === (m.homeScore > m.awayScore ? m.homeTeamId : m.awayTeamId) ? [] : [m.slug];
    if (m.decidedByPenalties) return m.winningTeamId === (m.homeScorePenalties! > m.awayScorePenalties! ? m.homeTeamId : m.awayTeamId) ? [] : [m.slug];
    return m.winningTeamId === null ? [] : [m.slug];
  }));
  const final = matches.find((m) => m.stage === "final");
  check("final", "final: Spain 1–0 Argentina after extra time, 19 July 2026", [
    ...(final !== undefined && teamName.get(final.homeTeamId) === "Spain" && teamName.get(final.awayTeamId) === "Argentina" ? [] : ["teams"]),
    ...(final?.homeScore === 1 && final.awayScore === 0 ? [] : ["score"]),
    ...(final?.extraTime === true ? [] : ["extra time"]),
    ...(final?.matchDate?.toISOString().startsWith("2026-07-19") ? [] : ["date"]),
  ]);
  check("podium", "champion Spain, runner-up Argentina, third England, fourth France", [
    ...(teamName.get(tournament.winnerTeamId ?? "") === "Spain" ? [] : ["champion"]),
    ...(teamName.get(tournament.runnerUpTeamId ?? "") === "Argentina" ? [] : ["runner-up"]),
    ...(teamName.get(tournament.thirdPlaceTeamId ?? "") === "England" ? [] : ["third"]),
    ...(teamName.get(tournament.fourthPlaceTeamId ?? "") === "France" ? [] : ["fourth"]),
  ]);
  check("knockout-order", "knockout rounds present in order", KNOCKOUT_STAGE_ORDER.filter((s) => !stageCounts.has(s)).map((s) => `missing ${s}`));

  const expectedAwards: [string, string | null, string][] = [
    ["FIFA Fair Play Trophy", null, "Netherlands"],
    ["Golden Boot", "Kylian Mbappé", "France"],
    ["Silver Boot", "Lionel Messi", "Argentina"],
    ["Bronze Boot", "Jude Bellingham", "England"],
    ["Golden Glove", "Unai Simón", "Spain"],
    ["Golden Ball", "Rodri", "Spain"],
    ["Silver Ball", "Lionel Messi", "Argentina"],
    ["Bronze Ball", "Kylian Mbappé", "France"],
    ["Best Young Player", "Pau Cubarsí", "Spain"],
  ];
  check("awards", "official award set linked to canonical player/team profiles", [
    ...(awards.length === 9 ? [] : [`${awards.length} awards`]),
    ...expectedAwards.flatMap(([name, player, team]) => {
      const award = awards.find((a) => a.name === name);
      if (award === undefined) return [`missing ${name}`];
      const issues: string[] = [];
      if (award.team?.name !== team) issues.push(`${name} team ${award.team?.name}`);
      if (player !== null && award.player?.name !== player) issues.push(`${name} player ${award.player?.name ?? "NULL"}`);
      if (player === null && award.playerId !== null) issues.push(`${name} should be a team award`);
      if (award.verificationStatus !== "FIFA_OFFICIAL") issues.push(`${name} not FIFA_OFFICIAL`);
      return issues;
    }),
  ]);
  const golden = awards.find((a) => a.name === "Golden Boot");
  const goldenDetails = (golden?.details ?? {}) as Record<string, unknown>;
  const bronze = (awards.find((a) => a.name === "Bronze Boot")?.details ?? {}) as Record<string, unknown>;
  check("award-minutes", "FIFA official minutes kept on the Boot awards (769 / 698)", [
    ...(goldenDetails.minutes === 769 && goldenDetails.goals === 10 && goldenDetails.assists === 4 ? [] : ["Golden Boot details"]),
    ...(bronze.minutes === 698 ? [] : ["Bronze Boot minutes"]),
  ]);
  check("withheld", "no fabricated substitutions or unverified bookings for 2026", [
    ...(subs === 0 ? [] : [`${subs} substitutions`]),
    ...(bookings === 0 ? [] : [`${bookings} bookings`]),
  ]);
  const dupePlayers = await prisma.$queryRawUnsafe<{ n: bigint }[]>(`
    SELECT count(*) AS n FROM (
      SELECT p1.id FROM "Player" p1 JOIN "Player" p2
        ON p1.id < p2.id AND p1."dateOfBirth" = p2."dateOfBirth" AND p1."countryId" = p2."countryId"
       AND lower(p1.name) = lower(p2.name)
      WHERE p1."sourceId" LIKE '${CANDIDATE_NS}:%' OR p2."sourceId" LIKE '${CANDIDATE_NS}:%'
    ) d`);
  check("duplicate-players", "no duplicate player identities introduced (same DOB + country + name)", Number(dupePlayers[0]?.n ?? 0) === 0 ? [] : [`${dupePlayers[0]?.n} pairs`]);

  if (options.baseline !== null) {
    check("historical-unchanged", "1930–2022 records unchanged by the import", compareFingerprints(options.baseline, await historicalFingerprint(prisma)));
  } else {
    checks.push({ id: "historical-unchanged", description: "1930–2022 records unchanged by the import", severity: "BLOCKER", status: "WARN", detail: "no pre-import baseline recorded" });
  }

  return { ok: checks.every((c) => c.status !== "FAIL"), checks };
}
