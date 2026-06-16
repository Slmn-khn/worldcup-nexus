// GET /api/fixtures/2026/today — today's fixtures (UTC by default; ?tz=IANA).

import { NextResponse } from "next/server";
import { createApiErrorResponse } from "@/server/security/api-errors";
import { enforceRateLimit } from "@/server/security/rate-limit";
import { getTodayFixtures2026 } from "@/server/fixtures/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limited = enforceRateLimit("fixtures", request);
  if (limited !== null) return limited;

  const url = new URL(request.url);
  const timeZone = sanitizeTimeZone(url.searchParams.get("tz"));

  try {
    const fixtures = await getTodayFixtures2026({ timeZone });
    return NextResponse.json({ count: fixtures.length, fixtures });
  } catch (error) {
    return createApiErrorResponse({
      message: "Today's 2026 fixtures are temporarily unavailable.",
      status: 500,
      error,
    });
  }
}

/** Accept a valid IANA zone only; fall back to UTC for anything unparseable. */
function sanitizeTimeZone(raw: string | null): string {
  if (raw === null || raw.trim() === "") return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: raw });
    return raw;
  } catch {
    return "UTC";
  }
}
