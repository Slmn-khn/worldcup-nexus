// NeonChip — a small glowing badge used for record highlights and labels.
// Gold or cyan variant; optional leading dot. Pill-shaped, tinted fill, glowing
// hairline border. Server-safe.

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  atlasColors,
  atlasBorders,
  atlasGlow,
  type AtlasAccent,
} from "@/theme/visualTokens";

type NeonChipProps = {
  label: React.ReactNode;
  accent?: AtlasAccent;
  /** Adds a leading glowing dot. */
  dot?: boolean;
  sx?: SxProps<Theme>;
};

export default function NeonChip({
  label,
  accent = "gold",
  dot = false,
  sx,
}: NeonChipProps) {
  const color =
    accent === "gold" ? atlasColors.goldStrong : atlasColors.cyanStrong;
  const border = accent === "gold" ? atlasBorders.gold : atlasBorders.cyan;
  const glow = accent === "gold" ? atlasGlow.goldSoft : atlasGlow.cyanSoft;
  const dotGlow = accent === "gold" ? atlasGlow.gold : atlasGlow.cyan;

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.5,
        py: 0.5,
        borderRadius: "999px",
        bgcolor: `${glow}`,
        border: `1px solid ${border}`,
        color,
        fontSize: "0.66rem",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        ...sx,
      }}
    >
      {dot ? (
        <Box
          aria-hidden
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            bgcolor: color,
            boxShadow: `0 0 10px 1px ${dotGlow}`,
          }}
        />
      ) : null}
      {label}
    </Box>
  );
}
