// Decorative tournament host map — one primitive for the Featured card
// media band, the /tournaments archive card header and the
// /tournaments/[year] hero. Server component, plain SVG: no client
// JavaScript, no runtime geometry fetch, no animation. Hidden from assistive
// technology, unfocusable and pointer-transparent. Returns null (callers keep
// their existing background) when no host geography resolves.

import { getHostMapGeometry } from "@/server/maps/hostMapGeometry";
import {
  HOST_MAP_TONES,
  tournamentMapTone,
  variantSpec,
  type HostIdentity,
  type HostMapPlacement,
  type HostMapVariant,
} from "./config";
import { hostMapDefId, markerPosition, type GeoPoint } from "./model";

const rgba = (rgb: string, alpha: number) => `rgba(${rgb}, ${alpha})`;

type LayerStyle = {
  glow: number;
  glowRadius: number;
  grid: number;
  contextFill: number;
  contextStroke: number;
  contextStrokeWidth: number;
  hostFill: number;
  hostStroke: number;
  hostStrokeWidth: number;
  hostGlowPx: number;
  rings: boolean;
  marker: boolean;
};

const LAYERS: Readonly<Record<HostMapVariant, LayerStyle>> = {
  // Approved Featured treatment — values unchanged.
  "featured-card": {
    glow: 0.2, glowRadius: 110, grid: 0.07,
    contextFill: 0.025, contextStroke: 0.1, contextStrokeWidth: 0.5,
    hostFill: 0.12, hostStroke: 0.5, hostStrokeWidth: 0.8, hostGlowPx: 3,
    rings: true, marker: true,
  },
  // Compact archive header: quieter grid, no rings or markers.
  "archive-card": {
    glow: 0.14, glowRadius: 120, grid: 0.035,
    contextFill: 0.02, contextStroke: 0.07, contextStrokeWidth: 0.5,
    hostFill: 0.1, hostStroke: 0.34, hostStrokeWidth: 0.8, hostGlowPx: 2,
    rings: false, marker: false,
  },
  // Atmospheric hero background: restrained fill/outline, large soft glow.
  "detail-hero": {
    glow: 0.16, glowRadius: 380, grid: 0.045,
    contextFill: 0.02, contextStroke: 0.08, contextStrokeWidth: 1,
    hostFill: 0.08, hostStroke: 0.3, hostStrokeWidth: 1.4, hostGlowPx: 5,
    rings: true, marker: true,
  },
};

export default function TournamentHostMap({
  year,
  hosts,
  variant,
  placement = "right",
  finalVenue = null,
}: {
  year: number;
  /** Canonical host countries (TournamentCardDto.hostCountries). */
  hosts: readonly HostIdentity[];
  variant: HostMapVariant;
  /** Hero composition position (detail-hero only). */
  placement?: HostMapPlacement;
  /** Recorded final-stadium coordinates; omitted → no venue marker. */
  finalVenue?: GeoPoint | null;
}) {
  const geometry = getHostMapGeometry(hosts, variant, placement);
  if (geometry === null) return null;

  const layer = LAYERS[variant];
  const spec = variantSpec(variant, placement);
  const tone = HOST_MAP_TONES[tournamentMapTone(year)];
  const marker = layer.marker ? markerPosition(geometry, finalVenue) : null;
  const [fx, fy] = marker ?? geometry.focus;
  const glowId = hostMapDefId(`${variant}-${placement}`, year, geometry.hosts.map((h) => h.isoA3).join("-") || "context");
  const ringScale = variant === "detail-hero" ? 3 : 1;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-host-map={year}
      data-host-map-variant={variant}
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      preserveAspectRatio={spec.preserveAspectRatio}
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
        <radialGradient id={glowId} cx={fx} cy={fy} r={layer.glowRadius} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={rgba(tone.accent, layer.glow)} />
          <stop offset="1" stopColor={rgba(tone.accent, 0)} />
        </radialGradient>
      </defs>

      {/* Soft glow behind the hosts. */}
      <rect width={geometry.width} height={geometry.height} fill={`url(#${glowId})`} />

      {/* Faint 5° grid. */}
      <path d={geometry.graticule} fill="none" stroke={rgba(tone.host, layer.grid)} strokeWidth={0.5} />

      {/* Surrounding land for context. */}
      <path
        d={geometry.context}
        fill={`rgba(255, 255, 255, ${layer.contextFill})`}
        stroke={`rgba(255, 255, 255, ${layer.contextStroke})`}
        strokeWidth={layer.contextStrokeWidth}
        strokeLinejoin="round"
      />

      {/* Host countries. */}
      <g style={{ filter: `drop-shadow(0 0 ${layer.hostGlowPx}px ${rgba(tone.host, 0.45)})` }}>
        {geometry.hosts.map((host) => (
          <path
            key={host.isoA3}
            data-host={host.isoA3}
            d={host.d}
            fill={rgba(tone.host, layer.hostFill)}
            stroke={rgba(tone.host, layer.hostStroke)}
            strokeWidth={layer.hostStrokeWidth}
            strokeLinejoin="round"
          />
        ))}
      </g>

      {layer.rings ? (
        <>
          <circle cx={fx} cy={fy} r={22 * ringScale} fill="none" stroke={rgba(tone.accent, 0.08)} strokeWidth={0.5 * ringScale} />
          <circle cx={fx} cy={fy} r={40 * ringScale} fill="none" stroke={rgba(tone.accent, 0.05)} strokeWidth={0.5 * ringScale} strokeDasharray={`${2 * ringScale} ${3 * ringScale}`} />
        </>
      ) : null}

      {/* Final venue — only when its coordinates are recorded. */}
      {marker !== null ? (
        <g data-host-map-marker="">
          <circle cx={marker[0]} cy={marker[1]} r={7 * ringScale} fill={rgba(tone.accent, 0.16)} />
          <circle cx={marker[0]} cy={marker[1]} r={3.6 * ringScale} fill="none" stroke={rgba(tone.accent, 0.55)} strokeWidth={0.6 * ringScale} />
          <circle cx={marker[0]} cy={marker[1]} r={1.8 * ringScale} fill={rgba(tone.accent, 0.95)} />
        </g>
      ) : null}
    </svg>
  );
}
