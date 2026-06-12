// Global search API (Checkpoint 6A). Thin wrapper over the search service.
// Returns empty groups for empty queries and a clear 503 when Meilisearch
// is unavailable — pages never depend on search availability.
// Hardened in Checkpoint 8B: rate limited, production-safe errors, and the
// service caps query length server-side.

import { NextResponse } from "next/server";
import { createApiErrorResponse } from "@/server/security/api-errors";
import { enforceRateLimit } from "@/server/security/rate-limit";
import { searchWorldCupAtlas } from "@/server/search/search";
import {
  SEARCH_DOCUMENT_TYPES,
  emptySearchResponse,
  type SearchDocumentType,
} from "@/server/search/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limited = enforceRateLimit("search", request);
  if (limited !== null) return limited;

  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  if (query.trim() === "") {
    return NextResponse.json(emptySearchResponse(""));
  }

  const rawLimit = Number(url.searchParams.get("limit"));
  const limit =
    Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : undefined;
  const types = (url.searchParams.get("type") ?? "")
    .split(",")
    .map((type) => type.trim())
    .filter((type): type is SearchDocumentType =>
      SEARCH_DOCUMENT_TYPES.includes(type as SearchDocumentType),
    );

  try {
    const response = await searchWorldCupAtlas(query, {
      limit,
      types: types.length > 0 ? types : undefined,
    });
    return NextResponse.json(response);
  } catch (error) {
    return createApiErrorResponse({
      message: "Search is temporarily unavailable. Please try again shortly.",
      status: 503,
      error,
    });
  }
}
