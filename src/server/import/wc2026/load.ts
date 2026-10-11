// Load step: execute an ImportPlan in dependency order with bounded,
// checkpointed batches. Each batch is ONE short array transaction (never an
// interactive transaction spanning a phase — the 5 s interactive timeout is
// what broke the previous 2026 importer). Every write is an upsert on a
// namespaced natural key, so re-running converges and a failed run can resume.
//
// Order: countries → tournament → teams → stadiums → referees → players →
// squadPlayers → matches → goals → shootoutKicks → awards → placings → raw.
// Existing canonical rows (linked players/stadiums/referees/countries) are
// only referenced, never updated.

import type { Prisma, PrismaClient } from "../../../generated/prisma/client";
import { BUNDLE_FILES, type ParsedBundle } from "./bundle";
import { CANDIDATE_DATASET_URL, IMPORT_SOURCE, TRANSACTION_MAX_WAIT_MS, sourceIdFor } from "./constants";
import type { ImportPlan } from "./plan";
import type { StagedBundle } from "./stage";

export const LOAD_ENTITIES = [
  "countries",
  "tournament",
  "teams",
  "stadiums",
  "referees",
  "players",
  "squadPlayers",
  "matches",
  "goals",
  "shootoutKicks",
  "awards",
  "placings",
  "rawRecords",
] as const;
export type LoadEntity = (typeof LOAD_ENTITIES)[number];

export type EntityCounts = { written: number; skippedByCheckpoint: number; linked: number; conflicts: number };

export type LoadContext = {
  prisma: PrismaClient;
  bundle: ParsedBundle;
  staged: StagedBundle;
  plan: ImportPlan;
  runId: string;
  batchSize: number;
  /** Timeout for each batch's transaction (ms). */
  transactionTimeoutMs: number;
  resume: boolean;
  acceptOfficialChanges: boolean;
  /** Testing aid (local targets only): throw after this many rows of an entity. */
  simulateFailureAt?: { entity: LoadEntity; rows: number };
  log: (line: string) => void;
};

export class SimulatedFailure extends Error {
  constructor(entity: string, rows: number) {
    super(`Simulated failure after ${rows} committed ${entity} rows`);
    this.name = "SimulatedFailure";
  }
}

type Checkpoint = { rowsCompleted: number; completed: boolean };

async function readCheckpoints(ctx: LoadContext): Promise<Map<string, Checkpoint>> {
  const rows = await ctx.prisma.dataImportCheckpoint.findMany({
    where: { source: IMPORT_SOURCE, sourceChecksum: ctx.bundle.manifestSha256 },
  });
  return new Map(rows.map((r) => [r.entity, { rowsCompleted: r.rowsCompleted, completed: r.completed }]));
}

async function saveCheckpoint(ctx: LoadContext, entity: string, rowsCompleted: number, completed: boolean) {
  const key = { source: IMPORT_SOURCE, sourceChecksum: ctx.bundle.manifestSha256, entity };
  await ctx.prisma.dataImportCheckpoint.upsert({
    where: { source_sourceChecksum_entity: key },
    create: { ...key, runId: ctx.runId, rowsCompleted, completed },
    update: { runId: ctx.runId, rowsCompleted, completed },
  });
  // Heartbeat for the concurrent-run guard.
  await ctx.prisma.dataImportRun.update({ where: { id: ctx.runId }, data: { status: "RUNNING" } });
}

/**
 * Run `ops` for one entity in batches. Each op returns a Prisma promise; a
 * batch is executed as one array transaction and checkpointed afterwards.
 */
