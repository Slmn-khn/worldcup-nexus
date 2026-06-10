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

/** Football minute label, e.g. "23'" or "90+3'". */
export function formatMinute(
  minute: number | null | undefined,
  stoppageMinute?: number | null,
): string | null {
  if (minute === null || minute === undefined) return null;
  if (
    stoppageMinute !== null &&
    stoppageMinute !== undefined &&
    stoppageMinute > 0
  ) {
    return `${minute}+${stoppageMinute}'`;
  }
  return `${minute}'`;
}

/** Display label for a booking card type. */
export function formatCardType(
  cardType: "YELLOW" | "SECOND_YELLOW" | "RED",
): string {
  return cardType === "RED"
    ? "Red card"
    : cardType === "SECOND_YELLOW"
      ? "Second yellow"
      : "Yellow card";
}

/** Display label for a penalty kick type. */
export function formatPenaltyType(type: "IN_MATCH" | "SHOOTOUT"): string {
  return type === "SHOOTOUT" ? "Shootout" : "In match";
}

/** Long label for a W/D/L result code. */
export function formatResult(result: "W" | "D" | "L"): string {
  return result === "W" ? "Win" : result === "D" ? "Draw" : "Loss";
}

export function formatNullable(
  value: string | number | null | undefined,
  fallback = "—",
): string {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}
