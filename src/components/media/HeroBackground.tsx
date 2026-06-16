// Full-bleed hero background. Renders an approved image behind its children
// with a dark scrim for legibility; falls back to a dark navy→black gradient
// when there is no media. Always safe to render with no media.

import Image from "next/image";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { atlas } from "@/theme/tokens";
import type { MediaAssetDto, MediaFallbackKind } from "@/server/media/types";

type HeroBackgroundProps = {
  media?: Pick<
    MediaAssetDto,
    "url" | "altText" | "blurDataUrl" | "dominantColor"
  > | null;
  fallbackType?: MediaFallbackKind;
  alt: string;
  priority?: boolean;
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
};

const FALLBACK_BG: Record<MediaFallbackKind, string> = {
  silhouette: `radial-gradient(circle at 50% 30%, ${atlas.surface2} 0%, ${atlas.bgBase} 75%)`,
  flag: `linear-gradient(160deg, ${atlas.surface2} 0%, ${atlas.bgBase} 100%)`,
  "tournament-gradient": `linear-gradient(160deg, ${atlas.surface2} 0%, ${atlas.bgBase} 100%)`,
  event: `linear-gradient(135deg, ${atlas.surface1} 0%, ${atlas.bgBase} 100%)`,
  gradient: `linear-gradient(160deg, ${atlas.surface1} 0%, ${atlas.bgBase} 100%)`,
};

export default function HeroBackground({
  media,
  fallbackType = "tournament-gradient",
  alt,
  priority = false,
  children,
  sx,
}: HeroBackgroundProps) {
  const url = media?.url ?? null;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        bgcolor: media?.dominantColor ?? atlas.bgBase,
        background: url === null ? FALLBACK_BG[fallbackType] : undefined,
        ...sx,
      }}
    >
      {url !== null ? (
        <>
          <Image
            src={url}
            alt={media?.altText ?? alt}
            fill
            sizes="100vw"
            priority={priority}
            placeholder={media?.blurDataUrl ? "blur" : "empty"}
            blurDataURL={media?.blurDataUrl ?? undefined}
            style={{ objectFit: "cover" }}
          />
          {/* Scrim keeps overlaid text legible over any photo. */}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.75) 100%)`,
            }}
          />
        </>
      ) : null}
      <Box sx={{ position: "relative" }}>{children}</Box>
    </Box>
  );
}