async function runBatches(
  ctx: LoadContext,
  entity: LoadEntity,
  checkpoints: Map<string, Checkpoint>,
  ops: (() => Prisma.PrismaPromise<unknown>)[],
  counts: Record<string, EntityCounts>,
) {
  const entry = (counts[entity] ??= { written: 0, skippedByCheckpoint: 0, linked: 0, conflicts: 0 });
  const checkpoint = ctx.resume ? checkpoints.get(entity) : undefined;
  if (checkpoint?.completed) {
    entry.skippedByCheckpoint += ops.length;
    ctx.log(`  ${entity.padEnd(14)} checkpoint complete — skipped ${ops.length}`);
    return;
  }
  const start = checkpoint?.rowsCompleted ?? 0;
  entry.skippedByCheckpoint += start;
  const started = Date.now();
  let batchNo = 0;
  for (let offset = start; offset < ops.length; offset += ctx.batchSize) {
    batchNo += 1;
    const slice = ops.slice(offset, offset + ctx.batchSize).map((op) => op());
    await ctx.prisma.$transaction(slice, { maxWait: TRANSACTION_MAX_WAIT_MS, timeout: ctx.transactionTimeoutMs });
    const done = Math.min(offset + ctx.batchSize, ops.length);
    entry.written += slice.length;
    await saveCheckpoint(ctx, entity, done, done === ops.length);
    if (ctx.simulateFailureAt?.entity === entity && done >= ctx.simulateFailureAt.rows && done < ops.length) {
      throw new SimulatedFailure(entity, done);
    }
  }
  if (ops.length === 0 || start >= ops.length) await saveCheckpoint(ctx, entity, ops.length, true);
  ctx.log(`  ${entity.padEnd(14)} wrote ${String(entry.written).padStart(5)} in ${batchNo} batch(es), resumed from ${start}, ${Date.now() - started} ms`);
}

async function idMap(
  rows: Promise<{ id: string; sourceId: string | null }[]>,
): Promise<Map<string, string>> {
  return new Map((await rows).filter((r) => r.sourceId !== null).map((r) => [r.sourceId!, r.id]));
}

function asDate(iso: string | null): Date | null {
  return iso === null ? null : new Date(iso.length === 10 ? `${iso}T00:00:00.000Z` : iso);
}

