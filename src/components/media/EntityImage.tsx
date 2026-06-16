// Generic media surface. Renders an approved image when one is provided,
// otherwise a clean, data-free fallback keyed by fallback kind. Never crashes
// on a missing URL and never renders anything that wasn't already approved by
// the query layer (it only renders the `media.url` it is handed).

import Image from "next/image";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { atlas } from "@/theme/tokens";
import type { MediaAssetDto, MediaFallbackKind } from "@/server/media/types";

type EntityImageProps = {
  media?: Pick<
    MediaAssetDto,
    "url" | "altText" | "blurDataUrl" | "dominantColor" | "width" | "height"
  > | null;
  fallbackType?: MediaFallbackKind;
  alt: string;
  /** CSS aspect ratio, e.g. "16 / 9" or "1". Defaults to 16/9. */
  aspectRatio?: string;
  /** Hint Next/Image to prioritize (above-the-fold heroes). */
  priority?: boolean;
  /** `sizes` passed through to next/image. */
  sizes?: string;
  sx?: SxProps<Theme>;
};

// Data-free fallback backgrounds. Dark navy/charcoal with a faint gold cast on
// hero-ish surfaces — never an external image.
const FALLBACK_BG: Record<MediaFallbackKind, string> = {
  silhouette: `radial-gradient(circle at 50% 35%, ${atlas.surface3} 0%, ${atlas.surface1} 70%)`,
  flag: atlas.surface2,
  "tournament-gradient": `linear-gradient(160deg, ${atlas.surface2} 0%, ${atlas.bgBase} 100%)`,
  event: `linear-gradient(135deg, ${atlas.surface1} 0%, ${atlas.bgBase} 100%)`,
  gradient: `linear-gradient(160deg, ${atlas.surface1} 0%, ${atlas.bgBase} 100%)`,
};

export default function EntityImage({
  media,
  fallbackType = "gradient",
  alt,
  aspectRatio = "16 / 9",
  priority = false,
  sizes = "100vw",
  sx,
}: EntityImageProps) {
  const url = media?.url ?? null;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio,
        overflow: "hidden",
        bgcolor: media?.dominantColor ?? atlas.surface1,
        background: url === null ? FALLBACK_BG[fallbackType] : undefined,
        border: `1px solid ${atlas.border}`,
        ...sx,
      }}
    >
      {url !== null ? (
        <Image
          src={url}
          alt={media?.altText ?? alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder={media?.blurDataUrl ? "blur" : "empty"}
          blurDataURL={media?.blurDataUrl ?? undefined}
          style={{ objectFit: "cover" }}
        />
      ) : null}
    </Box>
  );
}
