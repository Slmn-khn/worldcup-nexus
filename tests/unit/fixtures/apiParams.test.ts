import { describe, expect, it } from "vitest";
import { parseFixtureListQuery } from "../../../src/server/fixtures/apiParams";

function parse(query: string) {
  return parseFixtureListQuery(new URLSearchParams(query));
}

describe("parseFixtureListQuery", () => {
  it("parses valid params", () => {
    const result = parse(
      "from=2026-06-11&to=2026-06-12&status=FINISHED&group=Group A&limit=10",
    );
    expect(result.from?.toISOString()).toBe("2026-06-11T00:00:00.000Z");
    expect(result.status).toBe("FINISHED");
    expect(result.group).toBe("Group A");
    expect(result.limit).toBe(10);
  });

  it("ignores absent params", () => {
    const result = parse("");
    expect(result.from).toBeUndefined();
    expect(result.status).toBeUndefined();
    expect(result.limit).toBeUndefined();
  });

  it("rejects an invalid status", () => {
    expect(() => parse("status=NONSENSE")).toThrow();
  });

  it("rejects an invalid date", () => {
    expect(() => parse("from=not-a-date")).toThrow();
  });

  it("rejects an out-of-range limit", () => {
    expect(() => parse("limit=99999")).toThrow();
  });
});
