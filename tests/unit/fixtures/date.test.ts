import { describe, expect, it } from "vitest";
import {
  isoDateInZone,
  parseKickoff,
  parseUtcOffsetMinutes,
  zonedDayRangeUtc,
} from "../../../src/lib/date";

describe("parseUtcOffsetMinutes", () => {
  it("parses negative and positive whole-hour offsets", () => {
    expect(parseUtcOffsetMinutes("UTC-6")).toBe(-360);
    expect(parseUtcOffsetMinutes("UTC+2")).toBe(120);
  });
  it("parses half-hour offsets", () => {
    expect(parseUtcOffsetMinutes("UTC+05:30")).toBe(330);
    expect(parseUtcOffsetMinutes("UTC+0530")).toBe(330);
  });
  it("rejects nonsense", () => {
    expect(parseUtcOffsetMinutes("EST")).toBeNull();
    expect(parseUtcOffsetMinutes("UTC+99")).toBeNull();
  });
});

describe("parseKickoff", () => {
  it("computes a UTC instant from an explicit offset", () => {
    const result = parseKickoff("2026-06-11", "13:00 UTC-6");
    // 13:00 at UTC-6 is 19:00Z.
    expect(result.kickoffAtUtc?.toISOString()).toBe("2026-06-11T19:00:00.000Z");
    expect(result.venueTimeZone).toBe("UTC-6");
    expect(result.kickoffDateLabel).toBe("2026-06-11");
    expect(result.kickoffTimeLabel).toBe("13:00 UTC-6");
  });

  it("never assumes a zone when none is given", () => {
    const result = parseKickoff("2026-06-11", "13:00");
    expect(result.kickoffAtUtc).toBeNull();
    expect(result.venueTimeZone).toBeNull();
    expect(result.kickoffTimeLabel).toBe("13:00");
  });

  it("keeps the date label when there is no time", () => {
    const result = parseKickoff("2026-06-11", undefined);
    expect(result.kickoffAtUtc).toBeNull();
    expect(result.kickoffDateLabel).toBe("2026-06-11");
    expect(result.kickoffTimeLabel).toBeNull();
  });

  it("ignores malformed dates", () => {
    expect(parseKickoff("not-a-date", "13:00 UTC-6").kickoffDateLabel).toBeNull();
  });
});

describe("isoDateInZone / zonedDayRangeUtc", () => {
  it("returns the UTC calendar date", () => {
    expect(isoDateInZone(new Date("2026-06-11T19:00:00Z"), "UTC")).toBe(
      "2026-06-11",
    );
  });

  it("bounds a UTC day as a 24h window", () => {
    const { from, to } = zonedDayRangeUtc(new Date("2026-06-11T19:00:00Z"), "UTC");
    expect(from.toISOString()).toBe("2026-06-11T00:00:00.000Z");
    expect(to.toISOString()).toBe("2026-06-12T00:00:00.000Z");
  });
});
