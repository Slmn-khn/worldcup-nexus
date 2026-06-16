// Read-side query layer for the 2026 fixture feature. Every function reads
// from PostgreSQL only — no external providers are ever called here. Results
// are canonical (one row per logical match) and returned as serializable DTOs.
//
// At ~104 matches × ≤2 sources, loading all 2026 rows and deduping in memory is
// cheap and keeps the canonical-merge logic in one tested place.

import { prisma } from "@/server/db/prisma";
import { isoDateInZone, zonedDayRangeUtc } from "@/lib/date";
import {
  DEFAULT_LIST_LIMIT,
  FIXTURE_SELECT,
  MAX_LIST_LIMIT,
  TOURNAMENT_YEAR_2026,
} from "./constants";
import { getFreshness } from "./freshness";
import {
  compareKickoffAsc,
  fixtureDateKey,
  fixtureToDto,
  isKickoffPast,
  selectCanonicalFixtures,
} from "./normalize";
import type {
  FixtureDto,
  FixtureFreshness,
  FixtureStatusValue,
  StoredFixture,
} from "./types";

function clampLimit(limit: number | undefined, fallback: number): number {
  if (limit === undefined || !Number.isFinite(limit)) return fallback;
  return Math.max(1, Math.min(MAX_LIST_LIMIT, Math.floor(limit)));
}

/** Loads all 2026 rows and reduces them to canonical fixtures, kick-off asc. */
async function loadCanonical2026(): Promise<StoredFixture[]> {
  const rows = (await prisma.fixture.findMany({
    where: { tournamentYear: TOURNAMENT_YEAR_2026 },
    select: FIXTURE_SELECT,
  })) as StoredFixture[];
  return selectCanonicalFixtures(rows).sort(compareKickoffAsc);
}

function isLive(row: StoredFixture): boolean {
  return row.status === "LIVE" || row.status === "HALF_TIME";
}

function hasScore(row: StoredFixture): boolean {
  return row.homeScore !== null && row.awayScore !== null;
}

function isFinished(row: StoredFixture, now: Date): boolean {
  if (row.status === "FINISHED") return true;
  return (
    hasScore(row) &&
    isKickoffPast(row.kickoffAtUtc, row.kickoffDateLabel, now) === true
  );
}

function isUpcoming(row: StoredFixture, now: Date): boolean {
  if (isLive(row) || isFinished(row, now)) return false;
  const past = isKickoffPast(row.kickoffAtUtc, row.kickoffDateLabel, now);
  return past !== true; // future or same-day-undecided, not yet played
}

/** Live + recent results + upcoming, blended — the homepage "Latest" view. */
export async function getLatestFixtures2026(options?: {
  limit?: number;
  now?: Date;
}): Promise<FixtureDto[]> {
  const now = options?.now ?? new Date();
  const limit = clampLimit(options?.limit, DEFAULT_LIST_LIMIT);
  const canonical = await loadCanonical2026();

  const live = canonical.filter(isLive);
  const recent = canonical
    .filter((row) => isFinished(row, now))
    .sort((a, b) => compareKickoffAsc(b, a));
  const upcoming = canonical.filter((row) => isUpcoming(row, now));

  const blended: StoredFixture[] = [];
  const seen = new Set<string>();
  for (const row of [...live, ...recent.slice(0, limit), ...upcoming]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    blended.push(row);
    if (blended.length >= limit) break;
  }
  return blended.map(fixtureToDto);
}

export async function getLiveFixtures2026(): Promise<FixtureDto[]> {
  const canonical = await loadCanonical2026();
  return canonical.filter(isLive).map(fixtureToDto);
}

export async function getTodayFixtures2026(options?: {
  now?: Date;
  timeZone?: string;
}): Promise<FixtureDto[]> {
  const now = options?.now ?? new Date();
  const timeZone = options?.timeZone ?? "UTC";
  return fixturesOnDay(now, timeZone);
}

export async function getTomorrowFixtures2026(options?: {
  now?: Date;
  timeZone?: string;
}): Promise<FixtureDto[]> {
  const now = options?.now ?? new Date();
  const timeZone = options?.timeZone ?? "UTC";
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return fixturesOnDay(tomorrow, timeZone);
}

async function fixturesOnDay(
  instant: Date,
  timeZone: string,
): Promise<FixtureDto[]> {
  const { from, to } = zonedDayRangeUtc(instant, timeZone);
  const dayKey = isoDateInZone(instant, timeZone);
  const canonical = await loadCanonical2026();
  return canonical
    .filter((row) => {
      if (row.kickoffAtUtc !== null) {
        return row.kickoffAtUtc >= from && row.kickoffAtUtc < to;
      }
      return fixtureDateKey(row) === dayKey;
    })
    .map(fixtureToDto);
}

export async function getRecentResults2026(options?: {
  limit?: number;
  now?: Date;
}): Promise<FixtureDto[]> {
  const now = options?.now ?? new Date();
  const limit = clampLimit(options?.limit, DEFAULT_LIST_LIMIT);
  const canonical = await loadCanonical2026();
  return canonical
    .filter((row) => isFinished(row, now))
    .sort((a, b) => compareKickoffAsc(b, a))
    .slice(0, limit)
    .map(fixtureToDto);
}

export async function getUpcomingFixtures2026(options?: {
  limit?: number;
  now?: Date;
}): Promise<FixtureDto[]> {
  const now = options?.now ?? new Date();
  const limit = clampLimit(options?.limit, DEFAULT_LIST_LIMIT);
  const canonical = await loadCanonical2026();
  return canonical
    .filter((row) => isUpcoming(row, now))
    .sort(compareKickoffAsc)
    .slice(0, limit)
    .map(fixtureToDto);
}

