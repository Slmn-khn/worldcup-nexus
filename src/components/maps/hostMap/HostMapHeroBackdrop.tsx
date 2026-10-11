// Atmospheric host-map background for tournament detail heroes. Fills the
// hero's own box (the parent must be position: relative + overflow: hidden)
// with the large host silhouette in the hero's negative space (right, or
// centre when a panel occupies the right column), plus the
// readability gradients that keep the year, title and champion summary
// clear of it. Purely decorative; renders nothing when no host resolves.

import Box from "@mui/material/Box";

import type { HostIdentity, HostMapPlacement } from "./config";
import TournamentHostMap from "./TournamentHostMap";
import { getHostMapGeometry } from "@/server/maps/hostMapGeometry";

/** atlas.black (#020812) as an RGB triplet for gradient stops. */
const HERO_BG = "2, 8, 18";

export default function HostMapHeroBackdrop({
  year,
  hosts,
  placement = "right",
}: {
  year: number;
  hosts: readonly HostIdentity[];
  /** "centre" when the hero's right column holds an opaque panel. */
  placement?: HostMapPlacement;
}) {
  if (getHostMapGeometry(hosts, "detail-hero", placement) === null) return null;
  return (
    <Box
      aria-hidden
      data-host-map-backdrop=""
      sx={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}
    >
      {/* Map: full strength on desktop, softened where text overlaps on small screens. */}
      <Box sx={{ position: "absolute", inset: 0, opacity: { xs: 0.55, md: 1 } }}>
        <TournamentHostMap year={year} hosts={hosts} variant="detail-hero" placement={placement} />
      </Box>
      {/* Readability: dark behind the identity block (left on desktop, top on mobile) and a bottom fade into the section boundary. */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: {
            xs: `linear-gradient(180deg, rgba(${HERO_BG}, 0.9) 0%, rgba(${HERO_BG}, 0.55) 40%, rgba(${HERO_BG}, 0.75) 100%)`,
            md:
              placement === "centre"
                ? `linear-gradient(90deg, rgba(${HERO_BG}, 0.92) 0%, rgba(${HERO_BG}, 0.7) 24%, rgba(${HERO_BG}, 0.15) 42%, rgba(${HERO_BG}, 0) 52%), linear-gradient(0deg, rgba(${HERO_BG}, 0.85) 0%, rgba(${HERO_BG}, 0) 28%)`
                : `linear-gradient(90deg, rgba(${HERO_BG}, 0.95) 0%, rgba(${HERO_BG}, 0.8) 34%, rgba(${HERO_BG}, 0.25) 62%, rgba(${HERO_BG}, 0) 80%), linear-gradient(0deg, rgba(${HERO_BG}, 0.85) 0%, rgba(${HERO_BG}, 0) 28%)`,
          },
        }}
      />
    </Box>
  );
}
