// Server-only geometry engine for the decorative tournament host maps.
//
// Turns canonical host countries (from the data layer) into compact, clipped
// SVG path data for one surface variant. Natural Earth Admin-0 countries
// v4.1.0 (public domain) are bundled locally via world-atlas — never fetched
// at runtime — and parsed at most once per server process; every composition
// is memoised, so 31 archive cards cost one parse plus one cheap projection
// per distinct host set. Only server components import this module: d3,
// TopoJSON and the world topology never reach the browser bundle.

import { geoBounds, geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
import type { Feature, FeatureCollection, GeoJsonProperties, Polygon } from "geojson";
import { feature, merge } from "topojson-client";
import { presimplify, simplify } from "topojson-simplify";
import type { GeometryCollection, GeometryObject, MultiPolygon as TopoMultiPolygon, Polygon as TopoPolygon, Topology } from "topojson-specification";
import countries110m from "world-atlas/countries-110m.json";
import countries50m from "world-atlas/countries-50m.json";

import {
  COMPOSITION_PRESETS,
  geographyForHost,
  ISO_A3_TO_NUMERIC,
  SMALL_HOST_MIN_SPAN,
  variantSpec,
  type GeoBox,
  type HostMapPlacement,
  type HostIdentity,
  type HostMapVariant,
  type NaturalEarthScale,
} from "@/components/maps/hostMap/config";

export type HostMapGeometry = {
  variant: HostMapVariant;
  width: number;
  height: number;
  /** Fitted d3 geoMercator parameters (center 0,0; no rotation). */
  projection: { scale: number; translate: readonly [number, number] };
  /** Centre of the composition in viewBox units — anchor for the soft glow. */
  focus: readonly [number, number];
  /** Highlighted host polygons (empty for context-only hosts such as England). */
  hosts: readonly { isoA3: string; d: string }[];
  /** All other countries merged into one silhouette (no interior borders). */
  context: string;
  /** 5° grid as straight Mercator lines. */
  graticule: string;
};

type CountriesTopology = Topology<{ countries: GeometryCollection<{ name: string }>; land: GeometryCollection }>;

function isCountriesTopology(value: unknown): value is CountriesTopology {
  if (typeof value !== "object" || value === null) return false;
  if (!("type" in value) || value.type !== "Topology" || !("arcs" in value) || !Array.isArray(value.arcs)) return false;
  if (!("objects" in value) || typeof value.objects !== "object" || value.objects === null) return false;
  const objects = value.objects;
  return (
    "countries" in objects &&
    typeof objects.countries === "object" &&
    objects.countries !== null &&
    "type" in objects.countries &&
    objects.countries.type === "GeometryCollection"
  );
}

type LoadedScale = {
  presimplified: CountriesTopology;
  byId: Map<string, Feature>;
};

const SOURCES: Record<NaturalEarthScale, unknown> = { "110m": countries110m, "50m": countries50m };
const loaded = new Map<NaturalEarthScale, LoadedScale>();

function loadScale(scale: NaturalEarthScale): LoadedScale {
  const cached = loaded.get(scale);
  if (cached !== undefined) return cached;
  const source = SOURCES[scale];
  if (!isCountriesTopology(source)) throw new Error(`world-atlas countries-${scale} is not a countries topology`);
  const collection = feature(source, source.objects.countries);
  const entry: LoadedScale = {
    // Visvalingam weights once per scale; each composition simplifies to its own zoom.
    presimplified: presimplify(source),
    byId: new Map(collection.features.map((f) => [String(f.id), f])),
  };
  loaded.set(scale, entry);
  return entry;
}

function focusPolygon(box: GeoBox): Feature<Polygon> {
  const { west, south, east, north } = box;
  // Densified rectangle so the spherical fit follows the parallels.
  const ring: [number, number][] = [];
  for (let x = west; x <= east; x += (east - west) / 8) ring.push([x, south]);
  for (let y = south; y <= north; y += (north - south) / 8) ring.push([east, y]);
  for (let x = east; x >= west; x -= (east - west) / 8) ring.push([x, north]);
  for (let y = north; y >= south; y -= (north - south) / 8) ring.push([west, y]);
  ring.push([west, south]);
  // d3 expects clockwise exterior rings for "small" polygons.
  return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [ring.reverse()] } };
}

