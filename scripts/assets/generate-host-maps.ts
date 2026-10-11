// Build-time generator for the Featured Tournament host maps.
//
//   pnpm assets:host-maps
//
// Reads Natural Earth Admin-0 countries (v4.1.0, public domain; 1:110m, or
// 1:50m for configs with detail "50m") from
// the pinned `world-atlas` dev dependency, projects each configured
// tournament's composition with d3-geo, clips it to the card's 320×160 media
// box and writes compact SVG path strings to
// src/components/home/hostMaps/hostMapGeometry.generated.ts.
//
// The app never loads world geometry, d3 or TopoJSON at runtime — cards
// render the committed paths as plain server-side SVG.

import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

import {
  geoBounds,
  geoMercator,
  geoPath,
  type GeoPermissibleObjects,
} from "d3-geo";
import { feature, merge } from "topojson-client";
import { presimplify, simplify } from "topojson-simplify";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, FeatureCollection, Geometry, Polygon } from "geojson";

import {
  ISO_A3_TO_NUMERIC,
  TOURNAMENT_MAP_VISUALS,
  type HostMapFocus,
} from "../../src/components/home/hostMaps/hostMapConfig";

export const VIEW_WIDTH = 320;
export const VIEW_HEIGHT = 160;
/** Map occupies the upper area; the bottom is left for the year/host overlay fade. */
const FIT_BOX: [[number, number], [number, number]] = [
  [18, 10],
  [VIEW_WIDTH - 18, VIEW_HEIGHT - 26],
];
const OUT_FILE = path.join("src", "components", "home", "hostMaps", "hostMapGeometry.generated.ts");

type CountryFeature = Feature<Geometry, { name: string }> & { id?: string | number };

