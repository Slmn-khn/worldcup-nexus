// Constants for the canonical 2026 promotion import (worldcupnexus_2026_data
// bundle → Tournament/Team/Match/Player/… tables). Pure data, no imports, so
// the tsx CLI and hermetic unit tests can both load it.

/** Namespace for DataImportRun / RawSourceRecord rows written by this import. */
export const IMPORT_SOURCE = "wcn-2026-bundle";
export const TOURNAMENT_YEAR = 2026;

/** Prefixes for canonical `sourceId` values (sourceSystem + externalId). */
export const CANDIDATE_NS = "mominul2026";
export const OFFICIAL_NS = "fifa2026";

export const sourceIdFor = {
  tournament: () => `${OFFICIAL_NS}:tournament`,
  team: (id: number) => `${CANDIDATE_NS}:team:${id}`,
  country: (fifaCode: string) => `fifa:${fifaCode}`,
  venue: (id: number) => `${CANDIDATE_NS}:venue:${id}`,
  referee: (id: number) => `${CANDIDATE_NS}:referee:${id}`,
  player: (id: number) => `${CANDIDATE_NS}:player:${id}`,
  match: (id: number) => `${CANDIDATE_NS}:match:${id}`,
  goal: (eventId: number) => `${CANDIDATE_NS}:event:${eventId}`,
  shootoutKick: (eventId: number) => `${CANDIDATE_NS}:event:${eventId}`,
  award: (slug: string) => `${OFFICIAL_NS}:award:${slug}`,
} as const;

export const DEFAULT_BUNDLE_DIR = "docs/worldcupnexus_2026_data";
export const APPROVAL_FILE = "data/2026/approved/approval.json";

export const FIFA_AWARDS_URL =
  "https://digitalhub.fifa.com/asset/5f21873f-792f-4972-9f55-96e73ac61a01/FIFA-World-Cup-2026-Official-FIFA-Awards.pdf";
export const CANDIDATE_DATASET_URL =
  "https://github.com/mominullptr/FIFA-World-Cup-2026-Dataset";

/**
 * Candidate stage names → canonical `Match.stage` strings. The canonical
 * values match the 2014–2022 Fjelstul rows ("quarter-finals", …); "round of
 * 32" is new and first-class, never folded into "round of 16".
 */
export const STAGE_MAP: Record<string, string> = {
  "Group Stage": "group stage",
  "Round of 32": "round of 32",
  "Round of 16": "round of 16",
  "Quarter-finals": "quarter-finals",
  "Semi-finals": "semi-finals",
  "Third-place match": "third-place match",
  Final: "final",
};

/** Canonical knockout order, earliest round first. */
export const KNOCKOUT_STAGE_ORDER = [
  "round of 32",
  "round of 16",
  "quarter-finals",
  "semi-finals",
  "third-place match",
  "final",
] as const;

export const EXPECTED_STAGE_COUNTS: Record<string, number> = {
  "group stage": 72,
  "round of 32": 16,
  "round of 16": 8,
  "quarter-finals": 4,
  "semi-finals": 2,
  "third-place match": 1,
  final: 1,
};

/** Candidate squad positions → the canonical Fjelstul abbreviations. */
export const POSITION_MAP: Record<string, string> = {
  GK: "GK",
  DEF: "DF",
  MID: "MF",
  FWD: "FW",
};

export type CountryResolution =
  | { kind: "existing"; slug: string }
  | {
      kind: "new";
      name: string;
      slug: string;
      iso3: string;
      /** Predecessor identity kept for the reconciliation report only. */
      historicalNote?: string;
    };

/**
 * Reviewed FIFA-code → canonical Country mapping for all 48 teams. Explicit
 * on purpose: names alone are unreliable ("Congo DR", "IR Iran", "Türkiye",
 * "USA"), and the canonical Country rows use ISO-style codes (DEU, NLD, CHE).
 * `aliases` lists the candidate display names each entry is allowed to carry;
 * the validator fails if a team's name is not in its alias list.
 *
 * DR Congo follows the archive's existing era-naming precedent (West Germany
 * vs Germany, Soviet Union vs Russia): the 1974 "Zaire" row is kept and a new
 * "DR Congo" country is created, with the lineage recorded in the report.
 */
