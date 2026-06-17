import { describe, expect, it } from "vitest";
import { getInitials } from "../../../src/lib/media/initials";

describe("getInitials (portrait fallback)", () => {
  it("takes first + last word initials", () => {
    expect(getInitials("Lionel Messi")).toBe("LM");
    expect(getInitials("Cristiano Ronaldo")).toBe("CR");
    expect(getInitials("Diego Armando Maradona")).toBe("DM");
  });

  it("handles single-word names", () => {
    expect(getInitials("Pelé")).toBe("P");
    expect(getInitials("Cafú")).toBe("C");
  });

  it("collapses extra whitespace", () => {
    expect(getInitials("  Gerd   Müller  ")).toBe("GM");
  });

  it("returns empty string for blank/nullish input", () => {
    expect(getInitials("")).toBe("");
    expect(getInitials("   ")).toBe("");
    expect(getInitials(null)).toBe("");
    expect(getInitials(undefined)).toBe("");
  });
});
