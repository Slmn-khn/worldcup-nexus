// Attribution line for an approved media asset. Compact/hidden by default —
// renders nothing when there is no credit to show, so it is always safe to mount.
// Intended for inline use now and a dedicated credits page later.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import { atlas } from "@/theme/tokens";
import type { MediaAssetDto } from "@/server/media/types";

type MediaCreditProps = {
  media?: Pick<
    MediaAssetDto,
    "creditText" | "creatorName" | "licenseName" | "licenseUrl" | "sourcePageUrl"
  > | null;
  /** When true, render a slightly larger block (e.g. on a credits page). */
  variant?: "compact" | "block";
};

/** Build the human-readable credit string from available fields. */
function creditLine(
  media: NonNullable<MediaCreditProps["media"]>,
): string | null {
  if (media.creditText && media.creditText.trim() !== "") {
    return media.creditText.trim();
  }
  const parts = [media.creatorName, media.licenseName].filter(
    (part): part is string => part != null && part.trim() !== "",
  );
  return parts.length > 0 ? parts.join(" · ") : null;
}

export default function MediaCredit({
  media,
  variant = "compact",
}: MediaCreditProps) {
  if (!media) return null;
  const line = creditLine(media);
  if (line === null) return null;

  const href = media.licenseUrl ?? media.sourcePageUrl ?? null;

  return (
    <Box component="span" sx={{ display: "inline-block" }}>
      <Typography
        component="span"
        sx={{
          fontSize: variant === "block" ? "0.72rem" : "0.6rem",
          color: atlas.textMuted,
          letterSpacing: "0.01em",
        }}
      >
        {href !== null ? (
          <MuiLink
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            sx={{ color: "inherit", textDecorationColor: atlas.border }}
          >
            {line}
          </MuiLink>
        ) : (
          line
        )}
      </Typography>
    </Box>
  );
}
