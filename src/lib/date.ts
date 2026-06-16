// Pure date helpers for the 2026 fixture pipeline. No timezone guessing:
// a UTC instant is only produced when the source gives an explicit offset
// (see docs/DATA_ISSUES.md — kick-off times are otherwise verbatim local).

/** Parsed parts of a kick-off, preserving the source labels verbatim. */
export type ParsedKickoff = {
  /** UTC instant — only set when an explicit offset was present. */
  kickoffAtUtc: Date | null;
  /** Raw date label, e.g. "2026-06-11" (null when unparseable). */
  kickoffDateLabel: string | null;
  /** Raw time label, e.g. "13:00 UTC-6" (null when absent). */
  kickoffTimeLabel: string | null;
  /** Offset label, e.g. "UTC-6" — null when the source gave no zone. */
  venueTimeZone: string | null;
};

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
// "13:00", "13:00 UTC-6", "16:00 UTC+2", "9:05 UTC+05:30"
const TIME_RE =
  /^\s*(\d{1,2}):(\d{2})(?:\s*(UTC([+-])(\d{1,2})(?::?(\d{2}))?))?\s*$/i;

/** Offset of a "UTC-6" / "UTC+05:30" token, in minutes (UTC+ is positive). */
export function parseUtcOffsetMinutes(token: string): number | null {
  const match = /^UTC([+-])(\d{1,2})(?::?(\d{2}))?$/i.exec(token.trim());
  if (match === null) return null;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = match[3] !== undefined ? Number(match[3]) : 0;
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours > 14 || minutes > 59) return null;
  return sign * (hours * 60 + minutes);
}

/**
 * Combines a source date ("2026-06-11") and optional time ("13:00 UTC-6")
 * into a {@link ParsedKickoff}. A UTC instant is produced only when both the
 * date and an explicit offset parse cleanly — otherwise the labels are kept
 * and `kickoffAtUtc` stays null (no zone is ever assumed).
 */
export function parseKickoff(
  date: string | null | undefined,
  time: string | null | undefined,
): ParsedKickoff {
  const dateLabel =
    typeof date === "string" && DATE_RE.test(date.trim()) ? date.trim() : null;
  const timeLabel =
    typeof time === "string" && time.trim() !== "" ? time.trim() : null;

  const result: ParsedKickoff = {
    kickoffAtUtc: null,
    kickoffDateLabel: dateLabel,
    kickoffTimeLabel: timeLabel,
    venueTimeZone: null,
  };

  if (dateLabel === null || timeLabel === null) return result;

  const timeMatch = TIME_RE.exec(timeLabel);
  if (timeMatch === null) return result;

  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  if (hour > 23 || minute > 59) return result;

  const zoneToken = timeMatch[3];
  if (zoneToken === undefined) return result; // time but no zone → no instant
  const offsetMinutes = parseUtcOffsetMinutes(zoneToken);
  if (offsetMinutes === null) return result;

  result.venueTimeZone = zoneToken.toUpperCase().replace(/\s+/g, "");

  const dateMatch = DATE_RE.exec(dateLabel);
  if (dateMatch === null) return result;
  const [, y, m, d] = dateMatch;
  // Treat the wall-clock components as UTC, then subtract the offset to get
  // the true UTC instant. e.g. 13:00 at UTC-6 → 19:00Z.
  const asIfUtc = Date.UTC(Number(y), Number(m) - 1, Number(d), hour, minute);
  result.kickoffAtUtc = new Date(asIfUtc - offsetMinutes * 60_000);
  return result;
}

/** ISO calendar date (YYYY-MM-DD) of an instant, evaluated in a time zone. */
export function isoDateInZone(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
  return parts; // en-CA yields "YYYY-MM-DD"
}

/**
 * UTC instants bounding the calendar day that contains `now` in `timeZone`.
 * `[from, to)` — `to` is the start of the next day. Defaults to UTC.
 */
export function zonedDayRangeUtc(
  now: Date,
  timeZone = "UTC",
): { from: Date; to: Date } {
  const today = isoDateInZone(now, timeZone);
  const from = zonedMidnightUtc(today, timeZone);
  const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);
  return { from, to };
}

/** The UTC instant of local midnight for `isoDate` (YYYY-MM-DD) in `timeZone`. */
export function zonedMidnightUtc(isoDate: string, timeZone = "UTC"): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  // Guess the instant as if the wall time were UTC, then correct by the zone's
  // actual offset at that moment (offset can shift across DST, so re-evaluate).
  const guess = Date.UTC(y, m - 1, d, 0, 0, 0);
  const offsetMs = zoneOffsetMs(new Date(guess), timeZone);
  return new Date(guess - offsetMs);
}

/** Offset of `timeZone` from UTC at `instant`, in milliseconds (UTC+ positive). */
function zoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") === 24 ? 0 : get("hour"),
    get("minute"),
    get("second"),
  );
  return asUtc - instant.getTime();
}
