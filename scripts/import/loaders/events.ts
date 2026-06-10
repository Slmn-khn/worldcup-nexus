// Event import loaders (Checkpoint 4C): goals, bookings, substitutions,
// penalty kicks, awards. Each loader dedupes by sourceId, maps explicitly,
// and upserts so the import stays repeatable. Rows that cannot resolve a
// required relation are skipped with a warning — never satisfied with
// invented players/teams/matches.

import type { Prisma } from "../../../src/generated/prisma/client";
import type { RawRow } from "../utils/csv";
import { forEachLimit } from "../utils/csv";
import type { ScriptPrismaClient } from "../utils/db";
import { dedupeRows } from "../utils/dedupe";
import { cleanString } from "../utils/values";
import {
  awardSourceId,
  mapAward,
  mapBooking,
  mapGoal,
  mapPenaltyKick,
  mapSubstitution,
  type EventResolveContext,
  type MapResult,
} from "../mappers/events";

export type ImportReporter = {
  warn: (message: string) => void;
  skipRow: (dataset: string, reason: string) => void;
};

const UPSERT_CONCURRENCY = 8;

/** Shared loader shape: dedupe → map (skip/warn) → concurrent upserts. */
async function runEventImport<TData>(
  dataset: string,
  rows: RawRow[],
  reporter: ImportReporter,
  keyOf: (row: RawRow) => string | null,
  mapRow: (row: RawRow) => MapResult<TData>,
  upsert: (data: TData) => Promise<void>,
): Promise<number> {
  const deduped = dedupeRows(dataset, rows, keyOf, reporter.skipRow);
  const inputs: TData[] = [];
  for (const row of deduped) {
    const result = mapRow(row);
    if (!result.ok) {
      reporter.skipRow(dataset, result.reason);
      continue;
    }
    if (result.warning !== undefined) reporter.warn(result.warning);
    inputs.push(result.data);
  }
  let imported = 0;
  await forEachLimit(inputs, UPSERT_CONCURRENCY, async (data) => {
    await upsert(data);
    imported += 1;
  });
  return imported;
}

export async function importGoals(
  prisma: ScriptPrismaClient,
  rows: RawRow[],
  ctx: EventResolveContext,
  reporter: ImportReporter,
): Promise<number> {
  return runEventImport(
    "goals",
    rows,
    reporter,
    (row) => cleanString(row.goal_id),
    (row) => mapGoal(row, ctx),
    async (data: Prisma.GoalUncheckedCreateInput) => {
      await prisma.goal.upsert({
        where: { sourceId: data.sourceId ?? undefined },
        update: data,
        create: data,
      });
    },
  );
}

export async function importBookings(
  prisma: ScriptPrismaClient,
  rows: RawRow[],
  ctx: EventResolveContext,
  reporter: ImportReporter,
): Promise<number> {
  return runEventImport(
    "bookings",
    rows,
    reporter,
    (row) => cleanString(row.booking_id),
    (row) => mapBooking(row, ctx),
    async (data: Prisma.BookingUncheckedCreateInput) => {
      await prisma.booking.upsert({
        where: { sourceId: data.sourceId ?? undefined },
        update: data,
        create: data,
      });
    },
  );
}

export async function importSubstitutions(
  prisma: ScriptPrismaClient,
  rows: RawRow[],
  ctx: EventResolveContext,
  reporter: ImportReporter,
): Promise<number> {
  return runEventImport(
    "substitutions",
    rows,
    reporter,
    (row) => cleanString(row.substitution_id),
    (row) => mapSubstitution(row, ctx),
    async (data: Prisma.SubstitutionUncheckedCreateInput) => {
      await prisma.substitution.upsert({
        where: { sourceId: data.sourceId ?? undefined },
        update: data,
        create: data,
      });
    },
  );
}

export async function importPenaltyKicks(
  prisma: ScriptPrismaClient,
  rows: RawRow[],
  ctx: EventResolveContext,
  reporter: ImportReporter,
): Promise<number> {
  return runEventImport(
    "penalty_kicks",
    rows,
    reporter,
    (row) => cleanString(row.penalty_kick_id),
    (row) => mapPenaltyKick(row, ctx),
    async (data: Prisma.PenaltyKickUncheckedCreateInput) => {
      await prisma.penaltyKick.upsert({
        where: { sourceId: data.sourceId ?? undefined },
        update: data,
        create: data,
      });
    },
  );
}

export async function importAwards(
  prisma: ScriptPrismaClient,
  rows: RawRow[],
  ctx: EventResolveContext,
  reporter: ImportReporter,
): Promise<number> {
  return runEventImport(
    "award_winners",
    rows,
    reporter,
    (row) => awardSourceId(row),
    (row) => mapAward(row, ctx),
    async (data: Prisma.AwardUncheckedCreateInput) => {
      await prisma.award.upsert({
        where: { sourceId: data.sourceId ?? undefined },
        update: data,
        create: data,
      });
    },
  );
}