function focusPolygon(focus: HostMapFocus): Feature<Polygon> {
  const { west, south, east, north } = focus;
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

const round = (n: number) => Math.round(n * 10) / 10;

async function main() {
  const require = createRequire(import.meta.url);
  type CountriesTopology = Topology<{
    countries: GeometryCollection<{ name: string }>;
    land: GeometryCollection;
  }>;
  const loaded = new Map<string, { topology: CountriesTopology; presimplified: CountriesTopology; byId: Map<string, CountryFeature> }>();
  async function loadScale(scale: "110m" | "50m") {
    const cached = loaded.get(scale);
    if (cached) return cached;
    const topology = JSON.parse(await readFile(require.resolve(`world-atlas/countries-${scale}.json`), "utf8")) as CountriesTopology;
    const countries = (feature(topology, topology.objects.countries) as FeatureCollection<Geometry, { name: string }>).features as CountryFeature[];
    // Visvalingam weights are computed once per scale; each composition then
    // drops detail below ~half a pixel at its own zoom level.
    const entry = { topology, presimplified: presimplify(topology) as CountriesTopology, byId: new Map(countries.map((c) => [String(c.id), c])) };
    loaded.set(scale, entry);
    return entry;
  }

  const entries: string[] = [];
  for (const [yearKey, visual] of Object.entries(TOURNAMENT_MAP_VISUALS).sort(([a], [b]) => Number(b) - Number(a))) {
    const year = Number(yearKey);
    const scale = visual.detail ?? "110m";
    const { presimplified, byId } = await loadScale(scale);
    const hosts = visual.hostIsoA3.map((iso) => {
      const numeric = ISO_A3_TO_NUMERIC[iso];
      const country = numeric === undefined ? undefined : byId.get(numeric);
      if (country === undefined) throw new Error(`${year}: host ${iso} not found in Natural Earth ${scale} (add it to ISO_A3_TO_NUMERIC)`);
      return { iso, country };
    });

    const fitTarget: GeoPermissibleObjects =
      visual.focus !== undefined
        ? focusPolygon(visual.focus)
        : { type: "FeatureCollection", features: hosts.map((h) => h.country) };
    const projection = geoMercator().fitExtent(FIT_BOX, fitTarget);
    projection.clipExtent([[-2, -2], [VIEW_WIDTH + 2, VIEW_HEIGHT + 2]]);
    const pathOf = geoPath(projection).digits(1);

    // Card-specific simplification: minimum triangle area ≈ (0.5 px)² in the
    // planar degree space topojson-simplify measures (pixels per degree from
    // the fitted Mercator scale at the equator — conservative at higher latitudes).
    const pixelsPerDegree = (projection.scale() * Math.PI) / 180;
    const simplified = simplify(presimplified, (0.5 / pixelsPerDegree) ** 2) as CountriesTopology;
    const simplifiedById = new Map(
      ((feature(simplified, simplified.objects.countries) as FeatureCollection<Geometry, { name: string }>).features as CountryFeature[]).map((c) => [String(c.id), c]),
    );
    // Context and grid are faint backdrop — whole viewBox units are plenty.
    const coarsePathOf = geoPath(projection).digits(0);

    const hostPaths = hosts
      .map((h) => ({ iso: h.iso, d: pathOf(simplifiedById.get(String(h.country.id)) ?? h.country) ?? "" }))
      .filter((h) => h.d !== "");

    // Context: every non-host country merged into one silhouette (shared
    // borders dissolved), so neither interior borders nor the hosts' own
    // outlines are duplicated.
    const hostNumeric = new Set(hosts.map((h) => String(h.country.id)));
    const others = merge(
      simplified,
      simplified.objects.countries.geometries.filter((g) => !hostNumeric.has(String(g.id))) as Parameters<typeof merge>[1],
    );
    const contextParts = [coarsePathOf(others) ?? ""].filter((d) => d !== "");

    // 5° grid. Under Mercator meridians are vertical and parallels horizontal,
    // so each line is a single M…V / M…H command instead of a sampled curve.
    const gridLines: string[] = [];
    const [[gw, gs], [ge, gn]] = geoBounds(fitTarget);
    for (let lon = Math.ceil((gw - 20) / 5) * 5; lon <= ge + 20; lon += 5) {
      const x = Math.round(projection([lon, 0])?.[0] ?? -1);
      if (x >= 0 && x <= VIEW_WIDTH) gridLines.push(`M${x},0V${VIEW_HEIGHT}`);
    }
    for (let lat = Math.max(-80, Math.ceil((gs - 15) / 5) * 5); lat <= Math.min(80, gn + 15); lat += 5) {
      const y = Math.round(projection([0, lat])?.[1] ?? -1);
      if (y >= 0 && y <= VIEW_HEIGHT) gridLines.push(`M0,${y}H${VIEW_WIDTH}`);
    }
    const graticule = gridLines.join("");

    // Focus point for the soft glow: centre of the hosts' projected outline,
    // kept inside the map area.
    const [[hx0, hy0], [hx1, hy1]] = geoPath(projection).bounds({ type: "FeatureCollection", features: hosts.map((h) => h.country) });
    const clampX = (x: number) => Math.min(Math.max(x, FIT_BOX[0][0]), FIT_BOX[1][0]);
    const clampY = (y: number) => Math.min(Math.max(y, FIT_BOX[0][1]), FIT_BOX[1][1]);
    const focus: [number, number] = [round(clampX((hx0 + hx1) / 2)), round(clampY((hy0 + hy1) / 2))];

    const [tx, ty] = projection.translate();
    entries.push(`  ${year}: {
    year: ${year},
    tone: ${JSON.stringify(visual.tone)},
    projection: { type: "geoMercator", scale: ${round(projection.scale())}, translate: [${round(tx)}, ${round(ty)}] },
    focus: [${focus[0]}, ${focus[1]}],
    hosts: [
${hostPaths.map((h) => `      { isoA3: ${JSON.stringify(h.iso)}, d: ${JSON.stringify(h.d)} },`).join("\n")}
    ],
    context: ${JSON.stringify(contextParts.join(""))},
    graticule: ${JSON.stringify(graticule)},
  },`);
    // Sanity: geographic bounds of the framed area, for the console log.
    const [[w, s], [e, n]] = geoBounds(fitTarget);
    const bytes = hostPaths.reduce((sum, h) => sum + h.d.length, 0) + contextParts.join("").length + graticule.length;
    console.log(`${year} [1:${scale}]: ${hosts.map((h) => h.iso).join("+")} framed ${round(w)},${round(s)} → ${round(e)},${round(n)}; ${bytes} path bytes`);
  }

  const output = `// GENERATED by scripts/assets/generate-host-maps.ts — do not edit by hand.
// Run \`pnpm assets:host-maps\` after changing hostMapConfig.ts.
//
// Source: Natural Earth Cultural Vectors, Admin 0 – Countries, 1:110m
// (1:50m where hostMapConfig sets detail "50m"), version 4.1.0 (public
// domain, https://www.naturalearthdata.com/), via the
// world-atlas@2.0.2 TopoJSON redistribution. Natural Earth's default
// worldview; boundaries are decorative, not authoritative.

import type { HostMapGeometry } from "./types";

export const HOST_MAP_VIEWBOX = { width: ${VIEW_WIDTH}, height: ${VIEW_HEIGHT} } as const;

export const HOST_MAP_GEOMETRY: Readonly<Record<number, HostMapGeometry>> = {
${entries.join("\n")}
};
`;
  await writeFile(OUT_FILE, output, "utf8");
  console.log(`\nWrote ${OUT_FILE} (${Buffer.byteLength(output)} bytes)`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