function unionBox(boxes: GeoBox[]): GeoBox {
  return {
    west: Math.min(...boxes.map((b) => b.west)),
    south: Math.min(...boxes.map((b) => b.south)),
    east: Math.max(...boxes.map((b) => b.east)),
    north: Math.max(...boxes.map((b) => b.north)),
  };
}

function isPolygonal<P extends GeoJsonProperties>(g: GeometryObject<P>): g is TopoPolygon<P> | TopoMultiPolygon<P> {
  return g.type === "Polygon" || g.type === "MultiPolygon";
}
const round = (n: number) => Math.round(n * 10) / 10;
/** Framed areas smaller than this (degrees) are drawn from 1:50m data. */
const SMALL_FRAME_SPAN = { lon: 12, lat: 9 } as const;

type Composition = {
  key: string;
  isoA3: string[];
  focus: GeoBox | null;
  detail: NaturalEarthScale;
};

/** Pure: canonical hosts → which polygons to highlight and how to frame them. */
export function planComposition(hosts: readonly HostIdentity[]): Composition | null {
  const isoA3: string[] = [];
  const contextBoxes: GeoBox[] = [];
  for (const host of hosts) {
    const geography = geographyForHost(host);
    if (geography.kind === "polygon") isoA3.push(geography.isoA3);
    else if (geography.kind === "context") contextBoxes.push(geography.focus);
  }
  const sorted = [...new Set(isoA3)].sort();
  if (sorted.length === 0 && contextBoxes.length === 0) return null;
  const preset = COMPOSITION_PRESETS[sorted.join("|")];
  const boxes = [...contextBoxes, ...(preset?.focus !== undefined ? [preset.focus] : [])];
  let detail: NaturalEarthScale = preset?.detail ?? "110m";
  let focus: GeoBox | null = boxes.length > 0 ? unionBox(boxes) : null;

  // Unknown small hosts: frame them regionally at 1:50m instead of a blob.
  if (focus === null && preset === undefined) {
    const { byId } = loadScale("110m");
    const features = sorted.flatMap((iso) => {
      const f = byId.get(ISO_A3_TO_NUMERIC[iso] ?? "");
      return f === undefined ? [] : [f];
    });
    if (features.length > 0) {
      const [[w, s], [e, n]] = geoBounds({ type: "FeatureCollection", features });
      if (e - w < SMALL_HOST_MIN_SPAN.lon && n - s < SMALL_HOST_MIN_SPAN.lat * 2) {
        const cx = (w + e) / 2;
        const cy = (s + n) / 2;
        focus = {
          west: cx - Math.max(SMALL_HOST_MIN_SPAN.lon, e - w) / 2,
          east: cx + Math.max(SMALL_HOST_MIN_SPAN.lon, e - w) / 2,
          south: cy - Math.max(SMALL_HOST_MIN_SPAN.lat, n - s) / 2,
          north: cy + Math.max(SMALL_HOST_MIN_SPAN.lat, n - s) / 2,
        };
        detail = "50m";
      }
    }
  }
  // Any small framed area (England, West Germany, Gulf…) reads better at 1:50m.
  if (focus !== null && focus.east - focus.west < SMALL_FRAME_SPAN.lon && focus.north - focus.south < SMALL_FRAME_SPAN.lat) {
    detail = "50m";
  }
  const focusKey = focus === null ? "hosts" : `${focus.west},${focus.south},${focus.east},${focus.north}`;
  return { key: `${sorted.join("|")}@${focusKey}@${detail}`, isoA3: sorted, focus, detail };
}

const memo = new Map<string, HostMapGeometry | null>();

/**
 * Geometry for one surface, or null when no host resolves (the caller keeps
 * its gradient). Never throws for missing geography.
 */
