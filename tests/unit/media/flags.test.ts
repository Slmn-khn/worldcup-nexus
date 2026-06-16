import { describe, expect, it } from "vitest";
import {
  getCountryDisplayCode,
  getFlagCodeForCountry,
} from "../../../src/lib/media/flags";

describe("getFlagCodeForCountry", () => {
  it("prefers an explicit flagCode/iso2Code", () => {
    expect(getFlagCodeForCountry({ flagCode: "BR", name: "Germany" })).toBe(
      "br",
    );
    expect(getFlagCodeForCountry({ iso2Code: "NL" })).toBe("nl");
  });

  it("maps common World Cup country names", () => {
    expect(getFlagCodeForCountry({ name: "Brazil" })).toBe("br");
    expect(getFlagCodeForCountry({ name: "Argentina" })).toBe("ar");
    expect(getFlagCodeForCountry({ name: "England" })).toBe("gb-eng");
    expect(getFlagCodeForCountry({ name: "Netherlands" })).toBe("nl");
    expect(getFlagCodeForCountry({ name: "USA" })).toBe("us");
    expect(getFlagCodeForCountry({ name: "United States" })).toBe("us");
  });

  it("maps historical names to fallbacks", () => {
    expect(getFlagCodeForCountry({ name: "West Germany" })).toBe("de");
    expect(getFlagCodeForCountry({ name: "Soviet Union" })).toBe("ru");
    expect(getFlagCodeForCountry({ name: "Yugoslavia" })).toBe("rs");
    expect(getFlagCodeForCountry({ name: "Czechoslovakia" })).toBe("cz");
  });

  it("maps FIFA tri-codes", () => {
    expect(getFlagCodeForCountry({ fifaCode: "GER" })).toBe("de");
    expect(getFlagCodeForCountry({ fifaCode: "ENG" })).toBe("gb-eng");
    expect(getFlagCodeForCountry({ fifaCode: "KOR" })).toBe("kr");
  });

  it("is case-insensitive and tolerant of punctuation/whitespace", () => {
    expect(getFlagCodeForCountry({ name: "  south korea " })).toBe("kr");
    expect(getFlagCodeForCountry({ name: "U.S.A." })).toBe("us");
  });

  it("returns null when nothing resolves", () => {
    expect(getFlagCodeForCountry({})).toBeNull();
    expect(getFlagCodeForCountry({ name: "Atlantis" })).toBeNull();
    expect(getFlagCodeForCountry({ name: null, code: null })).toBeNull();
  });
});

describe("getCountryDisplayCode", () => {
  it("uses an explicit code when present", () => {
    expect(getCountryDisplayCode({ code: "bra" })).toBe("BRA");
    expect(getCountryDisplayCode({ fifaCode: "ger" })).toBe("GER");
  });

  it("derives letters from the name otherwise", () => {
    expect(getCountryDisplayCode({ name: "Brazil" })).toBe("BRA");
  });

  it("never returns an empty string", () => {
    expect(getCountryDisplayCode({})).toBe("—");
    expect(getCountryDisplayCode({ name: "   " })).toBe("—");
  });
});
