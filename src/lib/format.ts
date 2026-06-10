// Dependency-free display formatting helpers.

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

/**
 * Formats an ISO string or Date as e.g. "29 June 1986". Rendered in UTC:
 * source dates are stored as UTC midnight (and kick-off times verbatim as
 * local stadium time — see docs/DATA_ISSUES.md ISSUE-004).
 */
export function formatDate(
  value: string | Date | null | undefined,
): string | null {
  if (value === null || value === undefined || value === "") return null;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatNullable(
  value: string | number | null | undefined,
  fallback = "—",
): string {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}
