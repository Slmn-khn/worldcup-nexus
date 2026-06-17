// Player portrait with a fallback-first design. When an approved image URL is
// provided it renders it; otherwise it shows a dark silhouette card with the
// player's initials and an optional country flag badge. No fake photos, no
// external images unless a URL is explicitly handed in.

import Image from "next/image";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { atlas } from "@/theme/tokens";
import { atlasGlow } from "@/theme/visualTokens";
import { getInitials } from "@/lib/media/initials";
import CountryFlag, { type CountryFlagSize } from "./CountryFlag";

export type PlayerPortraitSize = "sm" | "md" | "lg" | "xl";

const SIZE_PX: Record<PlayerPortraitSize, number> = {
  sm: 48,
  md: 80,
  lg: 128,
  xl: 184,
};

// Flag badge geometry per portrait size: a circular dark wrapper with a gold
// rim + glow holding a CSS flag. Bigger and clearly visible on the large
// collectible cards (lg/xl); proportional on small list portraits.
const BADGE: Record<
  PlayerPortraitSize,
  { wrap: number; flag: CountryFlagSize; offset: number }
> = {
  sm: { wrap: 22, flag: "xs", offset: -4 },
  md: { wrap: 28, flag: "sm", offset: -5 },
  lg: { wrap: 34, flag: "md", offset: -5 },
  xl: { wrap: 38, flag: "md", offset: -6 },
};

type PlayerPortraitProps = {
  name: string;
  imageUrl?: string | null;
  countryName?: string | null;
  countryCode?: string | null;
  size?: PlayerPortraitSize;
  alt?: string;
};

export default function PlayerPortrait({
  name,
  imageUrl,
  countryName,
  countryCode,
  size = "md",
  alt,
}: PlayerPortraitProps) {
  const px = SIZE_PX[size];
  const hasImage = imageUrl != null && imageUrl.trim() !== "";
  const initials = getInitials(name);
  const showFlag = countryName != null || countryCode != null;
  const badge = BADGE[size];

  return (
    <Box
      sx={{
        position: "relative",
        width: px,
        height: px,
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: px,
          height: px,
          overflow: "hidden",
          borderRadius: 0,
          // Image: neutral hairline. Fallback: dark charcoal with a subtle gold
          // border and a faint gold glow so initials read as a deliberate crest.
          border: `1px solid ${hasImage ? atlas.border : atlas.goldBorder}`,
          bgcolor: atlas.surface1,
          background: hasImage
            ? undefined
            : `radial-gradient(circle at 50% 30%, ${atlas.surface3} 0%, ${atlas.surface1} 72%)`,
          boxShadow: hasImage
            ? "none"
            : `inset 0 0 ${px * 0.28}px ${atlas.goldTint}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {hasImage ? (
          <Image
            src={imageUrl!.trim()}
            alt={alt ?? name}
            fill
            sizes={`${px}px`}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <Typography
            component="span"
            aria-hidden={initials !== ""}
            sx={{
              fontFamily: atlas.fontDisplay,
              fontWeight: 700,
              fontSize: Math.round(px * 0.4),
              lineHeight: 1,
              color: atlas.textSecondary,
              letterSpacing: "0.02em",
              userSelect: "none",
            }}
          >
            {initials !== "" ? initials : "—"}
          </Typography>
        )}
      </Box>

      {showFlag ? (
        <Box
          sx={{
            position: "absolute",
            right: badge.offset,
            bottom: badge.offset,
            width: badge.wrap,
            height: badge.wrap,
            minWidth: badge.wrap,
            borderRadius: "50%",
            bgcolor: "rgba(2, 8, 18, 0.85)",
            border: `1px solid ${atlasGlow.gold}`,
            boxShadow: `0 0 12px ${atlasGlow.gold}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 0,
          }}
        >
          <CountryFlag
            name={countryName}
            code={countryCode}
            size={badge.flag}
            rounded
            sx={{ border: "none", boxShadow: "none" }}
          />
        </Box>
      ) : null}
    </Box>
  );
}
