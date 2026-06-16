// Pure normalization + canonical-selection logic for the fixture pipeline.
// No Prisma, no network, no "@/" runtime imports — fully unit-testable and
// safe under tsx.

import { isoDateInZone } from "../../lib/date";
import { SOURCE_LABEL } from "./constants";
import type {
  FixtureDto,
  FixtureStatusValue,
  StoredFixture,
} from "./types";

/**
 * Derives an OpenFootball fixture status from whether a score is present and
 * whether kick-off is in the past. Conservative: only FINISHED when a score
 * exists AND kick-off is known to be in the past; only SCHEDULED when there is
 * no score AND kick-off is known to be in the future. Everything else is
 * UNKNOWN (never guessed).
 */
export function deriveOpenFootballStatus(
  hasScore: boolean,
  kickoffAtUtc: Date | null,
  kickoffDateLabel: string | null,
  now: Date,
): FixtureStatusValue {
  const past = isKickoffPast(kickoffAtUtc, kickoffDateLabel, now);
  if (hasScore && past === true) return "FINISHED";
  if (!hasScore && past === false) return "SCHEDULED";
  return "UNKNOWN";
}

/**
 * true / false when confidently past or future; null when undecidable
 * (no instant, or the calendar date equals today so the time of day matters).
 */
export function isKickoffPast(
  kickoffAtUtc: Date | null,
  kickoffDateLabel: string | null,
  now: Date,
): boolean | null {
  if (kickoffAtUtc !== null) return kickoffAtUtc.getTime() <= now.getTime();
  if (kickoffDateLabel !== null && /^\d{4}-\d{2}-\d{2}$/.test(kickoffDateLabel)) {
    const today = isoDateInZone(now, "UTC");
    if (kickoffDateLabel < today) return true;
    if (kickoffDateLabel > today) return false;
    return null; // same calendar day — unknown without a time
  }
  return null;
}

/** Maps a worldcup26 status string onto the canonical FixtureStatus set. */
export function mapWorldcup26Status(
  raw: string | null | undefined,
): FixtureStatusValue {
  const value = (raw ?? "").trim().toLowerCase();
  switch (value) {
    case "live":
    case "in_play":
    case "in-play":
    case "inprogress":
    case "playing":
    case "1h":
    case "2h":
    case "first_half":
    case "second_half":
      return "LIVE";
    case "ht":
    case "half_time":
    case "half-time":
    case "halftime":
    case "break":
      return "HALF_TIME";
    case "ft":
    case "finished":
    case "full_time":
    case "full-time":
    case "ended":
    case "completed":
    case "aet":
    case "pen":
    case "after_penalties":
      return "FINISHED";
    case "scheduled":
    case "not_started":
    case "ns":
    case "upcoming":
    case "fixture":
    case "tbd":
      return "SCHEDULED";
    case "postponed":
    case "susp":
    case "suspended":
    case "delayed":
      return "POSTPONED";
    case "cancelled":
    case "canceled":
    case "abandoned":
    case "awarded":
      return "CANCELLED";
    default:
      return "UNKNOWN";
  }
}

/** UTC calendar date (YYYY-MM-DD) used to group/order a fixture; null if none. */
export function fixtureDateKey(
  row: Pick<StoredFixture, "kickoffAtUtc" | "kickoffDateLabel">,
): string | null {
  if (row.kickoffAtUtc !== null) return isoDateInZone(row.kickoffAtUtc, "UTC");
  return row.kickoffDateLabel;
}

/**
 * Logical-match key: kickoff date + the two team slugs (order-independent) +
 * stage/group. Two provider rows for the same fixture collapse to one key.
 */
export function logicalMatchKey(row: StoredFixture): string {
  const date = fixtureDateKey(row) ?? "no-date";
  const teams = [row.homeTeamSlug ?? "", row.awayTeamSlug ?? ""]
    .map((slug) => slug.trim())
    .sort()
    .join("-vs-");
  const teamPart =
    teams === "-vs-"
      ? // No team slugs (knockout placeholders): fall back to match number.
        `mn-${row.matchNumber ?? "?"}`
      : teams;
  const context = (row.stage ?? row.groupName ?? "").trim().toLowerCase();
  return `${date}|${teamPart}|${context}`;
}

/** Comparator: kick-off ascending, fixtures without an instant sorted last. */
export function compareKickoffAsc(a: StoredFixture, b: StoredFixture): number {
  const at = a.kickoffAtUtc?.getTime() ?? null;
  const bt = b.kickoffAtUtc?.getTime() ?? null;
  if (at === null && bt === null) return fallbackOrder(a, b);
  if (at === null) return 1;
  if (bt === null) return -1;
  return at - bt || fallbackOrder(a, b);
}

function fallbackOrder(a: StoredFixture, b: StoredFixture): number {
  const ad = fixtureDateKey(a) ?? "";
  const bd = fixtureDateKey(b) ?? "";
  if (ad !== bd) return ad < bd ? -1 : 1;
  return (a.matchNumber ?? 0) - (b.matchNumber ?? 0);
}

