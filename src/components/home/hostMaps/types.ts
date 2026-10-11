// Shape of the generated host-map geometry (hostMapGeometry.generated.ts).
// Type-only module.

import type { HostMapTone } from "./hostMapConfig";

export type HostMapGeometry = {
  year: number;
  tone: HostMapTone;
  /** Parameters of the d3 geoMercator fitted at build time (center 0,0; no rotation). */
  projection: { type: "geoMercator"; scale: number; translate: readonly [number, number] };
  /** Centre of the hosts in viewBox units — anchor for the soft glow. */
  focus: readonly [number, number];
  hosts: readonly { isoA3: string; d: string }[];
  /** Surrounding land (coastlines, no borders) in one path, for faint context. */
  context: string;
  /** 5° graticule clipped to the card. */
  graticule: string;
};
