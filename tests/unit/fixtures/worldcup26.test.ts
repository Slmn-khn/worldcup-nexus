import { describe, expect, it } from "vitest";
import {
  buildWorldcup26GamesUrl,
  normalizeWorldcup26Match,
} from "../../../src/server/fixtures/providers/worldcup26";
import { worldcup26MatchSchema } from "../../../src/server/fixtures/validators/worldcup26";

describe("buildWorldcup26GamesUrl", () => {
  it("appends /get/games to the base host", () => {
    expect(buildWorldcup26GamesUrl("https://worldcup26.ir")).toBe(
      "https://worldcup26.ir/get/games",
    );
  });
  it("normalizes trailing slashes", () => {
    expect(buildWorldcup26GamesUrl("https://worldcup26.ir/")).toBe(
      "https://worldcup26.ir/get/games",
    );
    expect(buildWorldcup26GamesUrl("https://worldcup26.ir///")).toBe(
      "https://worldcup26.ir/get/games",
    );
  });
  it("trims surrounding whitespace", () => {
    expect(buildWorldcup26GamesUrl("  https://worldcup26.ir  ")).toBe(
      "https://worldcup26.ir/get/games",
    );
  });
});

describe("normalizeWorldcup26Match", () => {
  it("normalizes a live match with object teams and a nested score", () => {
    const raw = worldcup26MatchSchema.parse({
      id: 42,
      status: "live",
      group: "Group A",
      utcDate: "2026-06-11T19:00:00Z",
      home: { name: "Mexico", code: "MEX" },
      away: { name: "South Africa", code: "RSA" },
      score: { home: 1, away: 0 },
    });
    const fixture = normalizeWorldcup26Match(raw, 0);
    expect(fixture?.source).toBe("WORLDCUP26");
    expect(fixture?.sourceId).toBe("42");
    expect(fixture?.status).toBe("LIVE");
    expect(fixture?.homeTeamCode).toBe("MEX");
    expect(fixture?.homeScore).toBe(1);
    expect(fixture?.awayScore).toBe(0);
    expect(fixture?.kickoffAtUtc?.toISOString()).toBe("2026-06-11T19:00:00.000Z");
    expect(fixture?.sourcePriority).toBe(10);
  });

  it("reads an ft array score and unknown status", () => {
    const raw = worldcup26MatchSchema.parse({
      matchId: "x9",
      state: "weird-state",
      homeTeam: "Canada",
      awayTeam: "Bosnia",
      score: { ft: [1, 1] },
    });
    const fixture = normalizeWorldcup26Match(raw, 0);
    expect(fixture?.homeScore).toBe(1);
    expect(fixture?.awayScore).toBe(1);
    expect(fixture?.status).toBe("UNKNOWN");
  });

  it("synthesizes an id when none is provided but a team exists", () => {
    const raw = worldcup26MatchSchema.parse({ team1: "Brazil", team2: "Spain" });
    const fixture = normalizeWorldcup26Match(raw, 7);
    expect(fixture?.sourceId).toBe("worldcup26-2026-i7");
  });

  it("skips an unusable record (no id, no teams)", () => {
    const raw = worldcup26MatchSchema.parse({ status: "live" });
    expect(normalizeWorldcup26Match(raw, 0)).toBeNull();
  });
});