const NULLABLE_DISPLAY_FIELDS = [
  "matchNumber",
  "round",
  "stage",
  "groupName",
  "kickoffAtUtc",
  "kickoffDateLabel",
  "kickoffTimeLabel",
  "venueTimeZone",
  "homeTeamName",
  "awayTeamName",
  "homeTeamSlug",
  "awayTeamSlug",
  "homeTeamCode",
  "awayTeamCode",
  "homeTeamFlag",
  "awayTeamFlag",
  "homeScore",
  "awayScore",
  "homePenaltyScore",
  "awayPenaltyScore",
  "venueName",
  "cityName",
  "countryName",
] as const satisfies readonly (keyof StoredFixture)[];

/**
 * Collapses provider rows to one canonical fixture per logical match.
 *
 * Strategy (simple, documented — not a destructive merge of stored rows):
 *  - Group rows by {@link logicalMatchKey}.
 *  - The primary row is the one with the lowest sourcePriority (live provider
 *    wins), breaking ties toward rows that already have a score, then the most
 *    recently synced.
 *  - Null display fields on the primary are backfilled from the other rows in
 *    priority order, so the live provider's scores/status combine with the
 *    baseline provider's venue/group data.
 *  - The primary's id/source are kept, so the result still attributes a source.
 *
 * Limitation: matching is heuristic (date + team slugs + stage). Mismatched
 * team naming across providers can leave two rows unmerged; that surfaces as a
 * duplicate rather than corrupting data. See docs/DATA_SOURCES.md.
 */
export function selectCanonicalFixtures(rows: StoredFixture[]): StoredFixture[] {
  const groups = new Map<string, StoredFixture[]>();
  for (const row of rows) {
    const key = logicalMatchKey(row);
    const group = groups.get(key);
    if (group === undefined) groups.set(key, [row]);
    else group.push(row);
  }

  const canonical: StoredFixture[] = [];
  for (const group of groups.values()) {
    const ordered = [...group].sort(comparePrimary);
    const [primary, ...rest] = ordered;
    if (rest.length === 0) {
      canonical.push(primary);
      continue;
    }
    const merged: StoredFixture = { ...primary };
    for (const field of NULLABLE_DISPLAY_FIELDS) {
      if (merged[field] === null || merged[field] === undefined) {
        const donor = rest.find(
          (row) => row[field] !== null && row[field] !== undefined,
        );
        if (donor !== undefined) {
          // Field-by-field copy across the same key type — safe by construction.
          (merged as Record<string, unknown>)[field] = donor[field];
        }
      }
    }
    canonical.push(merged);
  }
  return canonical;
}

const RESULT_STATUSES = new Set<FixtureStatusValue>([
  "LIVE",
  "HALF_TIME",
  "FINISHED",
]);

function comparePrimary(a: StoredFixture, b: StoredFixture): number {
  if (a.sourcePriority !== b.sourcePriority) {
    return a.sourcePriority - b.sourcePriority;
  }
  const aResult = RESULT_STATUSES.has(a.status) ? 0 : 1;
  const bResult = RESULT_STATUSES.has(b.status) ? 0 : 1;
  if (aResult !== bResult) return aResult - bResult;
  return b.lastSyncedAt.getTime() - a.lastSyncedAt.getTime();
}

/** Serializes a stored fixture into the frontend-safe DTO (never rawPayload). */
export function fixtureToDto(row: StoredFixture): FixtureDto {
  const persistedSource =
    row.source === "WORLDCUP26"
      ? "WORLDCUP26"
      : row.source === "MANUAL"
        ? "MANUAL"
        : "OPENFOOTBALL";
  return {
    id: row.id,
    source: row.source,
    tournamentYear: row.tournamentYear,
    matchNumber: row.matchNumber,
    round: row.round,
    stage: row.stage,
    groupName: row.groupName,
    kickoffAtUtc: row.kickoffAtUtc?.toISOString() ?? null,
    kickoffDateLabel: row.kickoffDateLabel,
    kickoffTimeLabel: row.kickoffTimeLabel,
    venueTimeZone: row.venueTimeZone,
    homeTeamName: row.homeTeamName,
    awayTeamName: row.awayTeamName,
    homeTeamSlug: row.homeTeamSlug,
    awayTeamSlug: row.awayTeamSlug,
    homeTeamCode: row.homeTeamCode,
    awayTeamCode: row.awayTeamCode,
    homeTeamFlag: row.homeTeamFlag,
    awayTeamFlag: row.awayTeamFlag,
    homeScore: row.homeScore,
    awayScore: row.awayScore,
    homePenaltyScore: row.homePenaltyScore,
    awayPenaltyScore: row.awayPenaltyScore,
    status: row.status,
    venueName: row.venueName,
    cityName: row.cityName,
    countryName: row.countryName,
    sourceLabel: SOURCE_LABEL[persistedSource],
    lastSyncedAt: row.lastSyncedAt.toISOString(),
  };
}
