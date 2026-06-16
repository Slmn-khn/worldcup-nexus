// Internal types for the 2026 fixture pipeline.
//
// NOTE ON IMPORTS: every module in the sync graph (types, constants,
// normalize, freshness, providers, validators, sync) uses RELATIVE runtime
// imports and only `import type` from "@/generated/*". This lets the manual
// CLI sync script run under tsx — which strips type-only imports but does not
// resolve the "@/" tsconfig alias at runtime (same rationale as
// scripts/import/utils/db.ts). App-only modules (queries.ts, routes,
// components) use the normal "@/" alias.

export type FixtureStatusValue =
  | "SCHEDULED"
  | "LIVE"
  | "HALF_TIME"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED"
  | "UNKNOWN";

export type FixtureSourceValue = "OPENFOOTBALL" | "WORLDCUP26" | "MANUAL";

export type ProviderName = "openfootball" | "worldcup26";

export type ProviderMode =
  | "openfootball-only"
  | "worldcup26-only"
  | "openfootball-first"
  | "live-first";

/** A provider fixture normalized into the shared internal shape. */
export type NormalizedFixture = {
  source: FixtureSourceValue;
  sourceId: string;
  tournamentYear: number;
  matchNumber?: number | null;
  round?: string | null;
  stage?: string | null;
  groupName?: string | null;
  kickoffAtUtc?: Date | null;
  kickoffDateLabel?: string | null;
  kickoffTimeLabel?: string | null;
  venueTimeZone?: string | null;
  homeTeamName?: string | null;
  awayTeamName?: string | null;
  homeTeamSlug?: string | null;
  awayTeamSlug?: string | null;
  homeTeamCode?: string | null;
  awayTeamCode?: string | null;
  homeTeamFlag?: string | null;
  awayTeamFlag?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  homePenaltyScore?: number | null;
  awayPenaltyScore?: number | null;
  status: FixtureStatusValue;
  venueName?: string | null;
  cityName?: string | null;
  countryName?: string | null;
  sourcePriority: number;
  sourceUpdatedAt?: Date | null;
  rawPayload: unknown;
};

export type FixtureProviderResult = {
  provider: ProviderName;
  fetchedAt: Date;
  fixtures: NormalizedFixture[];
};

/**
 * Outcome of one provider in a sync run:
 * - `ok`       — ran and succeeded.
 * - `failed`   — the baseline (openfootball) ran and failed (serious).
 * - `warning`  — the optional live provider (worldcup26) ran and failed
 *                (non-fatal: openfootball baseline still covers fixtures).
 * - `skipped`  — not run (disabled by mode, or not configured).
 */
export type ProviderOutcomeStatus = "ok" | "failed" | "warning" | "skipped";

/** Per-provider outcome recorded in the sync summary and FixtureSyncLog. */
export type ProviderSyncOutcome = {
  provider: ProviderName;
  status: ProviderOutcomeStatus;
  /** Convenience flag: `status === "ok"`. */
  ok: boolean;
  recordsFetched: number;
  recordsUpserted: number;
  error?: string;
  /** Why a provider was skipped (disabled by mode / not configured). */
  skippedReason?: string;
};

export type FixtureSyncSummary = {
  /** The resolved provider mode this run used. */
  mode: ProviderMode;
  /** Providers that actually ran (ok + failed + warning); excludes skipped. */
  providersAttempted: number;
  providersSucceeded: number;
  providersFailed: number;
  recordsFetched: number;
  recordsUpserted: number;
  outcomes: ProviderSyncOutcome[];
  errors: string[];
};

/**
 * The subset of Fixture columns loaded for read-time canonical selection and
 * serialization. Mirrors the Prisma model but stays decoupled from it so
 * normalize.ts has no runtime Prisma dependency.
 */
export type StoredFixture = {
  id: string;
  source: FixtureSourceValue;
  sourceId: string | null;
  tournamentYear: number;
  matchNumber: number | null;
  round: string | null;
  stage: string | null;
  groupName: string | null;
  kickoffAtUtc: Date | null;
  kickoffDateLabel: string | null;
  kickoffTimeLabel: string | null;
  venueTimeZone: string | null;
  homeTeamName: string | null;
  awayTeamName: string | null;
  homeTeamSlug: string | null;
  awayTeamSlug: string | null;
  homeTeamCode: string | null;
  awayTeamCode: string | null;
  homeTeamFlag: string | null;
  awayTeamFlag: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homePenaltyScore: number | null;
  awayPenaltyScore: number | null;
  status: FixtureStatusValue;
  venueName: string | null;
  cityName: string | null;
  countryName: string | null;
  sourcePriority: number;
  sourceUpdatedAt: Date | null;
  lastSyncedAt: Date;
};

/**
 * Frontend-safe fixture shape. Fully JSON-serializable (dates as ISO strings),
 * never includes rawPayload. This is the only fixture shape that reaches
 * components and API responses.
 */
export type FixtureDto = {
  id: string;
  source: FixtureSourceValue;
  tournamentYear: number;
  matchNumber: number | null;
  round: string | null;
  stage: string | null;
  groupName: string | null;
  kickoffAtUtc: string | null;
  kickoffDateLabel: string | null;
  kickoffTimeLabel: string | null;
  venueTimeZone: string | null;
  homeTeamName: string | null;
  awayTeamName: string | null;
  homeTeamSlug: string | null;
  awayTeamSlug: string | null;
  homeTeamCode: string | null;
  awayTeamCode: string | null;
  homeTeamFlag: string | null;
  awayTeamFlag: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homePenaltyScore: number | null;
  awayPenaltyScore: number | null;
  status: FixtureStatusValue;
  venueName: string | null;
  cityName: string | null;
  countryName: string | null;
  /** Display source label, e.g. "OpenFootball". */
  sourceLabel: string;
  lastSyncedAt: string;
};

export type FixtureFreshness = {
  lastSyncedAt: string | null;
  ageMinutes: number | null;
  isStale: boolean;
  label: string;
};
