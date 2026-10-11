// Pure helpers for the decorative host maps — no React, no d3 at runtime.
// The marker projection re-implements d3's geoMercator (center 0,0, no
// rotation) with the scale/translate fitted by the build-time generator;
// a unit test checks it against d3 itself.

import { HOST_MAP_GEOMETRY, HOST_MAP_VIEWBOX } from "./hostMapGeometry.generated";
import type { HostMapTone } from "./hostMapConfig";
import type { HostMapGeometry } from "./types";

export type GeoPoint = { latitude: number; longitude: number };

export function getHostMapGeometry(year: number): HostMapGeometry | null {
  return HOST_MAP_GEOMETRY[year] ?? null;
}

/** d3.geoMercator forward projection for the generated parameters. */
export function projectMercator(geometry: HostMapGeometry, point: GeoPoint): [number, number] {
  const lambda = (point.longitude * Math.PI) / 180;
  const phi = (point.latitude * Math.PI) / 180;
  const [tx, ty] = geometry.projection.translate;
  const k = geometry.projection.scale;
  return [k * lambda + tx, ty - k * Math.log(Math.tan(Math.PI / 4 + phi / 2))];
}

/**
 * Final-venue marker position in viewBox units, or null when there are no
 * coordinates or the venue falls outside the framed area. Never invented:
 * cards without verified venue coordinates show no marker.
 */
export function markerPosition(geometry: HostMapGeometry, venue: GeoPoint | null): [number, number] | null {
  if (venue === null || !Number.isFinite(venue.latitude) || !Number.isFinite(venue.longitude)) return null;
  if (Math.abs(venue.latitude) >= 85) return null;
  const [x, y] = projectMercator(geometry, venue);
  const inset = 6;
  if (x < inset || y < inset || x > HOST_MAP_VIEWBOX.width - inset || y > HOST_MAP_VIEWBOX.height - inset) return null;
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

type TonePalette = {
  /** RGB triplet for host fill/stroke and grid. */
  host: string;
  /** RGB triplet for the marker and focus glow. */
  accent: string;
};

/** Card tones derived from the existing visual tokens (cyan #39E6FF, gold #FFD66B, green #27D07F). */
export const HOST_MAP_TONES: Readonly<Record<HostMapTone, TonePalette>> = {
  cyan: { host: "57, 230, 255", accent: "57, 230, 255" },
  gold: { host: "255, 214, 107", accent: "255, 214, 107" },
  green: { host: "39, 208, 127", accent: "255, 214, 107" },
};

export { HOST_MAP_VIEWBOX };
