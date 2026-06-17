// Country → flag-icons code resolution. Pure, dependency-light, server-safe.
//
// flag-icons renders a CSS flag from an ISO 3166-1 alpha-2 code (lowercased),
// e.g. `fi fi-br`, plus four UK home-nation subdivisions (`gb-eng`, `gb-sct`,
// `gb-wls`, `gb-nir`). The archive feeds us a mix of identifiers — explicit
// flag/ISO codes, 3-letter FIFA/IOC codes (e.g. DZA, ARG, DEU, SAU, NZL, CSK,
// SUN, YUG), kebab slugs, and historical World Cup names — so this module maps
// all of them onto a code flag-icons understands. Best-effort: when nothing
// resolves it returns null and the UI falls back to a neutral badge.
//
// flag-icons 7.x ships the gb-eng/gb-sct/gb-wls/gb-nir subdivision flags, so we
// use them directly. If a future flag-icons drop removes them, change the four
// `gb-*` values below to plain `gb`.

/** A normalized alpha-2 code is two ASCII letters. */
function isAlpha2(value: string): boolean {
  return /^[a-z]{2}$/.test(value);
}

/** flag-icons subdivision codes we explicitly allow. */
const SUPPORTED_SUBDIVISIONS = new Set([
  "gb-eng",
  "gb-sct",
  "gb-wls",
  "gb-nir",
]);

/** Lowercase + validate an explicit flag/ISO code (alpha-2 or supported gb-*). */
function toFlagIconCode(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const code = raw.trim().toLowerCase();
  if (code === "") return null;
  if (SUPPORTED_SUBDIVISIONS.has(code)) return code;
  if (isAlpha2(code)) return code;
  return null;
}

/** Uppercase trim, for the 3-letter code dictionaries. */
function normalizeCode(value: string): string {
  return value.trim().toUpperCase();
}

/**
 * Normalize a country name/key: fold accents, unify apostrophes, expand `&`,
 * drop punctuation, collapse whitespace. e.g. "Côte d'Ivoire" → "cote d ivoire",
 * "Bosnia & Herzegovina" → "bosnia and herzegovina".
 */
