// Pure display helpers for fixture components. Dates use the archive's UTC
// formatting; the kick-off time is shown as the source's own local label
// (e.g. "13:00 UTC-6") rather than re-zoned, so nothing is misrepresented.

import { formatDate, formatStage } from "@/lib/format";
import type { FixtureDto } from "@/server/fixtures/types";

const EN_DASH = "–";

/** "2–0", "2–0 (4–2 pens)", or null when there is no score yet. */
export function scoreLine(fixture: FixtureDto): string | null {
  if (fixture.homeScore === null || fixture.awayScore === null) return null;
  const base = `${fixture.homeScore}${EN_DASH}${fixture.awayScore}`;
  if (
    fixture.homePenaltyScore !== null &&
    fixture.awayPenaltyScore !== null
  ) {
    return `${base} (${fixture.homePenaltyScore}${EN_DASH}${fixture.awayPenaltyScore} pens)`;
  }
  return base;
}

/** Calendar date label for a fixture (UTC), or null. */
export function fixtureDateLabel(fixture: FixtureDto): string | null {
  return formatDate(fixture.kickoffAtUtc) ?? fixture.kickoffDateLabel;
}

/** Kick-off time label as recorded by the source (verbatim), or null. */
export function fixtureTimeLabel(fixture: FixtureDto): string | null {
  return fixture.kickoffTimeLabel;
}

/** "Group A · Round of 16"-style context line from group/stage/round. */
export function fixtureContext(fixture: FixtureDto): string | null {
  const parts = [
    fixture.groupName,
    formatStage(fixture.stage),
    fixture.stage === null ? formatStage(fixture.round) : null,
  ].filter((part): part is string => part !== null && part !== undefined);
  return parts.length > 0 ? [...new Set(parts)].join(" · ") : null;
}

/** Venue/city line, e.g. "Estadio Azteca, Mexico City". */
export function fixtureVenue(fixture: FixtureDto): string | null {
  const parts = [fixture.venueName, fixture.cityName].filter(
    (part): part is string => part !== null && part !== undefined,
  );
  return parts.length > 0 ? parts.join(", ") : null;
}

/** A short team label: code when present, else the name, else "TBD". */
export function teamLabel(name: string | null, code: string | null): string {
  if (name !== null && name.trim() !== "") return name;
  if (code !== null && code.trim() !== "") return code;
  return "TBD";
}

/**
 * Renders a flag only when it is a short glyph (emoji) — never an external URL,
 * which we will not load from an untrusted provider.
 */
export function safeFlagGlyph(flag: string | null): string | null {
  if (flag === null) return null;
  const trimmed = flag.trim();
  if (trimmed === "" || trimmed.length > 8) return null;
  if (/^https?:/i.test(trimmed) || /[a-z0-9]/i.test(trimmed)) return null;
  return trimmed;
}
