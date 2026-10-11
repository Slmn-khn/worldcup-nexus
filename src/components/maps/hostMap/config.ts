// Presentation configuration for the decorative tournament host maps.
// Canonical facts (WHO hosted) come from the data layer as HostCountryRef[];
// this file only says HOW a host geography is drawn: which Natural Earth
// polygon stands for a canonical country, how a composition is cropped, and
// how each surface variant is laid out. Pure data — no imports beyond types,
// so it loads in tsx, vitest and server components alike.

export type HostMapTone = "cyan" | "gold" | "green";
export type HostMapVariant = "featured-card" | "archive-card" | "detail-hero";
/**
 * Hero layouts differ: the 2026 archive hub leaves the right half empty,
 * while the dossier hero has its champion panel on the right, so its map
 * sits centrally between the identity block and the panel.
 */
export type HostMapPlacement = "right" | "centre";
export type NaturalEarthScale = "110m" | "50m";

/** Geographic bounds in degrees. */
export type GeoBox = { west: number; south: number; east: number; north: number };

/** Minimal canonical host shape this module needs (see HostCountryRef). */
export type HostIdentity = { slug: string | null; code: string | null };

/**
 * ISO 3166-1 alpha-3 → ISO numeric ids used by Natural Earth / world-atlas.
 * Covers every canonical host code in the archive plus common future hosts.
 */
export const ISO_A3_TO_NUMERIC: Readonly<Record<string, string>> = {
  ARG: "032", AUS: "036", BRA: "076", CAN: "124", CHE: "756", CHL: "152",
  CHN: "156", DEU: "276", ESP: "724", FRA: "250", GBR: "826", ITA: "380",
  JPN: "392", KOR: "410", MAR: "504", MEX: "484", NZL: "554", PRT: "620",
  QAT: "634", RUS: "643", SAU: "682", SWE: "752", URY: "858", USA: "840",
  ZAF: "710",
};

/**
 * Canonical countries whose Natural Earth polygon would misstate the host:
 * Natural Earth has no England-only Admin-0 polygon, and modern Germany's
 * outline is not West Germany (1974). These keep a regional composition
 * framed on the host with NO highlighted border, rather than a false one.
 */
export const CONTEXT_ONLY_HOSTS: Readonly<Record<string, GeoBox>> = {
  england: { west: -6.5, south: 49.6, east: 2.4, north: 55.9 },
  "west-germany": { west: 5.6, south: 47.1, east: 13.9, north: 55.2 },
};

export type CompositionPreset = {
  /** Area to frame; defaults to the hosts' full outline. */
  focus?: GeoBox;
  /** Natural Earth scale; 1:50m for hosts drawn up close. */
  detail?: NaturalEarthScale;
};

/**
 * Crops keyed by the sorted ISO set of highlighted hosts ("CAN|MEX|USA").
 * Geography-keyed, not year-keyed: every edition with the same hosts gets
 * the same composition (France 1938/1998/2019, USA 1994/1999/2003).
 */
export const COMPOSITION_PRESETS: Readonly<Record<string, CompositionPreset>> = {
  // Southern Canada → southern Mexico: all three 2026 hosts, no Arctic/Alaska.
  "CAN|MEX|USA": { focus: { west: -128, south: 14, east: -62, north: 56 } },
  // Qatar in the Gulf so the peninsula is legible, not a speck.
  QAT: { focus: { west: 47.5, south: 22.5, east: 55.5, north: 27.5 }, detail: "50m" },
  // Metropolitan France only (Natural Earth's France includes French Guiana).
  FRA: { focus: { west: -5.5, south: 41.2, east: 9.8, north: 51.3 } },
  // European Russia, where every 2018 venue was.
  RUS: { focus: { west: 20, south: 42, east: 65, north: 66 } },
  // Southern Canada, Vancouver to Moncton, without the Arctic archipelago.
  CAN: { focus: { west: -132, south: 41.5, east: -56, north: 62 } },
  // Contiguous United States (no Alaska/Hawaii).
  USA: { focus: { west: -125, south: 24, east: -66.5, north: 49.5 } },
  // Mainland Spain (Natural Earth's Spain includes the Canary Islands).
  ESP: { focus: { west: -9.8, south: 35.8, east: 4.4, north: 43.9 } },
  // Korea + Japan as one East Asian composition.
  "JPN|KOR": { focus: { west: 124, south: 31, east: 146, north: 45.5 } },
  // Small hosts framed regionally at 1:50m.
  CHE: { focus: { west: 4.5, south: 44.8, east: 12.2, north: 49 }, detail: "50m" },
  URY: { focus: { west: -62.5, south: -36, east: -50.5, north: -29.5 }, detail: "50m" },
};

