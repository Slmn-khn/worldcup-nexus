// Country → flag-icons code resolution. Pure, dependency-light, server-safe.
//
// flag-icons renders a CSS flag from an ISO 3166-1 alpha-2 code (lowercased),
// e.g. `fi fi-br`. A few subdivisions are supported (e.g. `gb-eng`). This
// module maps the archive's various country identifiers — explicit flag/ISO
// codes, FIFA codes, and historical World Cup names — onto a code flag-icons
// understands. Everything is best-effort: when nothing maps, it returns null
// and the UI falls back to a neutral badge.

/** A normalized alpha-2 code is two ASCII letters. */
function isAlpha2(value: string): boolean {
  return /^[a-z]{2}$/.test(value);
}

/** flag-icons subdivision codes we explicitly allow (kept tiny on purpose). */
const SUPPORTED_SUBDIVISIONS = new Set(["gb-eng", "gb-sct", "gb-wls", "gb-nir"]);

function normalizeCode(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const code = raw.trim().toLowerCase();
  if (code === "") return null;
  if (SUPPORTED_SUBDIVISIONS.has(code)) return code;
  if (isAlpha2(code)) return code;
  return null;
}

/** FIFA tri-code → ISO alpha-2 for nations that differ from a naive guess. */
const FIFA_CODE_TO_ISO2: Record<string, string> = {
  bra: "br",
  arg: "ar",
  ger: "de",
  frg: "de", // West Germany
  gdr: "de", // East Germany (no distinct flag-icons code) → de fallback
  fra: "fr",
  ita: "it",
  esp: "es",
  eng: "gb-eng",
  ned: "nl",
  hol: "nl",
  uru: "uy",
  por: "pt",
  usa: "us",
  mex: "mx",
  qat: "qa",
  rsa: "za",
  jpn: "jp",
  kor: "kr",
  prk: "kp", // North Korea
  cro: "hr",
  mar: "ma",
  bel: "be",
  swe: "se",
  sui: "ch",
  srb: "rs",
  urs: "ru", // Soviet Union → ru fallback
  yug: "rs", // Yugoslavia → rs fallback
  tch: "cz", // Czechoslovakia → cz fallback
  cze: "cz",
  scg: "rs", // Serbia and Montenegro → rs fallback
};

/** Country display name (normalized) → flag-icons code. */
const NAME_TO_CODE: Record<string, string> = {
  brazil: "br",
  argentina: "ar",
  germany: "de",
  "west germany": "de",
  "east germany": "de",
  "fr germany": "de",
  france: "fr",
  italy: "it",
  spain: "es",
  england: "gb-eng",
  netherlands: "nl",
  holland: "nl",
  uruguay: "uy",
  portugal: "pt",
  usa: "us",
  "united states": "us",
  "united states of america": "us",
  mexico: "mx",
  qatar: "qa",
  "south africa": "za",
  japan: "jp",
  "south korea": "kr",
  "korea republic": "kr",
  "republic of korea": "kr",
  "north korea": "kp",
  "korea dpr": "kp",
  croatia: "hr",
  morocco: "ma",
  belgium: "be",
  sweden: "se",
  switzerland: "ch",
  serbia: "rs",
  "soviet union": "ru",
  ussr: "ru",
  yugoslavia: "rs",
  czechoslovakia: "cz",
  "czech republic": "cz",
  czechia: "cz",
  "serbia and montenegro": "rs",
  scotland: "gb-sct",
  wales: "gb-wls",
  "northern ireland": "gb-nir",
};

function normalizeName(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const name = raw
    .trim()
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ");
  return name === "" ? null : name;
}

export type CountryFlagInput = {
  name?: string | null;
  code?: string | null;
  fifaCode?: string | null;
  iso2Code?: string | null;
  iso3Code?: string | null;
  flagCode?: string | null;
};

/**
 * Resolve a flag-icons code for a country. Preference order:
 * 1. Explicit flagCode / iso2Code (if a valid alpha-2 or supported subdivision).
 * 2. Known FIFA tri-code mapping.
 * 3. Known country-name mapping (incl. historical World Cup names).
 * 4. A plain alpha-2 `code` as a last resort.
 * Returns null when nothing resolves (the UI then shows a neutral fallback).
 */
export function getFlagCodeForCountry(input: CountryFlagInput): string | null {
  const fromFlagCode = normalizeCode(input.flagCode);
  if (fromFlagCode !== null) return fromFlagCode;

  const fromIso2 = normalizeCode(input.iso2Code);
  if (fromIso2 !== null) return fromIso2;

  const fifa = input.fifaCode?.trim().toLowerCase();
  if (fifa != null && fifa !== "") {
    const mapped = FIFA_CODE_TO_ISO2[fifa];
    if (mapped !== undefined) return mapped;
    // A 2-letter "fifaCode" might already be ISO alpha-2.
    if (isAlpha2(fifa)) return fifa;
  }

  const name = normalizeName(input.name);
  if (name !== null) {
    const mapped = NAME_TO_CODE[name];
    if (mapped !== undefined) return mapped;
  }

  // Last resort: a generic alpha-2 code field.
  const fromCode = normalizeCode(input.code);
  if (fromCode !== null) return fromCode;

  return null;
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
