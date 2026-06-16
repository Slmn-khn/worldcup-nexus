// Tunable constants for the 2026 fixture pipeline.

import type { FixtureSourceValue, ProviderMode, ProviderName } from "./types";

/** The tournament this feature tracks. */
export const TOURNAMENT_YEAR_2026 = 2026;

/** Valid provider modes. */
export const PROVIDER_MODES = [
  "openfootball-only",
  "worldcup26-only",
  "openfootball-first",
  "live-first",
] as const satisfies readonly ProviderMode[];

/**
 * Production-safe default. OpenFootball is the stable baseline; the optional
 * worldcup26 live provider is only enabled by explicitly opting into a mode
 * that includes it (and configuring its base URL).
 */
export const DEFAULT_PROVIDER_MODE: ProviderMode = "openfootball-only";

/**
 * Parses `FIXTURE_SYNC_PROVIDER_MODE` (or any raw value) into a valid mode.
 * Missing or invalid values fall back to {@link DEFAULT_PROVIDER_MODE}
 * (`openfootball-only`) — never throws, always deployment-safe. Pure.
 */
export function parseFixtureProviderMode(
  value?: string | null,
): ProviderMode {
  const trimmed = (value ?? "").trim();
  return (PROVIDER_MODES as readonly string[]).includes(trimmed)
    ? (trimmed as ProviderMode)
    : DEFAULT_PROVIDER_MODE;
}

/** Hard timeout for every external provider fetch. */
export const PROVIDER_FETCH_TIMEOUT_MS = 10_000;

/**
 * Source priority — LOWER wins when two providers describe the same logical
 * match. The community live provider is preferred for current scores; the
 * open-data baseline backfills schedule/venue fields it lacks.
 */
export const SOURCE_PRIORITY: Record<ProviderName, number> = {
  worldcup26: 10,
  openfootball: 50,
};

/** Map a provider name to its persisted FixtureSource enum value. */
export const PROVIDER_SOURCE: Record<ProviderName, FixtureSourceValue> = {
  openfootball: "OPENFOOTBALL",
  worldcup26: "WORLDCUP26",
};

/** Human label per persisted source, for the small freshness/source line. */
export const SOURCE_LABEL: Record<FixtureSourceValue, string> = {
  OPENFOOTBALL: "OpenFootball",
  WORLDCUP26: "worldcup26",
  MANUAL: "Manual",
};

// Query result bounds — keep API responses from being unbounded.
export const DEFAULT_LIST_LIMIT = 20;
export const MAX_LIST_LIMIT = 200;

/** A sync older than this is surfaced as stale in the UI. */
export const STALE_AFTER_MINUTES = 180;

/**
 * Prisma `select` projecting exactly the StoredFixture columns (never
 * rawPayload). A selected row is structurally a StoredFixture. Plain object —
 * no Prisma runtime import — so it is safe in the tsx-run sync graph.
 */
export const FIXTURE_SELECT = {
  id: true,
  source: true,
  sourceId: true,
  tournamentYear: true,
  matchNumber: true,
  round: true,
  stage: true,
  groupName: true,
  kickoffAtUtc: true,
  kickoffDateLabel: true,
  kickoffTimeLabel: true,
  venueTimeZone: true,
  homeTeamName: true,
  awayTeamName: true,
  homeTeamSlug: true,
  awayTeamSlug: true,
  homeTeamCode: true,
  awayTeamCode: true,
  homeTeamFlag: true,
  awayTeamFlag: true,
  homeScore: true,
  awayScore: true,
  homePenaltyScore: true,
  awayPenaltyScore: true,
  status: true,
  venueName: true,
  cityName: true,
  countryName: true,
  sourcePriority: true,
  sourceUpdatedAt: true,
  lastSyncedAt: true,
} as const;
