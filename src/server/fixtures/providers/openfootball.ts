// OpenFootball provider — the open-data baseline (schedule, venues, groups,
// basic results). Server-side fetch only, hard timeout, Zod-validated, tolerant
// to shape drift. The untouched match object is preserved as rawPayload.

import { parseKickoff } from "../../../lib/date";
import { teamSlug } from "../../../lib/teamSlug";
import {
  PROVIDER_FETCH_TIMEOUT_MS,
  SOURCE_PRIORITY,
  TOURNAMENT_YEAR_2026,
} from "../constants";
import { deriveOpenFootballStatus } from "../normalize";
import type { FixtureProviderResult, NormalizedFixture } from "../types";
import {
  openFootballDocumentSchema,
  type OpenFootballMatch,
} from "../validators/openfootball";

/** Fetches and normalizes the OpenFootball 2026 fixtures. Throws on failure. */
export async function fetchOpenFootballFixtures(
  now: Date = new Date(),
): Promise<FixtureProviderResult> {
  const url = process.env.OPENFOOTBALL_2026_URL;
  if (url === undefined || url.trim() === "") {
    throw new Error("OPENFOOTBALL_2026_URL is not configured.");
  }

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
      throw new Error(`OpenFootball responded ${response.status}.`);
    }
    json = await response.json();
  } finally {
    clearTimeout(timeout);
  }

  const parsed = openFootballDocumentSchema.parse(json);
  const matches: OpenFootballMatch[] = [
    ...(parsed.matches ?? []),
    ...(parsed.rounds ?? []).flatMap((round) => round.matches ?? []),
  ];

  const fixtures: NormalizedFixture[] = [];
  matches.forEach((match, index) => {
    const fixture = normalizeOpenFootballMatch(match, index, now);
    if (fixture !== null) fixtures.push(fixture);
  });

  return { provider: "openfootball", fetchedAt: now, fixtures };
}

function teamName(value: OpenFootballMatch["team1"]): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") return value.trim() || null;
  return value.name?.trim() || null;
}

function teamCode(value: OpenFootballMatch["team1"]): string | null {
  if (value === undefined || value === null || typeof value === "string") {
    return null;
  }
  return value.code?.trim() || null;
}

function stadiumName(value: OpenFootballMatch["stadium"]): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") return value.trim() || null;
  return value.name?.trim() || null;
}

/** Reads [home, away] full-time scores from the several shapes seen in source. */
function readScores(match: OpenFootballMatch): {
  homeScore: number | null;
  awayScore: number | null;
  homePenaltyScore: number | null;
  awayPenaltyScore: number | null;
} {
  const ft = match.score?.ft ?? match.ft;
  let homeScore: number | null = null;
  let awayScore: number | null = null;
  if (Array.isArray(ft) && ft.length >= 2) {
    homeScore = Number.isFinite(ft[0]) ? ft[0] : null;
    awayScore = Number.isFinite(ft[1]) ? ft[1] : null;
  } else if (
    typeof match.score1 === "number" &&
    typeof match.score2 === "number"
  ) {
    homeScore = match.score1;
    awayScore = match.score2;
  }

  const pens = match.score?.p;
  const homePenaltyScore =
    Array.isArray(pens) && Number.isFinite(pens[0]) ? pens[0] : null;
  const awayPenaltyScore =
    Array.isArray(pens) && Number.isFinite(pens[1]) ? pens[1] : null;

  return { homeScore, awayScore, homePenaltyScore, awayPenaltyScore };
}

export function normalizeOpenFootballMatch(
  match: OpenFootballMatch,
  index: number,
  now: Date,
): NormalizedFixture | null {
  const home = teamName(match.team1);
  const away = teamName(match.team2);
  const kickoff = parseKickoff(match.date, match.time);

  // Need at least teams or a date to be a meaningful fixture row.
  if (home === null && away === null && kickoff.kickoffDateLabel === null) {
    return null;
  }

  const matchNumber =
    match.num !== undefined && Number.isFinite(Number(match.num))
      ? Number(match.num)
      : null;

  const { homeScore, awayScore, homePenaltyScore, awayPenaltyScore } =
    readScores(match);
  const hasScore = homeScore !== null && awayScore !== null;

  const homeSlug = teamSlug(home);
  const awaySlug = teamSlug(away);

  const sourceId = buildSourceId({
    date: kickoff.kickoffDateLabel,
    homeSlug,
    awaySlug,
    matchNumber,
    index,
  });

  return {
    source: "OPENFOOTBALL",
    sourceId,
    tournamentYear: TOURNAMENT_YEAR_2026,
    matchNumber,
    round: match.round?.trim() || null,
    stage: match.stage?.trim() || null,
    groupName: (match.group ?? match.group_name)?.trim() || null,
    kickoffAtUtc: kickoff.kickoffAtUtc,
    kickoffDateLabel: kickoff.kickoffDateLabel,
    kickoffTimeLabel: kickoff.kickoffTimeLabel,
    venueTimeZone: kickoff.venueTimeZone,
    homeTeamName: home,
    awayTeamName: away,
    homeTeamSlug: homeSlug,
    awayTeamSlug: awaySlug,
    homeTeamCode: teamCode(match.team1),
    awayTeamCode: teamCode(match.team2),
    homeTeamFlag: null,
    awayTeamFlag: null,
    homeScore,
    awayScore,
    homePenaltyScore,
    awayPenaltyScore,
    status: deriveOpenFootballStatus(
      hasScore,
      kickoff.kickoffAtUtc,
      kickoff.kickoffDateLabel,
      now,
    ),
    venueName: stadiumName(match.stadium),
    // The 2026 file uses `ground` for the host city; keep it as the city.
    cityName: match.city?.trim() || match.ground?.trim() || null,
    countryName: null,
    sourcePriority: SOURCE_PRIORITY.openfootball,
    sourceUpdatedAt: null,
    rawPayload: match,
  };
}

/** Stable id: prefer match number; always include a deterministic index. */
function buildSourceId(parts: {
  date: string | null;
  homeSlug: string | null;
  awaySlug: string | null;
  matchNumber: number | null;
  index: number;
}): string {
  const segments = [
    "openfootball",
    String(TOURNAMENT_YEAR_2026),
    parts.date ?? "nodate",
    parts.homeSlug ?? "tbd",
    parts.awaySlug ?? "tbd",
    parts.matchNumber !== null ? `m${parts.matchNumber}` : `i${parts.index}`,
  ];
  return segments.join("-");
}
