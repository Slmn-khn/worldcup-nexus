// Decorative host-country map for a Featured Tournament card's media band.
// Server component, plain SVG: no client JavaScript, no runtime geometry
// fetch, no animation. Purely decorative — hidden from assistive technology,
// unfocusable and transparent to pointer events. Returns null (the card keeps
// its gradient) when the tournament has no generated geometry.

import {
  getHostMapGeometry,
  HOST_MAP_TONES,
  HOST_MAP_VIEWBOX,
  markerPosition,
  type GeoPoint,
} from "./hostMapModel";

const rgba = (rgb: string, alpha: number) => `rgba(${rgb}, ${alpha})`;

export default function TournamentHostMap({
  year,
  finalVenue = null,
}: {
  year: number;
  /** Verified final-stadium coordinates; omitted → no venue marker. */
  finalVenue?: GeoPoint | null;
}) {
  const geometry = getHostMapGeometry(year);
  if (geometry === null) return null;

  const tone = HOST_MAP_TONES[geometry.tone];
  const marker = markerPosition(geometry, finalVenue);
  const [fx, fy] = marker ?? geometry.focus;
  const glowId = `host-map-glow-${year}`;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-host-map={year}
      viewBox={`0 0 ${HOST_MAP_VIEWBOX.width} ${HOST_MAP_VIEWBOX.height}`}
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        display: "block",
      }}
    >
      <defs>
        <radialGradient id={glowId} cx={fx} cy={fy} r={110} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={rgba(tone.accent, 0.2)} />
          <stop offset="1" stopColor={rgba(tone.accent, 0)} />
        </radialGradient>
      </defs>

      {/* Card-specific soft glow behind the hosts. */}
      <rect width={HOST_MAP_VIEWBOX.width} height={HOST_MAP_VIEWBOX.height} fill={`url(#${glowId})`} />

      {/* Faint 5° grid. */}
      <path d={geometry.graticule} fill="none" stroke={rgba(tone.host, 0.07)} strokeWidth={0.5} />

      {/* Surrounding land for context. */}
      <path
        d={geometry.context}
        fill="rgba(255, 255, 255, 0.025)"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth={0.5}
        strokeLinejoin="round"
      />

      {/* Host countries. */}
      <g style={{ filter: `drop-shadow(0 0 3px ${rgba(tone.host, 0.45)})` }}>
        {geometry.hosts.map((host) => (
          <path
            key={host.isoA3}
            data-host={host.isoA3}
            d={host.d}
            fill={rgba(tone.host, 0.12)}
            stroke={rgba(tone.host, 0.5)}
            strokeWidth={0.8}
            strokeLinejoin="round"
          />
        ))}
      </g>

      {/* Range rings around the focus point. */}
      <circle cx={fx} cy={fy} r={22} fill="none" stroke={rgba(tone.accent, 0.08)} strokeWidth={0.5} />
      <circle cx={fx} cy={fy} r={40} fill="none" stroke={rgba(tone.accent, 0.05)} strokeWidth={0.5} strokeDasharray="2 3" />

      {/* Final venue — only when its coordinates are recorded. */}
      {marker !== null ? (
        <g data-host-map-marker="">
          <circle cx={marker[0]} cy={marker[1]} r={7} fill={rgba(tone.accent, 0.16)} />
          <circle cx={marker[0]} cy={marker[1]} r={3.6} fill="none" stroke={rgba(tone.accent, 0.55)} strokeWidth={0.6} />
          <circle cx={marker[0]} cy={marker[1]} r={1.8} fill={rgba(tone.accent, 0.95)} />
        </g>
      ) : null}
    </svg>
  );
}