/** Stable serialisation: JSONB does not preserve object key order. */
export function canonicalJson(value: unknown): string {
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

/** Field-by-field comparison for official rows (never silently overwritten). */
export function officialDiff(existing: Record<string, unknown>, next: Record<string, unknown>): string[] {
  const diffs: string[] = [];
  for (const [key, value] of Object.entries(next)) {
    const a = canonicalJson(existing[key]);
    const b = canonicalJson(value);
    if (a !== b) diffs.push(`${key}: ${a} → ${b}`);
  }
  return diffs;
}

export type LoadResult = {
  counts: Record<string, EntityCounts>;
  officialConflicts: string[];
};

export async function loadPlan(ctx: LoadContext): Promise<LoadResult> {
  const { prisma, plan, staged, bundle } = ctx;
  const counts: Record<string, EntityCounts> = {};
  const officialConflicts: string[] = [];
  const checkpoints = await readCheckpoints(ctx);
  if (!ctx.resume) {
    for (const entity of LOAD_ENTITIES) checkpoints.delete(entity);
  }

  // 1. Countries (new nations only; existing rows are linked, not touched) ---
  const newCountries = plan.countries.filter((c) => c.op === "create");
  await runBatches(ctx, "countries", checkpoints, newCountries.map((c) => () =>
    prisma.country.upsert({
      where: { sourceId: c.sourceId },
      create: { sourceId: c.sourceId, name: c.name, slug: c.slug, code: c.code, fifaCode: c.fifaCode },
      update: { name: c.name, code: c.code, fifaCode: c.fifaCode },
    }),
  ), counts);
  counts.countries!.linked = plan.countries.length - newCountries.length;
  const createdCountries = await idMap(prisma.country.findMany({ where: { sourceId: { in: newCountries.map((c) => c.sourceId) } }, select: { id: true, sourceId: true } }));
  const countryIdByFifa = new Map(
    plan.countries.map((c) => [c.fifaCode, c.op === "link" ? c.countryId : createdCountries.get(c.sourceId)!]),
  );

  // 2. Tournament (official tier) ---------------------------------------------
  const t = staged.tournament;
  const tournamentData = {
    year: 2026,
    name: t.name,
    slug: "2026",
    hostName: t.hostCountries.join(", "),
    hostCountries: t.hostCountries,
    startDate: asDate(t.startDate),
    endDate: asDate(t.endDate),
    teamsCount: t.teamsCount,
    matchesCount: t.matchesCount,
    goalsCount: t.goalsCount,
    attendance: t.attendance,
    sourceUrl: t.sourceUrl,
    verificationStatus: "FIFA_OFFICIAL",
  };
  const existingTournament = await prisma.tournament.findUnique({ where: { sourceId: sourceIdFor.tournament() } });
  const tournamentDiffs =
    existingTournament === null ? [] : officialDiff(existingTournament as unknown as Record<string, unknown>, tournamentData);
  if (tournamentDiffs.length > 0 && !ctx.acceptOfficialChanges) {
    officialConflicts.push(`Tournament 2026 official fields differ from the database (kept DB values): ${tournamentDiffs.join("; ")}`);
  }
  const writeTournament = tournamentDiffs.length === 0 || ctx.acceptOfficialChanges;
  await runBatches(ctx, "tournament", checkpoints, writeTournament ? [() =>
    prisma.tournament.upsert({
      where: { sourceId: sourceIdFor.tournament() },
      create: { sourceId: sourceIdFor.tournament(), ...tournamentData },
      update: tournamentData,
    }),
  ] : [], counts);
  const tournament = await prisma.tournament.findUniqueOrThrow({ where: { sourceId: sourceIdFor.tournament() }, select: { id: true } });

  // 3. Teams ------------------------------------------------------------------
  await runBatches(ctx, "teams", checkpoints, plan.teams.map((team) => () => {
    const data = { tournamentId: tournament.id, countryId: countryIdByFifa.get(team.fifaCode) ?? null, name: team.name, slug: team.slug, code: team.code };
    return prisma.team.upsert({ where: { sourceId: team.sourceId }, create: { sourceId: team.sourceId, ...data }, update: data });
  }), counts);
  const teamIds = await idMap(prisma.team.findMany({ where: { sourceId: { in: plan.teams.map((x) => x.sourceId) } }, select: { id: true, sourceId: true } }));
  const teamId = (srcId: number) => teamIds.get(sourceIdFor.team(srcId))!;

  // 4. Stadiums ---------------------------------------------------------------
  const venueUpserts = plan.venues.flatMap((v) => (v.op === "upsert" ? [v] : []));
  await runBatches(ctx, "stadiums", checkpoints, venueUpserts.map((v) => () => {
    const data = { name: v.name, slug: v.slug, city: v.city, country: v.country, capacity: v.capacity, latitude: v.latitude, longitude: v.longitude };
    return prisma.stadium.upsert({ where: { sourceId: v.sourceId }, create: { sourceId: v.sourceId, ...data }, update: data });
  }), counts);
  counts.stadiums!.linked = plan.venues.length - venueUpserts.length;
  const stadiumCreated = await idMap(prisma.stadium.findMany({ where: { sourceId: { in: venueUpserts.map((v) => v.sourceId) } }, select: { id: true, sourceId: true } }));
  const stadiumId = new Map(plan.venues.map((v) => [v.srcId, v.op === "link" ? v.stadiumId : stadiumCreated.get(v.sourceId)!]));

  // 5. Referees ---------------------------------------------------------------
  const refereeUpserts = plan.referees.flatMap((r) => (r.op === "upsert" ? [r] : []));
  await runBatches(ctx, "referees", checkpoints, refereeUpserts.map((r) => () => {
    const data = { name: r.name, slug: r.slug, country: r.country };
    return prisma.referee.upsert({ where: { sourceId: r.sourceId }, create: { sourceId: r.sourceId, ...data }, update: data });
  }), counts);
  counts.referees!.linked = plan.referees.length - refereeUpserts.length;
  const refereeCreated = await idMap(prisma.referee.findMany({ where: { sourceId: { in: refereeUpserts.map((r) => r.sourceId) } }, select: { id: true, sourceId: true } }));
  const refereeId = new Map(plan.referees.map((r) => [r.srcId, r.op === "link" ? r.refereeId : refereeCreated.get(r.sourceId)!]));

  // 6. Players (new people only; linked canonical players untouched) ---------
  const teamFifa = new Map(plan.teams.map((x) => [x.srcId, x.fifaCode]));
  const playerUpserts = plan.players.flatMap((p) => (p.op === "upsert" ? [p] : []));
  await runBatches(ctx, "players", checkpoints, playerUpserts.map((p) => () => {
    const countryId = countryIdByFifa.get(teamFifa.get(p.teamSrcId)!) ?? null;
    const data = { name: p.name, countryId, position: p.position, dateOfBirth: asDate(p.dateOfBirth) };
    return prisma.player.upsert({
      where: { sourceId: p.sourceId },
      create: { sourceId: p.sourceId, slug: p.slug, ...data },
      update: data,
    });
  }), counts);
  counts.players!.linked = plan.players.length - playerUpserts.length;
  const playerCreated = await idMap(prisma.player.findMany({ where: { sourceId: { in: playerUpserts.map((p) => p.sourceId) } }, select: { id: true, sourceId: true } }));
  const playerIdBySrc = new Map(plan.players.map((p) => [p.srcId, p.op === "link" ? p.playerId : playerCreated.get(p.sourceId)!]));
  const playerId = (srcId: number) => playerIdBySrc.get(srcId)!;

  // 7. Squad players ----------------------------------------------------------
  await runBatches(ctx, "squadPlayers", checkpoints, staged.players.map((p) => () => {
    const key = { tournamentId: tournament.id, teamId: teamId(p.teamSrcId), playerId: playerId(p.srcId) };
    const data = { shirtNumber: p.shirtNumber, position: p.position };
    return prisma.squadPlayer.upsert({ where: { tournamentId_teamId_playerId: key }, create: { ...key, ...data }, update: data });
  }), counts);

  // 8. Matches ----------------------------------------------------------------
  const teamSlug = new Map(plan.teams.map((x) => [x.srcId, x.slug]));
  await runBatches(ctx, "matches", checkpoints, staged.matches.map((m) => () => {
    const sourceId = sourceIdFor.match(m.srcId);
    const data = {
      tournamentId: tournament.id,
      homeTeamId: teamId(m.homeSrcId),
      awayTeamId: teamId(m.awaySrcId),
      winningTeamId: m.winnerSrcId === null ? null : teamId(m.winnerSrcId),
      slug: `m-2026-${m.matchNumber}-${teamSlug.get(m.homeSrcId)}-vs-${teamSlug.get(m.awaySrcId)}`,
      stage: m.stage,
      groupName: m.groupName,
      matchDate: asDate(m.kickoffUtc),
      matchNumber: m.matchNumber,
      stadiumId: stadiumId.get(m.venueSrcId) ?? null,
      refereeId: m.refereeSrcId === null ? null : (refereeId.get(m.refereeSrcId) ?? null),
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      homeScorePenalties: m.homeScorePenalties,
      awayScorePenalties: m.awayScorePenalties,
      decidedByPenalties: m.decidedByPenalties,
      extraTime: m.extraTime,
    };
    return prisma.match.upsert({ where: { sourceId }, create: { sourceId, ...data }, update: data });
  }), counts);
  const matchIds = await idMap(prisma.match.findMany({ where: { tournamentId: tournament.id }, select: { id: true, sourceId: true } }));
  const matchId = (srcId: number) => matchIds.get(sourceIdFor.match(srcId))!;

  // 9. Goals (assists folded in; own goals credited to the beneficiary) -----
  await runBatches(ctx, "goals", checkpoints, staged.goals.map((g) => () => {
    const sourceId = sourceIdFor.goal(g.eventId);
    const data = {
      matchId: matchId(g.matchSrcId),
      teamId: teamId(g.teamSrcId),
      playerId: playerId(g.playerSrcId),
      assistPlayerId: g.assistPlayerSrcId === null ? null : playerId(g.assistPlayerSrcId),
      minute: g.minute,
      isOwnGoal: g.isOwnGoal,
    };
    return prisma.goal.upsert({ where: { sourceId }, create: { sourceId, ...data }, update: data });
  }), counts);

  // 10. Shootout kicks (type SHOOTOUT — never counted as goals) -------------
  await runBatches(ctx, "shootoutKicks", checkpoints, staged.shootoutKicks.map((k) => () => {
    const sourceId = sourceIdFor.shootoutKick(k.eventId);
    const data = {
      matchId: matchId(k.matchSrcId),
      teamId: teamId(k.teamSrcId),
      playerId: playerId(k.playerSrcId),
      type: "SHOOTOUT" as const,
      order: k.order,
      converted: k.converted,
    };
    return prisma.penaltyKick.upsert({ where: { sourceId }, create: { sourceId, ...data }, update: data });
  }), counts);

  // 11. Awards (official tier; existing differing rows are never overwritten)
  const existingAwards = new Map(
    (await prisma.award.findMany({ where: { tournamentId: tournament.id } })).map((a) => [a.sourceId, a]),
  );
  const awardOps = staged.awards.flatMap((a) => {
    const sourceId = sourceIdFor.award(a.slug);
    const data = {
      tournamentId: tournament.id,
      playerId: a.playerSrcId === null ? null : playerId(a.playerSrcId),
      teamId: teamId(a.teamSrcId),
      name: a.name,
      rank: a.rank,
      sourceUrl: a.sourceUrl,
      verificationStatus: "FIFA_OFFICIAL",
      details: a.details,
    };
    const existing = existingAwards.get(sourceId);
    if (existing !== undefined) {
      const diffs = officialDiff(existing as unknown as Record<string, unknown>, data);
      if (diffs.length > 0 && !ctx.acceptOfficialChanges) {
        officialConflicts.push(`Award ${a.name} differs from the database (kept DB values): ${diffs.join("; ")}`);
        return [];
      }
    }
    return [() => prisma.award.upsert({ where: { sourceId }, create: { sourceId, ...data }, update: data })];
  });
  await runBatches(ctx, "awards", checkpoints, awardOps, counts);
  counts.awards!.conflicts = staged.awards.length - awardOps.length;

  // 12. Placings (official podium) --------------------------------------------
  const placings = {
    winnerTeamId: teamId(t.championSrcId),
    runnerUpTeamId: teamId(t.runnerUpSrcId),
    thirdPlaceTeamId: teamId(t.thirdSrcId),
    fourthPlaceTeamId: teamId(t.fourthSrcId),
  };
  const placingDiffs =
    existingTournament === null || existingTournament.winnerTeamId === null
      ? []
      : officialDiff(existingTournament as unknown as Record<string, unknown>, placings);
  if (placingDiffs.length > 0 && !ctx.acceptOfficialChanges) {
    officialConflicts.push(`Tournament 2026 podium differs from the database (kept DB values): ${placingDiffs.join("; ")}`);
  }
  const writePlacings = placingDiffs.length === 0 || ctx.acceptOfficialChanges;
  await runBatches(ctx, "placings", checkpoints, writePlacings ? [() =>
    prisma.tournament.update({ where: { id: tournament.id }, data: placings }),
  ] : [], counts);

  // 13. Raw source records (append-only per checksum; includes withheld data)
  const retrievedAt = new Date("2026-10-11T00:00:00.000Z");
  const rawKeyFields: Record<string, string[]> = {
    tournament: ["year"], awards: ["award_category"], teams: ["team_id"], venues: ["venue_id"], stages: ["stage_id"],
    referees: ["referee_id"], matches: ["match_id"], players: ["player_id"], events: ["event_id"], lineups: ["lineup_id"], teamStats: ["match_id", "team_id"],
  };
  const rawRows: Prisma.RawSourceRecordCreateManyInput[] = [];
  for (const [key, fields] of Object.entries(rawKeyFields)) {
    const file = BUNDLE_FILES[key as keyof typeof BUNDLE_FILES];
    const official = file.startsWith("01_");
    for (const row of bundle.raw[key as keyof typeof bundle.raw]) {
      rawRows.push({
        source: IMPORT_SOURCE,
        entityType: key,
        sourceId: `${key}:${fields.map((f) => row[f]).join(":")}`,
        payload: row,
        sourceUrl: official ? (row.source_url ?? null) : CANDIDATE_DATASET_URL,
        sourceChecksum: bundle.fileSha256[file]!,
        retrievedAt,
        importRunId: ctx.runId,
      });
    }
  }
  // Reconciliation decisions: candidate player id → canonical player, with the
  // method used. Lets legacy /tournaments/2026/players/<id> URLs redirect and
  // makes every identity merge auditable.
  for (const op of plan.players) {
    const canonicalPlayerId = playerIdBySrc.get(op.srcId) ?? null;
    rawRows.push({
      source: IMPORT_SOURCE,
      entityType: "playerIdentity",
      sourceId: `playerIdentity:${op.srcId}`,
      payload: {
        candidatePlayerId: op.srcId,
        candidateName: op.candidateName,
        canonicalPlayerId,
        method: op.op === "link" ? op.method : op.exists ? "existing2026" : "created",
        ...(op.op === "link" ? { canonicalName: op.canonicalName } : { storedName: op.name, nameIncomplete: op.nameIncomplete }),
      },
      sourceUrl: CANDIDATE_DATASET_URL,
      sourceChecksum: bundle.fileSha256[BUNDLE_FILES.players]!,
      retrievedAt,
      importRunId: ctx.runId,
    });
  }
  const existingRaw = new Set(
    (
      await prisma.rawSourceRecord.findMany({
        where: { source: IMPORT_SOURCE, sourceChecksum: { in: Object.values(bundle.fileSha256) } },
        select: { entityType: true, sourceId: true, sourceChecksum: true },
      })
    ).map((r) => `${r.entityType}|${r.sourceId}|${r.sourceChecksum}`),
  );
  const missingRaw = rawRows.filter((r) => !existingRaw.has(`${r.entityType}|${r.sourceId}|${r.sourceChecksum}`));
  const rawChunks: Prisma.RawSourceRecordCreateManyInput[][] = [];
  for (let i = 0; i < missingRaw.length; i += 500) rawChunks.push(missingRaw.slice(i, i + 500));
  // Raw inserts are append-only and skip-if-present, so a checkpoint offset is
  // unnecessary; each chunk is still its own short statement.
  const rawCounts = (counts.rawRecords ??= { written: 0, skippedByCheckpoint: 0, linked: 0, conflicts: 0 });
  for (const chunk of rawChunks) {
    await prisma.rawSourceRecord.createMany({ data: chunk });
    rawCounts.written += chunk.length;
  }
  rawCounts.skippedByCheckpoint = rawRows.length - missingRaw.length;
  await saveCheckpoint(ctx, "rawRecords", rawRows.length, true);
  ctx.log(`  rawRecords     wrote ${String(rawCounts.written).padStart(5)} (already present: ${rawCounts.skippedByCheckpoint})`);

  return { counts, officialConflicts };
}
