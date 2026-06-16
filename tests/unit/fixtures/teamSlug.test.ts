import { describe, expect, it } from "vitest";
import { teamSlug } from "../../../src/lib/teamSlug";

describe("teamSlug", () => {
  it("slugifies names with diacritics", () => {
    expect(teamSlug("Côte d'Ivoire")).toBe("cote-d-ivoire");
    expect(teamSlug("South Korea")).toBe("south-korea");
  });
  it("handles knockout placeholder tokens", () => {
    expect(teamSlug("Winner Group A")).toBe("winner-group-a");
    expect(teamSlug("W73")).toBe("w73");
  });
  it("returns null for empty or nullish input", () => {
    expect(teamSlug(null)).toBeNull();
    expect(teamSlug(undefined)).toBeNull();
    expect(teamSlug("   ")).toBeNull();
  });
});
