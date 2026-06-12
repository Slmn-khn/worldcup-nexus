// Safe URL search-param parsing for filterable archive pages. Invalid user
// input is never thrown on — bad values are ignored or normalized.

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/** Trimmed non-empty string param, capped at a sane length. */
export function getStringParam(
  params: RawSearchParams,
  key: string,
  maxLength = 120,
): string | undefined {
  const raw = first(params[key]);
  if (raw === undefined) return undefined;
  const trimmed = raw.trim().slice(0, maxLength);
  return trimmed === "" ? undefined : trimmed;
}

/** Finite integer param within optional bounds; invalid values are ignored. */
export function getNumberParam(
  params: RawSearchParams,
  key: string,
  options: { min?: number; max?: number } = {},
): number | undefined {
  const raw = first(params[key]);
  if (raw === undefined || raw.trim() === "") return undefined;
  const value = Number(raw);
  if (!Number.isFinite(value) || !Number.isInteger(value)) return undefined;
  if (options.min !== undefined && value < options.min) return undefined;
  if (options.max !== undefined && value > options.max) return undefined;
  return value;
}

/** "true"/"1" → true, "false"/"0" → false, anything else → undefined. */
export function getBooleanParam(
  params: RawSearchParams,
  key: string,
): boolean | undefined {
  const raw = first(params[key])?.toLowerCase();
  if (raw === "true" || raw === "1") return true;
  if (raw === "false" || raw === "0") return false;
  return undefined;
}

/** Param constrained to a known set of values; others are ignored. */
export function getEnumParam<T extends string>(
  params: RawSearchParams,
  key: string,
  allowed: readonly T[],
): T | undefined {
  const raw = first(params[key]);
  if (raw === undefined) return undefined;
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : undefined;
}

/** Page (≥1) and pageSize (clamped) with safe defaults. */
export function getPaginationParams(
  params: RawSearchParams,
  options: { defaultPageSize?: number; maxPageSize?: number } = {},
): { page: number; pageSize: number } {
  const { defaultPageSize = 30, maxPageSize = 100 } = options;
  const page = getNumberParam(params, "page", { min: 1, max: 100000 }) ?? 1;
  const pageSize =
    getNumberParam(params, "pageSize", { min: 1, max: maxPageSize }) ??
    defaultPageSize;
  return { page, pageSize };
}

/** Drops empty/undefined/null values from a params record. */
export function removeEmptyParams(
  params: Record<string, string | number | boolean | null | undefined>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    result[key] = String(value);
  }
  return result;
}

/** "?a=1&b=2" (or "") from a params record, empties removed. */
export function buildQueryString(
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const cleaned = removeEmptyParams(params);
  const query = new URLSearchParams(cleaned).toString();
  return query === "" ? "" : `?${query}`;
}
