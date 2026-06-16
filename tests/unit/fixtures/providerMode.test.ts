import { describe, expect, it } from "vitest";
import {
  DEFAULT_PROVIDER_MODE,
  parseFixtureProviderMode,
} from "../../../src/server/fixtures/constants";

describe("parseFixtureProviderMode", () => {
  it("accepts every valid mode", () => {
    expect(parseFixtureProviderMode("openfootball-only")).toBe("openfootball-only");
    expect(parseFixtureProviderMode("worldcup26-only")).toBe("worldcup26-only");
    expect(parseFixtureProviderMode("openfootball-first")).toBe("openfootball-first");
    expect(parseFixtureProviderMode("live-first")).toBe("live-first");
  });

  it("trims surrounding whitespace", () => {
    expect(parseFixtureProviderMode("  live-first  ")).toBe("live-first");
  });

  it("defaults to openfootball-only for missing/invalid input", () => {
    expect(DEFAULT_PROVIDER_MODE).toBe("openfootball-only");
    expect(parseFixtureProviderMode(undefined)).toBe("openfootball-only");
    expect(parseFixtureProviderMode(null)).toBe("openfootball-only");
    expect(parseFixtureProviderMode("")).toBe("openfootball-only");
    expect(parseFixtureProviderMode("nonsense")).toBe("openfootball-only");
    expect(parseFixtureProviderMode("OPENFOOTBALL-ONLY")).toBe("openfootball-only");
  });
});
