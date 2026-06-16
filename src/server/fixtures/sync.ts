// Sync orchestration for the 2026 fixture pipeline. Fetches each configured
// provider server-side, upserts rows by [source, sourceId], logs every attempt
// in FixtureSyncLog, and returns a summary. One provider's failure never aborts
// another's — and provider errors are sanitized so no URL/secret leaks.
//
// `prisma` is passed in (not imported) so this module stays free of the "@/"
// alias and runs under tsx for the manual CLI script. Type-only Prisma imports
// are stripped at runtime.

import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import {
  FIXTURE_SELECT,
  parseFixtureProviderMode,
  TOURNAMENT_YEAR_2026,
} from "./constants";
import {
  compareKickoffAsc,
  fixtureToDto,
  selectCanonicalFixtures,
} from "./normalize";
import { fetchOpenFootballFixtures } from "./providers/openfootball";
import {
  fetchWorldcup26Fixtures,
  isWorldcup26Configured,
} from "./providers/worldcup26";
import type {
  FixtureDto,
  FixtureProviderResult,
  FixtureSyncSummary,
  NormalizedFixture,
  ProviderMode,
  ProviderName,
  ProviderSyncOutcome,
  StoredFixture,
} from "./types";

type SyncOptions = {
  providers?: ProviderName[];
  mode?: ProviderMode;
};

const PROVIDER_FETCHERS: Record<
  ProviderName,
  (now: Date) => Promise<FixtureProviderResult>
> = {
  openfootball: fetchOpenFootballFixtures,
  worldcup26: fetchWorldcup26Fixtures,
};

// Outcomes are reported in this fixed display order regardless of run order, so
// the summary always lists the baseline first.
const ALL_PROVIDERS: ProviderName[] = ["openfootball", "worldcup26"];

// A baseline (openfootball) failure is serious; an optional live-provider
// (worldcup26) failure is a non-fatal warning — the baseline still has data.
const FAILURE_STATUS: Record<ProviderName, "failed" | "warning"> = {
  openfootball: "failed",
  worldcup26: "warning",
};

/** Providers selected by a mode (order is cosmetic; upserts are independent). */
function providersForMode(mode: ProviderMode): ProviderName[] {
  switch (mode) {
    case "openfootball-only":
      return ["openfootball"];
    case "worldcup26-only":
      return ["worldcup26"];
    case "live-first":
      return ["worldcup26", "openfootball"];
    case "openfootball-first":
      return ["openfootball", "worldcup26"];
    default:
      return ["openfootball"];
  }
}

/**
 * Runs the providers selected by the resolved mode and upserts their fixtures
 * into PostgreSQL. The optional worldcup26 provider is skipped (not failed)
 * when the mode excludes it or its base URL is unset; when it runs and fails,
 * that is a non-fatal warning. A baseline (openfootball) success therefore
 * never breaks because of worldcup26.
 */
export async function syncFixtures2026(
  prisma: PrismaClient,
  options: SyncOptions = {},
): Promise<FixtureSyncSummary> {
  const now = new Date();
  const mode =
    options.mode ?? parseFixtureProviderMode(process.env.FIXTURE_SYNC_PROVIDER_MODE);
  const selected = new Set(options.providers ?? providersForMode(mode));

  const outcomes: ProviderSyncOutcome[] = [];
  for (const provider of ALL_PROVIDERS) {
    if (!selected.has(provider)) {
      outcomes.push(
        skippedOutcome(
          provider,
          `disabled by FIXTURE_SYNC_PROVIDER_MODE=${mode}`,
        ),
      );
      continue;
    }
    if (provider === "worldcup26" && !isWorldcup26Configured()) {
      outcomes.push(
        skippedOutcome(provider, "WORLDCUP26_API_BASE_URL not set"),
      );
      continue;
    }
    outcomes.push(await runProvider(prisma, provider, now));
  }

  const attempted = outcomes.filter((outcome) => outcome.status !== "skipped");
  const succeeded = attempted.filter((outcome) => outcome.status === "ok");
  return {
    mode,
    providersAttempted: attempted.length,
    providersSucceeded: succeeded.length,
    providersFailed: attempted.length - succeeded.length,
    recordsFetched: outcomes.reduce((sum, o) => sum + o.recordsFetched, 0),
    recordsUpserted: outcomes.reduce((sum, o) => sum + o.recordsUpserted, 0),
    outcomes,
    errors: attempted
      .filter((outcome) => outcome.error !== undefined)
      .map((outcome) => `${outcome.provider}: ${outcome.error}`),
  };
}

function skippedOutcome(
  provider: ProviderName,
  reason: string,
): ProviderSyncOutcome {
  return {
    provider,
    status: "skipped",
    ok: false,
    recordsFetched: 0,
    recordsUpserted: 0,
    skippedReason: reason,
  };
}

