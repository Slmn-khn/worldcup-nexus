import { describe, expect, it } from "vitest";
import {
  deriveOpenFootballStatus,
  fixtureToDto,
  isKickoffPast,
  logicalMatchKey,
  mapWorldcup26Status,
  selectCanonicalFixtures,
} from "../../../src/server/fixtures/normalize";
import type { StoredFixture } from "../../../src/server/fixtures/types";

const NOW = new Date("2026-06-16T12:00:00Z");

function storedFixture(overrides: Partial<StoredFixture>): StoredFixture {
  return {
    id: "id",
    source: "OPENFOOTBALL",
    sourceId: "src",
    tournamentYear: 2026,
    matchNumber: null,
    round: null,
    stage: null,
    groupName: "Group A",
    kickoffAtUtc: new Date("2026-06-11T19:00:00Z"),
    kickoffDateLabel: "2026-06-11",
    kickoffTimeLabel: "13:00 UTC-6",
    venueTimeZone: "UTC-6",
    homeTeamName: "Mexico",
    awayTeamName: "South Africa",
    homeTeamSlug: "mexico",
    awayTeamSlug: "south-africa",
    homeTeamCode: null,
    awayTeamCode: null,
    homeTeamFlag: null,
    awayTeamFlag: null,
    homeScore: null,
    awayScore: null,
    homePenaltyScore: null,
    awayPenaltyScore: null,
    status: "SCHEDULED",
    venueName: null,
    cityName: "Mexico City",
    countryName: null,
    sourcePriority: 50,
    sourceUpdatedAt: null,
    lastSyncedAt: NOW,
    ...overrides,
  };
}

describe("deriveOpenFootballStatus", () => {
  it("is FINISHED with a score in the past", () => {
    expect(
      deriveOpenFootballStatus(true, new Date("2026-06-11T19:00:00Z"), "2026-06-11", NOW),
    ).toBe("FINISHED");
  });
  it("is SCHEDULED without a score in the future", () => {
    expect(
      deriveOpenFootballStatus(false, new Date("2026-06-20T19:00:00Z"), "2026-06-20", NOW),
    ).toBe("SCHEDULED");
  });
  it("is UNKNOWN when undecidable", () => {
    expect(deriveOpenFootballStatus(true, null, null, NOW)).toBe("UNKNOWN");
    expect(deriveOpenFootballStatus(false, null, "2026-06-16", NOW)).toBe("UNKNOWN");
  });
});

describe("isKickoffPast", () => {
  it("compares instants", () => {
    expect(isKickoffPast(new Date("2026-06-01T00:00:00Z"), null, NOW)).toBe(true);
    expect(isKickoffPast(new Date("2026-07-01T00:00:00Z"), null, NOW)).toBe(false);
  });
  it("compares date labels and is undecided on the same day", () => {
    expect(isKickoffPast(null, "2026-06-10", NOW)).toBe(true);
    expect(isKickoffPast(null, "2026-06-20", NOW)).toBe(false);
    expect(isKickoffPast(null, "2026-06-16", NOW)).toBeNull();
  });
});

describe("mapWorldcup26Status", () => {
  it("maps known statuses", () => {
    expect(mapWorldcup26Status("live")).toBe("LIVE");
    expect(mapWorldcup26Status("HT")).toBe("HALF_TIME");
    expect(mapWorldcup26Status("finished")).toBe("FINISHED");
    expect(mapWorldcup26Status("not_started")).toBe("SCHEDULED");
    expect(mapWorldcup26Status("postponed")).toBe("POSTPONED");
    expect(mapWorldcup26Status("abandoned")).toBe("CANCELLED");
  });
  it("falls back to UNKNOWN", () => {
    expect(mapWorldcup26Status("banana")).toBe("UNKNOWN");
    expect(mapWorldcup26Status(null)).toBe("UNKNOWN");
  });
});

describe("logicalMatchKey", () => {
  it("is order-independent across the two teams", () => {
    const a = storedFixture({ homeTeamSlug: "mexico", awayTeamSlug: "south-africa" });
    const b = storedFixture({ homeTeamSlug: "south-africa", awayTeamSlug: "mexico" });
    expect(logicalMatchKey(a)).toBe(logicalMatchKey(b));
  });
});

describe("selectCanonicalFixtures", () => {
  it("merges two providers, live source wins and baseline backfills", () => {
    const baseline = storedFixture({
      id: "of",
      source: "OPENFOOTBALL",
      sourcePriority: 50,
      status: "SCHEDULED",
      venueName: "Estadio Azteca",
      homeScore: null,
      awayScore: null,
    });
    const live = storedFixture({
      id: "wc",
      source: "WORLDCUP26",
      sourcePriority: 10,
      status: "LIVE",
      homeScore: 1,
      awayScore: 0,
      venueName: null, // live provider lacks the venue
    });
    const result = selectCanonicalFixtures([baseline, live]);
    expect(result).toHaveLength(1);
    const merged = result[0];
    expect(merged.id).toBe("wc"); // live wins as primary
    expect(merged.status).toBe("LIVE");
    expect(merged.homeScore).toBe(1);
    expect(merged.venueName).toBe("Estadio Azteca"); // backfilled from baseline
  });

  it("keeps unrelated matches separate", () => {
    const a = storedFixture({ id: "a", homeTeamSlug: "mexico", awayTeamSlug: "south-africa" });
    const b = storedFixture({
      id: "b",
      homeTeamSlug: "canada",
      awayTeamSlug: "bosnia",
      kickoffAtUtc: new Date("2026-06-12T19:00:00Z"),
      kickoffDateLabel: "2026-06-12",
    });
    expect(selectCanonicalFixtures([a, b])).toHaveLength(2);
  });
});

describe("fixtureToDto", () => {
  it("serializes dates and never includes rawPayload", () => {
    const dto = fixtureToDto(storedFixture({ homeScore: 2, awayScore: 0, status: "FINISHED" }));
    expect(dto.kickoffAtUtc).toBe("2026-06-11T19:00:00.000Z");
    expect(dto.lastSyncedAt).toBe(NOW.toISOString());
    expect(dto.sourceLabel).toBe("OpenFootball");
    expect("rawPayload" in dto).toBe(false);
  });
});
