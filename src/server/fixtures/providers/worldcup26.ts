// worldcup26.ir provider — optional community live/current source. Its
// contract is non-authoritative and unguaranteed, so normalization is fully
// defensive: unrecognized records are skipped, unknown statuses become
// UNKNOWN, and any failure throws to the caller (sync.ts logs it and keeps the
// other providers). Never crashes the overall sync.

import { teamSlug } from "../../../lib/teamSlug";
import {
  PROVIDER_FETCH_TIMEOUT_MS,
  SOURCE_PRIORITY,
  TOURNAMENT_YEAR_2026,
} from "../constants";
import { mapWorldcup26Status } from "../normalize";
import type { FixtureProviderResult, NormalizedFixture } from "../types";
import {
  worldcup26DocumentSchema,
  type Worldcup26Match,
} from "../validators/worldcup26";

/** True when the provider is configured (has a base URL). */
export function isWorldcup26Configured(): boolean {
  const base = process.env.WORLDCUP26_API_BASE_URL;
  return base !== undefined && base.trim() !== "";
}

/**
 * Builds the worldcup26 games endpoint from a base URL, e.g.
 * `https://worldcup26.ir` (or with a trailing slash) → `…/get/games`.
 * Trailing slashes on the base are normalized away. Pure / unit-testable.
 */
export function buildWorldcup26GamesUrl(baseUrl: string): string {
  return `${baseUrl.trim().replace(/\/+$/, "")}/get/games`;
}

export async function fetchWorldcup26Fixtures(
  now: Date = new Date(),
): Promise<FixtureProviderResult> {
  const base = process.env.WORLDCUP26_API_BASE_URL;
  if (base === undefined || base.trim() === "") {
    throw new Error("WORLDCUP26_API_BASE_URL is not configured.");
  }

  // Community games endpoint. Set WORLDCUP26_API_BASE_URL="https://worldcup26.ir"
  // (base only — the "/get/games" path is appended here).
  const url = buildWorldcup26GamesUrl(base);

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    PROVIDER_FETCH_TIMEOUT_MS,
  );
  let json: unknown;
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`worldcup26 responded ${response.status}.`);
    }
    json = await response.json();
  } finally {
    clearTimeout(timeout);
  }

  const parsed = worldcup26DocumentSchema.parse(json);
  const rawMatches: Worldcup26Match[] = Array.isArray(parsed)
    ? parsed
    : (parsed.data ??
      parsed.matches ??
      parsed.fixtures ??
      parsed.results ??
      []);

  const fixtures: NormalizedFixture[] = [];
  rawMatches.forEach((match, index) => {
    const fixture = normalizeWorldcup26Match(match, index);
    if (fixture !== null) fixtures.push(fixture);
  });

  return { provider: "worldcup26", fetchedAt: now, fixtures };
}

function toStr(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function toNum(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

/** Pulls a team's display fields from the many shapes a side may take. */
function readTeam(value: unknown): {
  name: string | null;
  code: string | null;
  flag: string | null;
} {
  if (typeof value === "string") return { name: value.trim() || null, code: null, flag: null };
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return {
      name: toStr(obj.name) ?? toStr(obj.title) ?? toStr(obj.team) ?? null,
      code: toStr(obj.code) ?? toStr(obj.short) ?? toStr(obj.abbr) ?? null,
      flag: toStr(obj.flag) ?? toStr(obj.flagUrl) ?? toStr(obj.logo) ?? null,
    };
  }
  return { name: null, code: null, flag: null };
}

function readScoreSide(match: Worldcup26Match, side: "home" | "away"): number | null {
  const direct = side === "home" ? match.homeScore : match.awayScore;
  const directNum = toNum(direct);
  if (directNum !== null) return directNum;

  const score = match.score;
  if (score !== null && typeof score === "object") {
    const obj = score as Record<string, unknown>;
    const fromKeyed = toNum(obj[side]); // { home, away }
    if (fromKeyed !== null) return fromKeyed;
    const ft = obj.ft; // { ft: [home, away] }
    if (Array.isArray(ft) && ft.length >= 2) {
      return toNum(ft[side === "home" ? 0 : 1]);
    }
  }
  return null;
}

export function normalizeWorldcup26Match(
  match: Worldcup26Match,
  index: number,
): NormalizedFixture | null {
  const home = readTeam(match.home ?? match.homeTeam ?? match.team1);
  const away = readTeam(match.away ?? match.awayTeam ?? match.team2);

  const sourceId =
    toStr(match.id) ??
    toStr(match.matchId) ??
    toStr(match.fixtureId) ??
    toStr(match.number) ??
    toStr(match.matchNumber);

  // Without an id and without any team, the record is unusable.
  if (sourceId === null && home.name === null && away.name === null) {
    return null;
  }

  const datetime =
    toStr(match.utcDate) ??
    toStr(match.datetime) ??
    toStr(match.kickoff) ??
    null;
  let kickoffAtUtc: Date | null = null;
  if (datetime !== null) {
    const parsed = new Date(datetime);
    if (!Number.isNaN(parsed.getTime())) kickoffAtUtc = parsed;
  }

  const venue = readVenue(match.venue ?? match.stadium);

  return {
    source: "WORLDCUP26",
    sourceId: sourceId ?? `worldcup26-${TOURNAMENT_YEAR_2026}-i${index}`,
    tournamentYear: TOURNAMENT_YEAR_2026,
    matchNumber: toNum(match.matchNumber) ?? toNum(match.number),
    round: toStr(match.round),
    stage: toStr(match.stage),
    groupName: toStr(match.groupName) ?? toStr(match.group),
    kickoffAtUtc,
    kickoffDateLabel: toStr(match.date),
    kickoffTimeLabel: toStr(match.time),
    venueTimeZone: toStr(match.timezone),
    homeTeamName: home.name,
    awayTeamName: away.name,
    homeTeamSlug: teamSlug(home.name),
    awayTeamSlug: teamSlug(away.name),
    homeTeamCode: home.code,
    awayTeamCode: away.code,
    homeTeamFlag: home.flag,
    awayTeamFlag: away.flag,
    homeScore: readScoreSide(match, "home"),
    awayScore: readScoreSide(match, "away"),
    homePenaltyScore: null,
    awayPenaltyScore: null,
    status: mapWorldcup26Status(toStr(match.status) ?? toStr(match.state)),
    venueName: venue.name,
    cityName: toStr(match.city) ?? venue.city,
    countryName: null,
    sourcePriority: SOURCE_PRIORITY.worldcup26,
    sourceUpdatedAt: readUpdatedAt(match),
    rawPayload: match,
  };
}

function readVenue(value: unknown): { name: string | null; city: string | null } {
  if (typeof value === "string") return { name: value.trim() || null, city: null };
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return { name: toStr(obj.name), city: toStr(obj.city) };
  }
  return { name: null, city: null };
}

function readUpdatedAt(match: Worldcup26Match): Date | null {
  const raw = toStr(match.updatedAt) ?? toStr(match.updated_at);
  if (raw === null) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