async function runProvider(
  prisma: PrismaClient,
  provider: ProviderName,
  now: Date,
): Promise<ProviderSyncOutcome> {
  const log = await prisma.fixtureSyncLog.create({
    data: { provider, status: "running" },
  });

  try {
    const result = await PROVIDER_FETCHERS[provider](now);
    let upserted = 0;
    for (const fixture of result.fixtures) {
      await upsertFixture(prisma, fixture);
      upserted += 1;
    }
    await prisma.fixtureSyncLog.update({
      where: { id: log.id },
      data: {
        status: "success",
        finishedAt: new Date(),
        recordsFetched: result.fixtures.length,
        recordsUpserted: upserted,
      },
    });
    return {
      provider,
      status: "ok",
      ok: true,
      recordsFetched: result.fixtures.length,
      recordsUpserted: upserted,
    };
  } catch (error) {
    const message = sanitizeError(error);
    const status = FAILURE_STATUS[provider];
    // worldcup26 failures are non-fatal warnings; the baseline is a real error.
    if (status === "warning") {
      console.warn(`[fixtures] ${provider} unavailable (non-fatal): ${message}`);
    } else {
      console.error(`[fixtures] ${provider} sync failed:`, error);
    }
    await prisma.fixtureSyncLog
      .update({
        where: { id: log.id },
        data: {
          status: status === "warning" ? "warning" : "error",
          finishedAt: new Date(),
          errorMessage: message,
        },
      })
      .catch(() => undefined);
    return {
      provider,
      status,
      ok: false,
      recordsFetched: 0,
      recordsUpserted: 0,
      error: message,
    };
  }
}

async function upsertFixture(
  prisma: PrismaClient,
  fixture: NormalizedFixture,
): Promise<void> {
  const data = {
    tournamentYear: fixture.tournamentYear,
    matchNumber: fixture.matchNumber ?? null,
    round: fixture.round ?? null,
    stage: fixture.stage ?? null,
    groupName: fixture.groupName ?? null,
    kickoffAtUtc: fixture.kickoffAtUtc ?? null,
    kickoffDateLabel: fixture.kickoffDateLabel ?? null,
    kickoffTimeLabel: fixture.kickoffTimeLabel ?? null,
    venueTimeZone: fixture.venueTimeZone ?? null,
    homeTeamName: fixture.homeTeamName ?? null,
    awayTeamName: fixture.awayTeamName ?? null,
    homeTeamSlug: fixture.homeTeamSlug ?? null,
    awayTeamSlug: fixture.awayTeamSlug ?? null,
    homeTeamCode: fixture.homeTeamCode ?? null,
    awayTeamCode: fixture.awayTeamCode ?? null,
    homeTeamFlag: fixture.homeTeamFlag ?? null,
    awayTeamFlag: fixture.awayTeamFlag ?? null,
    homeScore: fixture.homeScore ?? null,
    awayScore: fixture.awayScore ?? null,
    homePenaltyScore: fixture.homePenaltyScore ?? null,
    awayPenaltyScore: fixture.awayPenaltyScore ?? null,
    status: fixture.status,
    venueName: fixture.venueName ?? null,
    cityName: fixture.cityName ?? null,
    countryName: fixture.countryName ?? null,
    sourcePriority: fixture.sourcePriority,
    sourceUpdatedAt: fixture.sourceUpdatedAt ?? null,
    lastSyncedAt: new Date(),
    rawPayload:
      fixture.rawPayload === undefined || fixture.rawPayload === null
        ? undefined
        : (fixture.rawPayload as Prisma.InputJsonValue),
  } satisfies Prisma.FixtureUncheckedUpdateInput;

  await prisma.fixture.upsert({
    where: {
      source_sourceId: { source: fixture.source, sourceId: fixture.sourceId },
    },
    create: {
      source: fixture.source,
      sourceId: fixture.sourceId,
      ...data,
    } as Prisma.FixtureUncheckedCreateInput,
    update: data,
  });
}

/**
 * Canonical fixtures for 2026 (one per logical match), as DTOs. Mirrors the
 * read path in queries.ts but takes an explicit client; kept here to satisfy
 * the documented sync API. The simple strategy is in selectCanonicalFixtures.
 */
export async function getCanonicalFixtures2026(
  prisma: PrismaClient,
): Promise<FixtureDto[]> {
  const rows = (await prisma.fixture.findMany({
    where: { tournamentYear: TOURNAMENT_YEAR_2026 },
    select: FIXTURE_SELECT,
  })) as StoredFixture[];
  return selectCanonicalFixtures(rows)
    .sort(compareKickoffAsc)
    .map(fixtureToDto);
}

/** Strips URLs from an error message so no provider host/secret is exposed. */
export function sanitizeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/https?:\/\/\S+/gi, "[url]").slice(0, 300);
}
