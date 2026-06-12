// Explorer data API (Checkpoint 6B). Same filters as the /explorer page,
// for client-side consumers. Never exposes RawSourceRecord.
// Hardened in Checkpoint 8B: rate limited, production-safe errors.

import { NextResponse } from "next/server";
import { createApiErrorResponse } from "@/server/security/api-errors";
import { enforceRateLimit } from "@/server/security/rate-limit";
import { getExplorerData } from "@/server/queries/explorer";
import { parseExplorerOptions } from "@/server/queries/parseExplorerParams";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limited = enforceRateLimit("explorer", request);
  if (limited !== null) return limited;

  const url = new URL(request.url);
  try {
    const data = await getExplorerData(
      parseExplorerOptions((key) => url.searchParams.get(key)),
    );
    return NextResponse.json(data);
  } catch (error) {
    return createApiErrorResponse({
      message: "Explorer data is temporarily unavailable.",
      status: 500,
      error,
    });
  }
}
