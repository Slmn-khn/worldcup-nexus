// GET /api/fixtures/2026 — filtered 2026 fixtures (DB-backed, never providers).
// Query params: from, to (ISO), status, group, stage, q, limit.

import { NextResponse } from "next/server";
import { z } from "zod";
import { createApiErrorResponse } from "@/server/security/api-errors";
import { enforceRateLimit } from "@/server/security/rate-limit";
import {
  parseFixtureListQuery,
} from "@/server/fixtures/apiParams";
import { DEFAULT_LIST_LIMIT } from "@/server/fixtures/constants";
import {
  getFixtures2026ByDateRange,
  getSchedule2026,
} from "@/server/fixtures/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limited = enforceRateLimit("fixtures", request);
  if (limited !== null) return limited;

  const url = new URL(request.url);
  let query;
  try {
    query = parseFixtureListQuery(url.searchParams);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters." },
        { status: 400 },
      );
    }
    throw error;
  }

  try {
    const limit = query.limit ?? DEFAULT_LIST_LIMIT;
    const fixtures =
      query.from !== undefined && query.to !== undefined
        ? await getFixtures2026ByDateRange({
            from: query.from,
            to: query.to,
            status: query.status,
            groupName: query.group,
            stage: query.stage,
          })
        : await getSchedule2026({
            status: query.status,
            groupName: query.group,
            stage: query.stage,
            q: query.q,
          });

    const limited = fixtures.slice(0, limit);
    return NextResponse.json({
      count: limited.length,
      totalMatched: fixtures.length,
      fixtures: limited,
    });
  } catch (error) {
    return createApiErrorResponse({
      message: "2026 fixtures are temporarily unavailable.",
      status: 500,
      error,
    });
  }
}
