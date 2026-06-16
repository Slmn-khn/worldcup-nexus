import { describe, expect, it } from "vitest";
import { formatAge, getFreshness } from "../../../src/server/fixtures/freshness";

describe("formatAge", () => {
  it("describes minutes, hours, and days", () => {
    expect(formatAge(0)).toBe("just now");
    expect(formatAge(1)).toBe("1 minute ago");
    expect(formatAge(5)).toBe("5 minutes ago");
    expect(formatAge(60)).toBe("1 hour ago");
    expect(formatAge(150)).toBe("2 hours ago");
    expect(formatAge(60 * 24 * 3)).toBe("3 days ago");
  });
});

describe("getFreshness", () => {
  it("flags never-synced data as stale", () => {
    const result = getFreshness(null);
    expect(result.isStale).toBe(true);
    expect(result.label).toBe("Not yet synced");
    expect(result.lastSyncedAt).toBeNull();
  });

  it("reports a recent sync as fresh", () => {
    const now = new Date("2026-06-16T12:00:00Z");
    const result = getFreshness(new Date("2026-06-16T11:45:00Z"), now);
    expect(result.isStale).toBe(false);
    expect(result.ageMinutes).toBe(15);
    expect(result.label).toBe("Last synced 15 minutes ago");
  });

  it("marks an old sync stale", () => {
    const now = new Date("2026-06-16T12:00:00Z");
    const result = getFreshness(new Date("2026-06-16T03:00:00Z"), now);
    expect(result.isStale).toBe(true);
  });
});