export const COUNTRY_BY_FIFA_CODE: Record<
  string,
  { resolution: CountryResolution; aliases: string[] }
> = {
  MEX: { resolution: { kind: "existing", slug: "mexico" }, aliases: ["Mexico"] },
  RSA: { resolution: { kind: "existing", slug: "south-africa" }, aliases: ["South Africa"] },
  KOR: { resolution: { kind: "existing", slug: "south-korea" }, aliases: ["South Korea", "Korea Republic"] },
  CZE: { resolution: { kind: "existing", slug: "czech-republic" }, aliases: ["Czechia", "Czech Republic"] },
  CAN: { resolution: { kind: "existing", slug: "canada" }, aliases: ["Canada"] },
  BIH: { resolution: { kind: "existing", slug: "bosnia-and-herzegovina" }, aliases: ["Bosnia and Herzegovina"] },
  QAT: { resolution: { kind: "existing", slug: "qatar" }, aliases: ["Qatar"] },
  SUI: { resolution: { kind: "existing", slug: "switzerland" }, aliases: ["Switzerland"] },
  BRA: { resolution: { kind: "existing", slug: "brazil" }, aliases: ["Brazil"] },
  MAR: { resolution: { kind: "existing", slug: "morocco" }, aliases: ["Morocco"] },
  HAI: { resolution: { kind: "existing", slug: "haiti" }, aliases: ["Haiti"] },
  SCO: { resolution: { kind: "existing", slug: "scotland" }, aliases: ["Scotland"] },
  USA: { resolution: { kind: "existing", slug: "united-states" }, aliases: ["USA", "United States"] },
  PAR: { resolution: { kind: "existing", slug: "paraguay" }, aliases: ["Paraguay"] },
  AUS: { resolution: { kind: "existing", slug: "australia" }, aliases: ["Australia"] },
  TUR: { resolution: { kind: "existing", slug: "turkey" }, aliases: ["Türkiye", "Turkey"] },
  GER: { resolution: { kind: "existing", slug: "germany" }, aliases: ["Germany"] },
  CUW: {
    resolution: { kind: "new", name: "Curaçao", slug: "curacao", iso3: "CUW" },
    aliases: ["Curaçao", "Curacao"],
  },
  CIV: { resolution: { kind: "existing", slug: "ivory-coast" }, aliases: ["Côte d'Ivoire", "Ivory Coast"] },
  ECU: { resolution: { kind: "existing", slug: "ecuador" }, aliases: ["Ecuador"] },
  NED: { resolution: { kind: "existing", slug: "netherlands" }, aliases: ["Netherlands"] },
  JPN: { resolution: { kind: "existing", slug: "japan" }, aliases: ["Japan"] },
  SWE: { resolution: { kind: "existing", slug: "sweden" }, aliases: ["Sweden"] },
  TUN: { resolution: { kind: "existing", slug: "tunisia" }, aliases: ["Tunisia"] },
  BEL: { resolution: { kind: "existing", slug: "belgium" }, aliases: ["Belgium"] },
  EGY: { resolution: { kind: "existing", slug: "egypt" }, aliases: ["Egypt"] },
  IRN: { resolution: { kind: "existing", slug: "iran" }, aliases: ["IR Iran", "Iran"] },
  NZL: { resolution: { kind: "existing", slug: "new-zealand" }, aliases: ["New Zealand"] },
  ESP: { resolution: { kind: "existing", slug: "spain" }, aliases: ["Spain"] },
  CPV: {
    resolution: { kind: "new", name: "Cape Verde", slug: "cape-verde", iso3: "CPV" },
    aliases: ["Cabo Verde", "Cape Verde"],
  },
  KSA: { resolution: { kind: "existing", slug: "saudi-arabia" }, aliases: ["Saudi Arabia"] },
  URU: { resolution: { kind: "existing", slug: "uruguay" }, aliases: ["Uruguay"] },
  FRA: { resolution: { kind: "existing", slug: "france" }, aliases: ["France"] },
  SEN: { resolution: { kind: "existing", slug: "senegal" }, aliases: ["Senegal"] },
  IRQ: { resolution: { kind: "existing", slug: "iraq" }, aliases: ["Iraq"] },
  NOR: { resolution: { kind: "existing", slug: "norway" }, aliases: ["Norway"] },
  ARG: { resolution: { kind: "existing", slug: "argentina" }, aliases: ["Argentina"] },
  ALG: { resolution: { kind: "existing", slug: "algeria" }, aliases: ["Algeria"] },
  AUT: { resolution: { kind: "existing", slug: "austria" }, aliases: ["Austria"] },
  JOR: {
    resolution: { kind: "new", name: "Jordan", slug: "jordan", iso3: "JOR" },
    aliases: ["Jordan"],
  },
  POR: { resolution: { kind: "existing", slug: "portugal" }, aliases: ["Portugal"] },
  COD: {
    resolution: {
      kind: "new",
      name: "DR Congo",
      slug: "dr-congo",
      iso3: "COD",
      historicalNote:
        "Same football association as the 1974 'Zaire' entry (country slug 'zaire'); kept as a separate era name, matching the archive's West Germany/Germany convention.",
    },
    aliases: ["Congo DR", "DR Congo"],
  },
  UZB: {
    resolution: { kind: "new", name: "Uzbekistan", slug: "uzbekistan", iso3: "UZB" },
    aliases: ["Uzbekistan"],
  },
  COL: { resolution: { kind: "existing", slug: "colombia" }, aliases: ["Colombia"] },
  ENG: { resolution: { kind: "existing", slug: "england" }, aliases: ["England"] },
  CRO: { resolution: { kind: "existing", slug: "croatia" }, aliases: ["Croatia"] },
  GHA: { resolution: { kind: "existing", slug: "ghana" }, aliases: ["Ghana"] },
  PAN: { resolution: { kind: "existing", slug: "panama" }, aliases: ["Panama"] },
};

