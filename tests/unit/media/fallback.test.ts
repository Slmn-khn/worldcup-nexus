import { describe, expect, it } from "vitest";
import { getMediaFallbackForEntity } from "../../../src/server/media/fallback";

// Note: the "only APPROVED media is returned" guarantee lives in the query
// where-clause (src/server/media/queries.ts → mediaAsset.status = APPROVED) and
// requires a database to exercise end-to-end. The unit-testable contract here
// is the fallback: every entity type yields a neutral, data-free placeholder so
// pages render with zero media rows.

describe("getMediaFallbackForEntity", () => {
  it("maps player → silhouette", () => {
    expect(getMediaFallbackForEntity({ entityType: "PLAYER" }).kind).toBe(
      "silhouette",
    );
  });

  it("maps country → flag", () => {
    expect(getMediaFallbackForEntity({ entityType: "COUNTRY" }).kind).toBe(
      "flag",
    );
  });

  it("maps tournament → dark gradient", () => {
    expect(getMediaFallbackForEntity({ entityType: "TOURNAMENT" }).kind).toBe(
      "tournament-gradient",
    );
  });

  it("maps match/event → event cover", () => {
    expect(getMediaFallbackForEntity({ entityType: "MATCH" }).kind).toBe(
      "event",
    );
    expect(
      getMediaFallbackForEntity({ entityType: "ICONIC_MOMENT" }).kind,
    ).toBe("event");
  });

  it("maps generic/record → gradient", () => {
    expect(getMediaFallbackForEntity({ entityType: "GENERIC" }).kind).toBe(
      "gradient",
    );
    expect(getMediaFallbackForEntity({ entityType: "RECORD" }).kind).toBe(
      "gradient",
    );
  });
});
