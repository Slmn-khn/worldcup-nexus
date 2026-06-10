// Safe value conversion helpers for raw Fjelstul CSV cells.
// The source marks missing values as "not available" / "not applicable".

const NULLISH_VALUES = new Set([
  "",
  "not available",
  "not applicable",
  "na",
  "n/a",
  "null",
]);

/** Returns the trimmed string, or null for empty / source-flagged missing values. */
export function cleanString(value: string | undefined): string | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  return NULLISH_VALUES.has(trimmed.toLowerCase()) ? null : trimmed;
}

/** Parses an integer, returning null for missing or non-numeric values. */
export function toInt(value: string | undefined): number | null {
  const cleaned = cleanString(value);
  if (cleaned === null) return null;
  const parsed = Number(cleaned);
  return Number.isInteger(parsed) ? parsed : null;
}

/** The source encodes booleans as "1" / "0". Anything else is treated as false. */
export function toBool(value: string | undefined): boolean {
  return cleanString(value) === "1";
}

/** Parses a YYYY-MM-DD date as midnight UTC. Returns null when missing or malformed. */
export function toDateUTC(value: string | undefined): Date | null {
  const cleaned = cleanString(value);
  if (cleaned === null || !/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return null;
  const date = new Date(`${cleaned}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Combines a YYYY-MM-DD date and HH:MM time into a single Date. Source times
 * are local stadium times; they are stored verbatim on a UTC timeline (no
 * timezone conversion) — see docs/DATA_ISSUES.md.
 */
export function toDateTimeUTC(
  dateValue: string | undefined,
  timeValue: string | undefined,
): Date | null {
  const date = cleanString(dateValue);
  if (date === null || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const time = cleanString(timeValue);
  const suffix =
    time !== null && /^\d{1,2}:\d{2}$/.test(time)
      ? time.padStart(5, "0")
      : "00:00";
  const combined = new Date(`${date}T${suffix}:00.000Z`);
  return Number.isNaN(combined.getTime()) ? null : combined;
}

/** Joins given and family name, tolerating missing parts ("not applicable"). */
export function joinName(
  givenName: string | undefined,
  familyName: string | undefined,
): string | null {
  const parts = [cleanString(givenName), cleanString(familyName)].filter(
    (part): part is string => part !== null,
  );
  return parts.length > 0 ? parts.join(" ") : null;
}