/** Venue country codes in the candidate file → canonical Stadium.country. */
export const VENUE_COUNTRY: Record<string, string> = {
  CAN: "Canada",
  MEX: "Mexico",
  USA: "United States",
};

/**
 * Official award category → canonical Award.name. Names match the existing
 * Fjelstul rows so cross-tournament award queries keep working; FIFA's own
 * label is preserved in Award.details.officialName.
 */
export const AWARD_NAME_MAP: Record<string, { name: string; slug: string }> = {
  "FIFA Fair Play Trophy": { name: "FIFA Fair Play Trophy", slug: "fair-play" },
  "Golden Boot": { name: "Golden Boot", slug: "golden-boot" },
  "Silver Boot": { name: "Silver Boot", slug: "silver-boot" },
  "Bronze Boot": { name: "Bronze Boot", slug: "bronze-boot" },
  "Golden Glove": { name: "Golden Glove", slug: "golden-glove" },
  "Golden Ball": { name: "Golden Ball", slug: "golden-ball" },
  "Silver Ball": { name: "Silver Ball", slug: "silver-ball" },
  "Bronze Ball": { name: "Bronze Ball", slug: "bronze-ball" },
  "Young Player Award": { name: "Best Young Player", slug: "best-young-player" },
};

/** The archive's tournament naming convention ("2022 FIFA Men's World Cup"). */
export const CANONICAL_TOURNAMENT_NAME = "2026 FIFA Men's World Cup";

/** Rows per write batch (each batch is one short, non-interactive transaction). */
export const DEFAULT_BATCH_SIZE = 50;
/** A RUNNING import whose heartbeat is older than this is considered stale. */
export const STALE_RUN_MS = 10 * 60 * 1000;