export function normalizeCountryKey(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      // Strip combining diacritical marks (U+0300–U+036F) left by NFD.
      .replace(/[̀-ͯ]/g, "")
      .replace(/['‘’`]/g, "'")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

// 3-letter FIFA/IOC codes (and a few 2-letter aliases) → flag-icons code.
const FLAG_CODE_BY_CODE: Record<string, string> = {
  // Africa
  DZA: "dz",
  ALG: "dz",
  AGO: "ao",
  CMR: "cm",
  CPV: "cv",
  CAP: "cv", // Cape Verde (archive/openfootball short code)
  EGY: "eg",
  GNQ: "gq",
  GHA: "gh",
  CIV: "ci",
  IVO: "ci",
  MAR: "ma",
  NGA: "ng",
  SEN: "sn",
  ZAF: "za",
  RSA: "za",
  TUN: "tn",
  TGO: "tg",
  COD: "cd",
  DRC: "cd",
  ZAI: "cd",

  // Asia
  CHN: "cn",
  TWN: "tw",
  TPE: "tw",
  IRN: "ir",
  IRA: "ir",
  IRQ: "iq",
  ISR: "il",
  JPN: "jp",
  JOR: "jo",
  KWT: "kw",
  PRK: "kp",
  KOR: "kr",
  ROK: "kr",
  QAT: "qa",
  SAU: "sa",
  THA: "th",
  UZB: "uz",
  ARE: "ae",
  UAE: "ae",

  // Europe
  AUT: "at",
  BEL: "be",
  BGR: "bg",
  BIH: "ba",
  HRV: "hr",
  CRO: "hr",
  CZE: "cz",
  CSK: "cz",
  TCH: "cz",
  DNK: "dk",
  DEN: "dk",
  DDR: "de",
  GDR: "de",
  ENG: "gb-eng",
  FRA: "fr",
  DEU: "de",
  GER: "de",
  FRG: "de",
  GRC: "gr",
  GRE: "gr",
  HUN: "hu",
  ISL: "is",
  ITA: "it",
  NLD: "nl",
  NED: "nl",
  HOL: "nl",
  NIR: "gb-nir",
  NOR: "no",
  POL: "pl",
  PRT: "pt",
  POR: "pt",
  IRL: "ie",
  ROU: "ro",
  ROM: "ro",
  RUS: "ru",
  SCO: "gb-sct",
  SRB: "rs",
  SCG: "rs",
  SVK: "sk",
  SVN: "si",
  SUN: "ru",
  URS: "ru",
  ESP: "es",
  SWE: "se",
  CHE: "ch",
  SUI: "ch",
  TUR: "tr",
  UKR: "ua",
  WAL: "gb-wls",
  YUG: "rs",

  // North/Central America & Caribbean
  CAN: "ca",
  CRI: "cr",
  CRC: "cr",
  CUB: "cu",
  CUW: "cw",
  CUR: "cw", // Curaçao (archive/openfootball short code)
  SLV: "sv",
  ESA: "sv",
  HTI: "ht",
  HON: "hn",
  HND: "hn",
  JAM: "jm",
  MEX: "mx",
  PAN: "pa",
  TTO: "tt",
  TRI: "tt",
  USA: "us",
  US: "us",

  // South America
  ARG: "ar",
  BOL: "bo",
  BRA: "br",
  CHL: "cl",
  COL: "co",
  ECU: "ec",
  PRY: "py",
  PAR: "py",
  PER: "pe",
  URY: "uy",
  URU: "uy",

  // Oceania
  AUS: "au",
  NZL: "nz",
  NEW: "nz",

  // Historic/special
  IDN: "id",
};

// Kebab slugs → flag-icons code.
const FLAG_CODE_BY_SLUG: Record<string, string> = {
  algeria: "dz",
  angola: "ao",
  argentina: "ar",
  australia: "au",
  austria: "at",
  belgium: "be",
  bolivia: "bo",
  "bosnia-and-herzegovina": "ba",
  brazil: "br",
  bulgaria: "bg",
  cameroon: "cm",
  canada: "ca",
  "cape-verde": "cv",
  chile: "cl",
  china: "cn",
  "chinese-taipei": "tw",
  colombia: "co",
  "costa-rica": "cr",
  croatia: "hr",
  cuba: "cu",
  curacao: "cw",
  "czech-republic": "cz",
  czechoslovakia: "cz",
  denmark: "dk",
  "dr-congo": "cd",
  "dutch-east-indies": "id",
  "east-germany": "de",
  ecuador: "ec",
  egypt: "eg",
  "el-salvador": "sv",
  england: "gb-eng",
  "equatorial-guinea": "gq",
  france: "fr",
  germany: "de",
  ghana: "gh",
  greece: "gr",
  haiti: "ht",
  honduras: "hn",
  hungary: "hu",
  iceland: "is",
  iran: "ir",
  iraq: "iq",
  israel: "il",
  italy: "it",
  "ivory-coast": "ci",
  jamaica: "jm",
  japan: "jp",
  jordan: "jo",
  kuwait: "kw",
  mexico: "mx",
  morocco: "ma",
  netherlands: "nl",
  "new-zealand": "nz",
  nigeria: "ng",
  "north-korea": "kp",
  "northern-ireland": "gb-nir",
  norway: "no",
  panama: "pa",
  paraguay: "py",
  peru: "pe",
  poland: "pl",
  portugal: "pt",
  qatar: "qa",
  "republic-of-ireland": "ie",
  romania: "ro",
  russia: "ru",
  "saudi-arabia": "sa",
  scotland: "gb-sct",
  senegal: "sn",
  serbia: "rs",
  "serbia-and-montenegro": "rs",
  slovakia: "sk",
  slovenia: "si",
  "south-africa": "za",
  "south-korea": "kr",
  "soviet-union": "ru",
  spain: "es",
  sweden: "se",
  switzerland: "ch",
  thailand: "th",
  togo: "tg",
  "trinidad-and-tobago": "tt",
  tunisia: "tn",
  turkey: "tr",
  ukraine: "ua",
  "united-arab-emirates": "ae",
  "united-states": "us",
  uruguay: "uy",
  uzbekistan: "uz",
  wales: "gb-wls",
  "west-germany": "de",
  yugoslavia: "rs",
  zaire: "cd",
};

// Display names (raw-lowercased AND normalized variants) → flag-icons code.
const FLAG_CODE_BY_NAME: Record<string, string> = {
  algeria: "dz",
  angola: "ao",
  argentina: "ar",
  australia: "au",
  austria: "at",
  belgium: "be",
  bolivia: "bo",
  "bosnia and herzegovina": "ba",
  "bosnia & herzegovina": "ba",
  brazil: "br",
  bulgaria: "bg",
  cameroon: "cm",
  canada: "ca",
  "cape verde": "cv",
  chile: "cl",
  china: "cn",
  "chinese taipei": "tw",
  colombia: "co",
  "costa rica": "cr",
  croatia: "hr",
  cuba: "cu",
  curacao: "cw",
  "czech republic": "cz",
  czechia: "cz",
  czechoslovakia: "cz",
  denmark: "dk",
  "dr congo": "cd",
  "congo dr": "cd",
  "democratic republic of the congo": "cd",
  "dutch east indies": "id",
  "east germany": "de",
  ecuador: "ec",
  egypt: "eg",
  "el salvador": "sv",
  england: "gb-eng",
  "equatorial guinea": "gq",
  france: "fr",
  germany: "de",
  ghana: "gh",
  greece: "gr",
  haiti: "ht",
  honduras: "hn",
  hungary: "hu",
  iceland: "is",
  iran: "ir",
  iraq: "iq",
  israel: "il",
  italy: "it",
  "ivory coast": "ci",
  "cote d'ivoire": "ci",
  "cote divoire": "ci",
  "cote d ivoire": "ci",
  "côte d’ivoire": "ci",
  "côte d ivoire": "ci",
  jamaica: "jm",
  japan: "jp",
  jordan: "jo",
  kuwait: "kw",
  mexico: "mx",
  morocco: "ma",
  netherlands: "nl",
  holland: "nl",
  "new zealand": "nz",
  nigeria: "ng",
  "north korea": "kp",
  "korea dpr": "kp",
  "northern ireland": "gb-nir",
  norway: "no",
  panama: "pa",
  paraguay: "py",
  peru: "pe",
  poland: "pl",
  portugal: "pt",
  qatar: "qa",
  "republic of ireland": "ie",
  ireland: "ie",
  romania: "ro",
  russia: "ru",
  "saudi arabia": "sa",
  scotland: "gb-sct",
  senegal: "sn",
  serbia: "rs",
  "serbia and montenegro": "rs",
  slovakia: "sk",
  slovenia: "si",
  "south africa": "za",
  "south korea": "kr",
  "korea republic": "kr",
  "republic of korea": "kr",
  "soviet union": "ru",
  ussr: "ru",
  spain: "es",
  sweden: "se",
  switzerland: "ch",
  thailand: "th",
  togo: "tg",
  "trinidad and tobago": "tt",
  tunisia: "tn",
  turkey: "tr",
  ukraine: "ua",
  "united arab emirates": "ae",
  uae: "ae",
  "u.a.e.": "ae",
  "united states": "us",
  usa: "us",
  "united states of america": "us",
  uruguay: "uy",
  uzbekistan: "uz",
  wales: "gb-wls",
  "west germany": "de",
  yugoslavia: "rs",
  zaire: "cd",
};

export type CountryFlagInput = {
  name?: string | null;
  slug?: string | null;
  code?: string | null;
  fifaCode?: string | null;
  iso2Code?: string | null;
  iso3Code?: string | null;
  flagCode?: string | null;
};

/**
 * Resolve a flag-icons code for a country. Preference order:
 * 1. Explicit `flagCode` (alpha-2 or supported gb-* subdivision).
 * 2. Explicit `iso2Code`.
 * 3. `code` via the 3-letter code dictionary.
 * 4. `fifaCode` via the 3-letter code dictionary.
 * 5. `slug` via the slug dictionary.
 * 6. `name` via the name dictionary (raw then normalized).
 * 7. A valid alpha-2 `code`/`fifaCode` as a last resort.
 * Returns null when nothing resolves (UI shows a neutral badge). Never returns a
 * raw, unresolved 3-letter code.
 */
export function getFlagCodeForCountry(input: CountryFlagInput): string | null {
  const fromFlagCode = toFlagIconCode(input.flagCode);
  if (fromFlagCode !== null) return fromFlagCode;

  const fromIso2 = toFlagIconCode(input.iso2Code);
  if (fromIso2 !== null) return fromIso2;

  if (input.code != null && input.code.trim() !== "") {
    const mapped = FLAG_CODE_BY_CODE[normalizeCode(input.code)];
    if (mapped !== undefined) return mapped;
  }

  if (input.fifaCode != null && input.fifaCode.trim() !== "") {
    const mapped = FLAG_CODE_BY_CODE[normalizeCode(input.fifaCode)];
    if (mapped !== undefined) return mapped;
  }

  if (input.slug != null && input.slug.trim() !== "") {
    const slug = input.slug.trim().toLowerCase();
    const mapped =
      FLAG_CODE_BY_SLUG[slug] ??
      FLAG_CODE_BY_SLUG[normalizeCountryKey(slug).replace(/ /g, "-")];
    if (mapped !== undefined) return mapped;
  }

  if (input.name != null && input.name.trim() !== "") {
    const direct = FLAG_CODE_BY_NAME[input.name.trim().toLowerCase()];
    if (direct !== undefined) return direct;
    const key = normalizeCountryKey(input.name);
    const normalized = FLAG_CODE_BY_NAME[key];
    if (normalized !== undefined) return normalized;
    // Spaceless variant catches dotted abbreviations, e.g. "U.S.A." → "u s a" →
    // "usa" and "U.A.E." → "uae".
    const collapsed = FLAG_CODE_BY_NAME[key.replace(/ /g, "")];
    if (collapsed !== undefined) return collapsed;
  }

  // Last resort: a field that is already a valid alpha-2 code (e.g. a country
  // row's ISO code stored in `code`). Never a raw 3-letter code.
  return toFlagIconCode(input.code) ?? toFlagIconCode(input.fifaCode);
}

/**
 * A short, human-facing display code for a country (e.g. for a neutral badge
 * when no flag resolves). Prefers an explicit code/fifaCode, else derives
 * 2–3 uppercase letters from the name. Never returns an empty string.
 */
export function getCountryDisplayCode(input: CountryFlagInput): string {
  for (const candidate of [
    input.code,
    input.fifaCode,
    input.iso3Code,
    input.iso2Code,
  ]) {
    const trimmed = candidate?.trim();
    if (trimmed != null && trimmed !== "")
      return trimmed.toUpperCase().slice(0, 3);
  }
  const name = input.name?.trim();
  if (name != null && name !== "") {
    const letters = name.replace(/[^A-Za-z]/g, "");
    if (letters !== "") return letters.toUpperCase().slice(0, 3);
  }
  return "—";
}
