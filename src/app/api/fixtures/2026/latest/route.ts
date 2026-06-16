// GET /api/fixtures/2026/latest — blended live/recent/upcoming fixtures.

import { NextResponse } from "next/server";
import { createApiErrorResponse } from "@/server/security/api-errors";
import { enforceRateLimit } from "@/server/security/rate-limit";
import { getLatestFixtures2026 } from "@/server/fixtures/queries";
import { DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT } from "@/server/fixtures/constants";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limited = enforceRateLimit("fixtures", request);
  if (limited !== null) return limited;

  const url = new URL(request.url);
  const limit = parseLimit(url.searchParams.get("limit"));

  try {
    const fixtures = await getLatestFixtures2026({ limit });
    return NextResponse.json({ count: fixtures.length, fixtures });
  } catch (error) {
    return createApiErrorResponse({
      message: "Latest 2026 fixtures are temporarily unavailable.",
      status: 500,
      error,
    });
  }
}

function parseLimit(raw: string | null): number {
  const value = Number(raw);
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 1) {
    return DEFAULT_LIST_LIMIT;
  }
  return Math.min(value, MAX_LIST_LIMIT);
}
