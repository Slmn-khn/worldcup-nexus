import { describe, expect, it, test } from "vitest";
import {
  getCountryDisplayCode,
  getFlagCodeForCountry,
  normalizeCountryKey,
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

// Every World Cup country/team in the archive: [name, archive 3-letter code,
// expected flag-icons code]. Resolution must work from the code alone, and from
// the name alone.
const archiveCases: Array<[string, string, string]> = [
  ["Algeria", "DZA", "dz"],
  ["Angola", "AGO", "ao"],
  ["Argentina", "ARG", "ar"],
  ["Australia", "AUS", "au"],
  ["Austria", "AUT", "at"],
  ["Belgium", "BEL", "be"],
  ["Bolivia", "BOL", "bo"],
  ["Bosnia and Herzegovina", "BIH", "ba"],
  ["Brazil", "BRA", "br"],
  ["Bulgaria", "BGR", "bg"],
  ["Cameroon", "CMR", "cm"],
  ["Canada", "CAN", "ca"],
  ["Chile", "CHL", "cl"],
  ["China", "CHN", "cn"],
  ["Chinese Taipei", "TWN", "tw"],
  ["Colombia", "COL", "co"],
  ["Costa Rica", "CRI", "cr"],
  ["Croatia", "HRV", "hr"],
  ["Cuba", "CUB", "cu"],
  ["Czech Republic", "CZE", "cz"],
  ["Czechoslovakia", "CSK", "cz"],
  ["Denmark", "DNK", "dk"],
  ["Dutch East Indies", "IDN", "id"],
  ["East Germany", "DDR", "de"],
  ["Ecuador", "ECU", "ec"],
  ["Egypt", "EGY", "eg"],
  ["El Salvador", "SLV", "sv"],
  ["England", "ENG", "gb-eng"],
  ["Equatorial Guinea", "GNQ", "gq"],
  ["France", "FRA", "fr"],
  ["Germany", "DEU", "de"],
  ["Ghana", "GHA", "gh"],
  ["Greece", "GRC", "gr"],
  ["Haiti", "HTI", "ht"],
  ["Honduras", "HND", "hn"],
  ["Hungary", "HUN", "hu"],
  ["Iceland", "ISL", "is"],
  ["Iran", "IRN", "ir"],
  ["Iraq", "IRQ", "iq"],
  ["Israel", "ISR", "il"],
  ["Italy", "ITA", "it"],
  ["Ivory Coast", "CIV", "ci"],
  ["Jamaica", "JAM", "jm"],
  ["Japan", "JPN", "jp"],
  ["Kuwait", "KWT", "kw"],
  ["Mexico", "MEX", "mx"],
  ["Morocco", "MAR", "ma"],
  ["Netherlands", "NLD", "nl"],
  ["New Zealand", "NZL", "nz"],
  ["Nigeria", "NGA", "ng"],
  ["North Korea", "PRK", "kp"],
  ["Northern Ireland", "NIR", "gb-nir"],
  ["Norway", "NOR", "no"],
  ["Panama", "PAN", "pa"],
  ["Paraguay", "PRY", "py"],
  ["Peru", "PER", "pe"],
  ["Poland", "POL", "pl"],
  ["Portugal", "PRT", "pt"],
  ["Qatar", "QAT", "qa"],
  ["Republic of Ireland", "IRL", "ie"],
  ["Romania", "ROU", "ro"],
  ["Russia", "RUS", "ru"],
  ["Saudi Arabia", "SAU", "sa"],
  ["Scotland", "SCO", "gb-sct"],
  ["Senegal", "SEN", "sn"],
  ["Serbia", "SRB", "rs"],
  ["Serbia and Montenegro", "SCG", "rs"],
  ["Slovakia", "SVK", "sk"],
  ["Slovenia", "SVN", "si"],
  ["South Africa", "ZAF", "za"],
  ["South Korea", "KOR", "kr"],
  ["Soviet Union", "SUN", "ru"],
  ["Spain", "ESP", "es"],
  ["Sweden", "SWE", "se"],
  ["Switzerland", "CHE", "ch"],
  ["Thailand", "THA", "th"],
  ["Togo", "TGO", "tg"],
  ["Trinidad and Tobago", "TTO", "tt"],
  ["Tunisia", "TUN", "tn"],
  ["Turkey", "TUR", "tr"],
  ["Ukraine", "UKR", "ua"],
  ["United Arab Emirates", "ARE", "ae"],
  ["United States", "USA", "us"],
  ["Uruguay", "URY", "uy"],
  ["Wales", "WAL", "gb-wls"],
  ["West Germany", "DEU", "de"],
  ["Yugoslavia", "YUG", "rs"],
  ["Zaire", "COD", "cd"],
];

describe("getFlagCodeForCountry — all archive countries", () => {
  test.each(archiveCases)("%s / %s maps to %s", (name, code, expected) => {
    expect(getFlagCodeForCountry({ name, code })).toBe(expected);
  });

  it("resolves from name alone (no code)", () => {
    for (const [name, , expected] of archiveCases) {
      expect(getFlagCodeForCountry({ name })).toBe(expected);
    }
  });

  it("resolves common 3-letter and short-code aliases", () => {
    expect(getFlagCodeForCountry({ code: "URU" })).toBe("uy");
    expect(getFlagCodeForCountry({ code: "GER" })).toBe("de");
    expect(getFlagCodeForCountry({ code: "NED" })).toBe("nl");
    expect(getFlagCodeForCountry({ code: "SUI" })).toBe("ch");
    expect(getFlagCodeForCountry({ code: "NEW" })).toBe("nz");
    expect(getFlagCodeForCountry({ code: "IRA" })).toBe("ir");
    expect(getFlagCodeForCountry({ code: "CAP" })).toBe("cv");
    expect(getFlagCodeForCountry({ name: "Curaçao", code: "CUR" })).toBe("cw");
  });

  it("normalizes accents, apostrophes, and ampersands", () => {
    expect(getFlagCodeForCountry({ name: "Côte d’Ivoire" })).toBe("ci");
    expect(getFlagCodeForCountry({ name: "Bosnia & Herzegovina" })).toBe("ba");
    expect(normalizeCountryKey("Côte d’Ivoire")).toBe("cote d ivoire");
    expect(normalizeCountryKey("Bosnia & Herzegovina")).toBe(
      "bosnia and herzegovina",
    );
  });

  it("resolves slugs and respects explicit flag/iso2 codes", () => {
    expect(getFlagCodeForCountry({ slug: "new-zealand" })).toBe("nz");
    expect(getFlagCodeForCountry({ slug: "west-germany" })).toBe("de");
    expect(getFlagCodeForCountry({ flagCode: "gb-eng" })).toBe("gb-eng");
    expect(getFlagCodeForCountry({ iso2Code: "BR" })).toBe("br");
  });

  it("never returns a raw, unresolved 3-letter code", () => {
    expect(getFlagCodeForCountry({ name: "Atlantis", code: "ZZZ" })).toBeNull();
  });
});