/** Hosts smaller than this (degrees) without a preset get a regional frame at 1:50m. */
export const SMALL_HOST_MIN_SPAN = { lon: 9, lat: 4.5 } as const;

export type VariantSpec = {
  /** viewBox size. */
  width: number;
  height: number;
  /** Area the composition is fitted into (viewBox units). */
  fit: [[number, number], [number, number]];
  preserveAspectRatio: string;
  /** Decimal places for host / context paths. */
  hostDigits: number;
  contextDigits: number;
  /** Drop geometry detail below this many viewBox units. */
  simplifyPx: number;
  /**
   * Area geometry is clipped to (viewBox units). Defaults to the whole
   * viewBox; narrower where readability layers hide the edges anyway, so no
   * path data is shipped for invisible regions.
   */
  clip?: [[number, number], [number, number]];
};

export const VARIANT_SPECS: Readonly<Record<HostMapVariant, VariantSpec>> = {
  // Approved Featured Tournament card media band (16:8) — unchanged.
  "featured-card": {
    width: 320,
    height: 160,
    fit: [[18, 10], [302, 134]],
    preserveAspectRatio: "xMidYMid slice",
    hostDigits: 1,
    contextDigits: 0,
    simplifyPx: 0.5,
  },
  // /tournaments card header band (~4:1), composition centred between the
  // year (left) and host label (right).
  "archive-card": {
    width: 400,
    height: 100,
    fit: [[120, 8], [300, 92]],
    preserveAspectRatio: "xMidYMid slice",
    hostDigits: 0,
    contextDigits: 0,
    simplifyPx: 1.5,
    // The band's scrim covers the outer ~25% on each side.
    clip: [[80, -2], [340, 102]],
  },
  // /tournaments/[year] hero: large silhouette in the right-hand negative space.
  "detail-hero": {
    width: 1200,
    height: 520,
    fit: [[650, 40], [1160, 480]],
    preserveAspectRatio: "xMaxYMid slice",
    hostDigits: 1,
    contextDigits: 0,
    simplifyPx: 0.75,
  },
};

/** Hero spec for the "centre" placement (dossier hero with a right-hand panel). */
export const HERO_CENTRE_SPEC: VariantSpec = {
  ...VARIANT_SPECS["detail-hero"],
  fit: [[400, 30], [860, 490]],
  preserveAspectRatio: "xMidYMid slice",
};

export function variantSpec(variant: HostMapVariant, placement: HostMapPlacement = "right"): VariantSpec {
  return variant === "detail-hero" && placement === "centre" ? HERO_CENTRE_SPEC : VARIANT_SPECS[variant];
}

/** Per-edition tone, matching the existing per-year card gradients. */
const TONE_BY_YEAR: Readonly<Record<number, HostMapTone>> = {
  2022: "gold",
  2014: "green",
};

export function tournamentMapTone(year: number): HostMapTone {
  return TONE_BY_YEAR[year] ?? "cyan";
}

type TonePalette = { host: string; accent: string };

/** RGB triplets derived from the theme tokens (cyan #39E6FF, gold #FFD66B, green #27D07F). */
export const HOST_MAP_TONES: Readonly<Record<HostMapTone, TonePalette>> = {
  cyan: { host: "57, 230, 255", accent: "57, 230, 255" },
  gold: { host: "255, 214, 107", accent: "255, 214, 107" },
  green: { host: "39, 208, 127", accent: "255, 214, 107" },
};

export type HostGeography =
  | { kind: "polygon"; isoA3: string }
  | { kind: "context"; focus: GeoBox }
  | { kind: "unsupported" };

/** How one canonical host is drawn. */
export function geographyForHost(host: HostIdentity): HostGeography {
  if (host.slug !== null && CONTEXT_ONLY_HOSTS[host.slug] !== undefined) {
    return { kind: "context", focus: CONTEXT_ONLY_HOSTS[host.slug]! };
  }
  if (host.code !== null && ISO_A3_TO_NUMERIC[host.code] !== undefined) {
    return { kind: "polygon", isoA3: host.code };
  }
  return { kind: "unsupported" };
}
