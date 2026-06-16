// Cover visual for a match / iconic moment. Uses an approved event image when
// available; otherwise composes a data-driven fallback from the two nations'
// flags and the scoreline — no external image required, never crashes.

import Image from "next/image";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { atlas, tabularNums } from "@/theme/tokens";
import type { MediaAssetDto } from "@/server/media/types";
import CountryFlag from "./CountryFlag";
import type { CountryFlagInput } from "@/lib/media/flags";

type EventCoverTeam = CountryFlagInput;

type EventCoverProps = {
  media?: Pick<
    MediaAssetDto,
    "url" | "altText" | "blurDataUrl" | "dominantColor"
  > | null;
  alt: string;
  home: EventCoverTeam;
  away: EventCoverTeam;
  /** e.g. "3–3 (4–2 pens)". Null shows "vs". */
  scoreline?: string | null;
  /** Context eyebrow, e.g. "1970 · Final". */
  context?: string | null;
  aspectRatio?: string;
  priority?: boolean;
};

export default function EventCover({
  media,
  alt,
  home,
  away,
  scoreline,
  context,
  aspectRatio = "16 / 9",
  priority = false,
}: EventCoverProps) {
  const url = media?.url ?? null;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio,
        overflow: "hidden",
        border: `1px solid ${atlas.border}`,
        bgcolor: media?.dominantColor ?? atlas.surface1,
        background:
          url === null
            ? `linear-gradient(135deg, ${atlas.surface2} 0%, ${atlas.bgBase} 100%)`
            : undefined,
      }}
    >
      {url !== null ? (
        <Image
          src={url}
          alt={media?.altText ?? alt}
          fill
          sizes="(max-width: 600px) 100vw, 50vw"
          priority={priority}
          placeholder={media?.blurDataUrl ? "blur" : "empty"}
          blurDataURL={media?.blurDataUrl ?? undefined}
          style={{ objectFit: "cover" }}
        />
      ) : (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            px: 2,
          }}
        >
          {context != null && context !== "" ? (
            <Typography
              component="p"
              sx={{
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: atlas.textMuted,
                textAlign: "center",
              }}
            >
              {context}
            </Typography>
          ) : null}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: { xs: 1.5, md: 2.5 },
            }}
          >
            <CountryFlag {...home} size="lg" />
            <Typography
              component="span"
              sx={{
                ...tabularNums,
                fontFamily: atlas.fontDisplay,
                fontWeight: 700,
                fontSize: { xs: "1.3rem", md: "1.6rem" },
                color:
                  scoreline != null ? atlas.textPrimary : atlas.textMuted,
                whiteSpace: "nowrap",
              }}
            >
              {scoreline ?? "vs"}
            </Typography>
            <CountryFlag {...away} size="lg" />
          </Box>
        </Box>
      )}
    </Box>
  );
}
