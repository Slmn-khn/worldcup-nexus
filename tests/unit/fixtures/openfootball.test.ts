import { describe, expect, it } from "vitest";
import { normalizeOpenFootballMatch } from "../../../src/server/fixtures/providers/openfootball";
import { openFootballMatchSchema } from "../../../src/server/fixtures/validators/openfootball";

const NOW = new Date("2026-06-16T12:00:00Z");

describe("normalizeOpenFootballMatch", () => {
  it("normalizes a finished group match with an explicit-offset kick-off", () => {
    const raw = openFootballMatchSchema.parse({
      round: "Matchday 1",
      date: "2026-06-11",
      time: "13:00 UTC-6",
      team1: "Mexico",
      team2: "South Africa",
      score: { ft: [2, 0], ht: [1, 0] },
      group: "Group A",
      ground: "Mexico City",
    });
    const fixture = normalizeOpenFootballMatch(raw, 0, NOW);
    expect(fixture).not.toBeNull();
    expect(fixture?.source).toBe("OPENFOOTBALL");
    expect(fixture?.homeTeamName).toBe("Mexico");
    expect(fixture?.awayTeamSlug).toBe("south-africa");
    expect(fixture?.homeScore).toBe(2);
    expect(fixture?.awayScore).toBe(0);
    expect(fixture?.status).toBe("FINISHED");
    expect(fixture?.kickoffAtUtc?.toISOString()).toBe("2026-06-11T19:00:00.000Z");
    expect(fixture?.groupName).toBe("Group A");
    expect(fixture?.cityName).toBe("Mexico City");
    expect(fixture?.sourcePriority).toBe(50);
    expect(fixture?.rawPayload).toBe(raw);
  });

  it("treats a future, scoreless match as SCHEDULED", () => {
    const raw = openFootballMatchSchema.parse({
      date: "2026-06-25",
      time: "20:00 UTC-4",
      team1: "Brazil",
      team2: "Spain",
      group: "Group H",
    });
    const fixture = normalizeOpenFootballMatch(raw, 1, NOW);
    expect(fixture?.status).toBe("SCHEDULED");
    expect(fixture?.homeScore).toBeNull();
  });

  it("derives a stable source id and keeps knockout placeholders", () => {
    const raw = openFootballMatchSchema.parse({
      round: "Round of 32",
      date: "2026-06-28",
      time: "12:00 UTC-5",
      team1: "1A",
      team2: "2B",
    });
    const fixture = normalizeOpenFootballMatch(raw, 5, NOW);
    expect(fixture?.sourceId).toContain("openfootball-2026-2026-06-28");
    expect(fixture?.homeTeamName).toBe("1A");
  });

  it("skips a match with neither teams nor a date", () => {
    const raw = openFootballMatchSchema.parse({ round: "Final" });
    expect(normalizeOpenFootballMatch(raw, 0, NOW)).toBeNull();
  });
});
