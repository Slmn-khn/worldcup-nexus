// Pure helpers for the decorative host maps — no React, no d3 at runtime.
// The marker projection re-implements d3's geoMercator (center 0,0, no
// rotation) for the fitted scale/translate; a unit test checks it against d3.

export type GeoPoint = { latitude: number; longitude: number };

type ProjectedSurface = {
  width: number;
  height: number;
  projection: { scale: number; translate: readonly [number, number] };
};

/** d3.geoMercator forward projection for the fitted parameters. */
export function projectMercator(surface: ProjectedSurface, point: GeoPoint): [number, number] {
  const lambda = (point.longitude * Math.PI) / 180;
  const phi = (point.latitude * Math.PI) / 180;
  const [tx, ty] = surface.projection.translate;
  const k = surface.projection.scale;
  return [k * lambda + tx, ty - k * Math.log(Math.tan(Math.PI / 4 + phi / 2))];
}

/**
 * Final-venue marker position in viewBox units, or null when there are no
 * recorded coordinates or the venue falls outside the frame. Never invented.
 */
export function markerPosition(surface: ProjectedSurface, venue: GeoPoint | null): [number, number] | null {
  if (venue === null || !Number.isFinite(venue.latitude) || !Number.isFinite(venue.longitude)) return null;
  if (Math.abs(venue.latitude) >= 85) return null;
  const [x, y] = projectMercator(surface, venue);
  const inset = 6;
  if (x < inset || y < inset || x > surface.width - inset || y > surface.height - inset) return null;
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

/**
 * Deterministic, SSR-stable id for SVG defs: unique per variant + edition +
 * host set, so many maps on one page never share a gradient id and the server
 * and client always agree.
 */
export function hostMapDefId(variant: string, year: number, hostKey: string): string {
  return `host-map-${variant}-${year}-${hostKey.replace(/[^A-Za-z0-9]+/g, "-")}`.toLowerCase();
}
