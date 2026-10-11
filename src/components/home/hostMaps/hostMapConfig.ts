// Presentation-only configuration for the decorative host maps on Featured
// Tournament cards. Deliberately separate from canonical tournament facts:
// nothing here is rendered as text or used by queries. Hosts are matched by
// ISO 3166-1 alpha-3 code — never by display name.
//
// After editing, regenerate the committed geometry:
//   pnpm assets:host-maps
// A tournament without an entry (or without generated geometry) keeps the
// existing per-year gradient.
//
// Pure data, no imports — loaded by the tsx generator and by unit tests.

export type HostMapTone = "cyan" | "gold" | "green";

/** Geographic bounds in degrees, used to crop large hosts intentionally. */
export type HostMapFocus = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export type TournamentMapVisual = {
  /** Every host country, ISO 3166-1 alpha-3. */
  hostIsoA3: readonly string[];
  /** Mercator keeps small regional compositions conformal; extend the generator before adding others. */
  projection: "geoMercator";
  /**
   * Area to frame. Defaults to the hosts' full outline; set it to crop out
   * remote territory (French Guiana, the Arctic) or to give a small host
   * like Qatar regional context instead of a single blob.
   */
  focus?: HostMapFocus;
  /**
   * Natural Earth scale. 1:110m suits country/continent framing; small hosts
   * shown up close (Qatar) need 1:50m to read as a coastline, not a polygon.
   */
  detail?: "110m" | "50m";
  tone: HostMapTone;
};

export const TOURNAMENT_MAP_VISUALS: Readonly<Record<number, TournamentMapVisual>> = {
  2026: {
    hostIsoA3: ["CAN", "MEX", "USA"],
    projection: "geoMercator",
    // Southern Canada → southern Mexico: all three hosts, no Arctic/Alaska.
    focus: { west: -128, south: 14, east: -62, north: 56 },
    tone: "cyan",
  },
  2022: {
    hostIsoA3: ["QAT"],
    projection: "geoMercator",
    // Qatar framed in the Gulf so the peninsula is legible, not a speck.
    focus: { west: 47.5, south: 22.5, east: 55.5, north: 27.5 },
    detail: "50m",
    tone: "gold",
  },
  2019: {
    hostIsoA3: ["FRA"],
    projection: "geoMercator",
    // Metropolitan France only (Natural Earth's France includes French Guiana).
    focus: { west: -5.5, south: 41.2, east: 9.8, north: 51.3 },
    tone: "cyan",
  },
  2018: {
    hostIsoA3: ["RUS"],
    projection: "geoMercator",
    // European Russia, where every 2018 venue was — not the whole federation.
    focus: { west: 20, south: 42, east: 65, north: 66 },
    tone: "cyan",
  },
  2015: {
    hostIsoA3: ["CAN"],
    projection: "geoMercator",
    // Southern Canada, Vancouver to Moncton, without the Arctic archipelago.
    focus: { west: -132, south: 41.5, east: -56, north: 62 },
    tone: "cyan",
  },
  2014: {
    hostIsoA3: ["BRA"],
    projection: "geoMercator",
    tone: "green",
  },
};

/** ISO alpha-3 → ISO numeric ids used by Natural Earth / world-atlas. */
export const ISO_A3_TO_NUMERIC: Readonly<Record<string, string>> = {
  ARG: "032",
  BRA: "076",
  CAN: "124",
  CHE: "756",
  CHL: "152",
  CHN: "156",
  DEU: "276",
  ESP: "724",
  FRA: "250",
  GBR: "826",
  ITA: "380",
  JPN: "392",
  KOR: "410",
  MEX: "484",
  QAT: "634",
  RUS: "643",
  SWE: "752",
  URY: "858",
  USA: "840",
  ZAF: "710",
};