export function getHostMapGeometry(
  hosts: readonly HostIdentity[],
  variant: HostMapVariant,
  placement: HostMapPlacement = "right",
): HostMapGeometry | null {
  const composition = planComposition(hosts);
  if (composition === null) return null;
  const memoKey = `${variant}:${placement}#${composition.key}`;
  if (memo.has(memoKey)) return memo.get(memoKey) ?? null;
  let result: HostMapGeometry | null = null;
  try {
    result = buildGeometry(composition, variant, placement);
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.warn(`[host-map] ${memoKey} unavailable`, error);
  }
  memo.set(memoKey, result);
  return result;
}

function buildGeometry(composition: Composition, variant: HostMapVariant, placement: HostMapPlacement): HostMapGeometry | null {
  const spec = variantSpec(variant, placement);
  const { presimplified, byId } = loadScale(composition.detail);
  const hostFeatures = composition.isoA3.flatMap((iso) => {
    const f = byId.get(ISO_A3_TO_NUMERIC[iso] ?? "");
    return f === undefined ? [] : [{ iso, feature: f }];
  });
  if (hostFeatures.length === 0 && composition.focus === null) return null;

  const hostCollection: FeatureCollection = { type: "FeatureCollection", features: hostFeatures.map((h) => h.feature) };
  const fitTarget: GeoPermissibleObjects = composition.focus !== null ? focusPolygon(composition.focus) : hostCollection;
  const projection = geoMercator().fitExtent(spec.fit, fitTarget);
  projection.clipExtent(spec.clip ?? [[-2, -2], [spec.width + 2, spec.height + 2]]);
  const hostPath = geoPath(projection).digits(spec.hostDigits);
  const contextPath = geoPath(projection).digits(spec.contextDigits);

  // Composition-specific simplification: minimum triangle area ≈ simplifyPx²
  // in the planar degree space topojson-simplify measures.
  const pixelsPerDegree = (projection.scale() * Math.PI) / 180;
  const simplified = simplify(presimplified, (spec.simplifyPx / pixelsPerDegree) ** 2);
  const simplifiedById = new Map(feature(simplified, simplified.objects.countries).features.map((f) => [String(f.id), f]));

  const hosts = hostFeatures
    .map((h) => ({ isoA3: h.iso, d: hostPath(simplifiedById.get(String(h.feature.id)) ?? h.feature) ?? "" }))
    .filter((h) => h.d !== "");

  const hostIds = new Set(hostFeatures.map((h) => String(h.feature.id)));
  const others = merge(
    simplified,
    simplified.objects.countries.geometries.filter((g) => !hostIds.has(String(g.id))).filter(isPolygonal),
  );
  const context = contextPath(others) ?? "";

  // 5° grid: straight lines under Mercator.
  const gridLines: string[] = [];
  const [[gw, gs], [ge, gn]] = geoBounds(fitTarget);
  for (let lon = Math.ceil((gw - 20) / 5) * 5; lon <= ge + 20; lon += 5) {
    const x = Math.round(projection([lon, 0])?.[0] ?? -1);
    if (x >= 0 && x <= spec.width) gridLines.push(`M${x},0V${spec.height}`);
  }
  for (let lat = Math.max(-80, Math.ceil((gs - 15) / 5) * 5); lat <= Math.min(80, gn + 15); lat += 5) {
    const y = Math.round(projection([0, lat])?.[1] ?? -1);
    if (y >= 0 && y <= spec.height) gridLines.push(`M0,${y}H${spec.width}`);
  }

  // Glow anchor: centre of the highlighted hosts (or of the framed area for
  // context-only hosts), kept inside the fit box.
  const [[hx0, hy0], [hx1, hy1]] = geoPath(projection).bounds(hostFeatures.length > 0 ? hostCollection : fitTarget);
  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
  const focus: [number, number] = [
    round(clamp((hx0 + hx1) / 2, spec.fit[0][0], spec.fit[1][0])),
    round(clamp((hy0 + hy1) / 2, spec.fit[0][1], spec.fit[1][1])),
  ];

  const [tx, ty] = projection.translate();
  return {
    variant,
    width: spec.width,
    height: spec.height,
    projection: { scale: round(projection.scale()), translate: [round(tx), round(ty)] },
    focus,
    hosts,
    context,
    graticule: gridLines.join(""),
  };
}
