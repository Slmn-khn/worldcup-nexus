// Shared explorer query-param parsing, used by the /explorer page and the
// /api/explorer and /api/export/explorer routes.

import type { ExplorerQueryOptions } from "./types";

function cleanString(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed !== undefined && trimmed !== ""
    ? trimmed.slice(0, 100)
    : undefined;
}

function toPositiveInt(value: string | null): number | undefined {
  if (value === null) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

/** Parses explorer options from any param source via a getter. */
export function parseExplorerOptions(
  get: (key: string) => string | null,
): ExplorerQueryOptions {
  return {
    eventType: cleanString(get("eventType")),
    tournamentYear: toPositiveInt(get("tournamentYear")),
    countrySlug: cleanString(get("countrySlug")),
    playerSlug: cleanString(get("playerSlug")),
    stage: cleanString(get("stage")),
    q: cleanString(get("q")),
    page: toPositiveInt(get("page")),
    pageSize: toPositiveInt(get("pageSize")),
  };
}

/** Adapter for Next.js page searchParams records. */
export function searchParamsGetter(
  params: Record<string, string | string[] | undefined>,
): (key: string) => string | null {
  return (key) => {
    const value = params[key];
    if (value === undefined) return null;
    return Array.isArray(value) ? (value[0] ?? null) : value;
  };
}