export async function getFixtures2026ByDateRange(options: {
  from: Date;
  to: Date;
  status?: FixtureStatusValue;
  groupName?: string;
  stage?: string;
}): Promise<FixtureDto[]> {
  const fromKey = isoDateInZone(options.from, "UTC");
  const toKey = isoDateInZone(options.to, "UTC");
  const canonical = await loadCanonical2026();
  return canonical
    .filter((row) => {
      const inRange =
        row.kickoffAtUtc !== null
          ? row.kickoffAtUtc >= options.from && row.kickoffAtUtc < options.to
          : matchesDateKeyRange(fixtureDateKey(row), fromKey, toKey);
      if (!inRange) return false;
      if (options.status !== undefined && row.status !== options.status) {
        return false;
      }
      if (
        options.groupName !== undefined &&
        row.groupName?.toLowerCase() !== options.groupName.toLowerCase()
      ) {
        return false;
      }
      if (
        options.stage !== undefined &&
        row.stage?.toLowerCase() !== options.stage.toLowerCase()
      ) {
        return false;
      }
      return true;
    })
    .sort(compareKickoffAsc)
    .map(fixtureToDto);
}

function matchesDateKeyRange(
  dateKey: string | null,
  fromKey: string,
  toKey: string,
): boolean {
  if (dateKey === null) return false;
  return dateKey >= fromKey && dateKey < toKey;
}

/** Whole-tournament schedule (all canonical fixtures), kick-off ascending. */
export async function getSchedule2026(options?: {
  status?: FixtureStatusValue;
  groupName?: string;
  stage?: string;
  q?: string;
}): Promise<FixtureDto[]> {
  const canonical = await loadCanonical2026();
  const q = options?.q?.trim().toLowerCase();
  return canonical
    .filter((row) => {
      if (options?.status !== undefined && row.status !== options.status) {
        return false;
      }
      if (
        options?.groupName !== undefined &&
        row.groupName?.toLowerCase() !== options.groupName.toLowerCase()
      ) {
        return false;
      }
      if (
        options?.stage !== undefined &&
        row.stage?.toLowerCase() !== options.stage.toLowerCase()
      ) {
        return false;
      }
      if (q !== undefined && q !== "") {
        const haystack = [
          row.homeTeamName,
          row.awayTeamName,
          row.venueName,
          row.cityName,
          row.groupName,
          row.stage,
        ]
          .filter((part): part is string => part !== null)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    })
    .sort(compareKickoffAsc)
    .map(fixtureToDto);
}

/** Distinct group/stage/status options for the schedule filters (from DB). */
export async function getScheduleFilterMeta2026(): Promise<{
  groups: { label: string; value: string }[];
  stages: { label: string; value: string }[];
  statuses: { label: string; value: FixtureStatusValue }[];
  total: number;
}> {
  const canonical = await loadCanonical2026();
  const groups = distinct(
    canonical.map((row) => row.groupName).filter(isNonEmpty),
  );
  const stages = distinct(canonical.map((row) => row.stage).filter(isNonEmpty));
  const statuses = distinct(
    canonical.map((row) => row.status as string),
  ) as FixtureStatusValue[];

  return {
    groups: groups.map((value) => ({ label: value, value })),
    stages: stages.map((value) => ({ label: value, value })),
    statuses: statuses.map((value) => ({ label: titleCase(value), value })),
    total: canonical.length,
  };
}

export async function getFixtureFreshness2026(
  now: Date = new Date(),
): Promise<FixtureFreshness> {
  const latest = await prisma.fixture.findFirst({
    where: { tournamentYear: TOURNAMENT_YEAR_2026 },
    orderBy: { lastSyncedAt: "desc" },
    select: { lastSyncedAt: true },
  });
  return getFreshness(latest?.lastSyncedAt ?? null, now);
}

/** One canonical-load powering all homepage fixture tabs. */
export async function getHomeFixtures2026(options?: {
  now?: Date;
  limit?: number;
}): Promise<{
  latest: FixtureDto[];
  live: FixtureDto[];
  today: FixtureDto[];
  results: FixtureDto[];
  upcoming: FixtureDto[];
  nextUpcoming: FixtureDto | null;
  freshness: FixtureFreshness;
}> {
  const now = options?.now ?? new Date();
  const limit = clampLimit(options?.limit, 8);
  const [canonical, freshness] = await Promise.all([
    loadCanonical2026(),
    getFixtureFreshness2026(now),
  ]);

  const { from, to } = zonedDayRangeUtc(now, "UTC");
  const todayKey = isoDateInZone(now, "UTC");
  const onToday = (row: StoredFixture) =>
    row.kickoffAtUtc !== null
      ? row.kickoffAtUtc >= from && row.kickoffAtUtc < to
      : fixtureDateKey(row) === todayKey;

  const live = canonical.filter(isLive);
  const today = canonical.filter(onToday);
  const results = canonical
    .filter((row) => isFinished(row, now))
    .sort((a, b) => compareKickoffAsc(b, a));
  const upcoming = canonical
    .filter((row) => isUpcoming(row, now))
    .sort(compareKickoffAsc);

  const blended: StoredFixture[] = [];
  const seen = new Set<string>();
  for (const row of [...live, ...results.slice(0, limit), ...upcoming]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    blended.push(row);
    if (blended.length >= limit) break;
  }

  return {
    latest: blended.map(fixtureToDto),
    live: live.map(fixtureToDto),
    today: today.map(fixtureToDto),
    results: results.slice(0, limit).map(fixtureToDto),
    upcoming: upcoming.slice(0, limit).map(fixtureToDto),
    nextUpcoming: upcoming.length > 0 ? fixtureToDto(upcoming[0]) : null,
    freshness,
  };
}

function isNonEmpty(value: string | null): value is string {
  return value !== null && value.trim() !== "";
}

function distinct(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
