// GlowCard — the premium neon surface used across the homepage. A rounded,
// gradient-filled card with a soft border and an optional hover glow. Variants:
// default (deep surface), gold, cyan, glass (blurred). Server-safe: hover is
// pure CSS, so it works inside server components. Polymorphic via `component`
// (e.g. component={Link} href=... for a clickable card).

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  atlasBorders,
  atlasColors,
  atlasGradients,
  atlasRadius,
  atlasShadows,
} from "@/theme/visualTokens";

export type GlowCardVariant = "default" | "gold" | "cyan" | "glass";

type GlowCardProps = {
  variant?: GlowCardVariant;
  /** Adds pointer cursor + a stronger lift/glow on hover and focus. */
  clickable?: boolean;
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
  component?: React.ElementType;
  href?: string;
  "aria-label"?: string;
};

const VARIANT: Record<
  GlowCardVariant,
  { background: string; border: string; hoverGlow: string; hoverBorder: string }
> = {
  default: {
    background: atlasGradients.surface,
    border: atlasBorders.soft,
    hoverGlow: atlasShadows.cyanGlow,
    hoverBorder: atlasBorders.cyan,
  },
  gold: {
    background: atlasGradients.goldCard,
    border: atlasBorders.gold,
    hoverGlow: atlasShadows.goldGlowStrong,
    hoverBorder: atlasBorders.goldStrong,
  },
  cyan: {
    background: atlasGradients.cyanCard,
    border: atlasBorders.cyan,
    hoverGlow: atlasShadows.cyanGlowStrong,
    hoverBorder: atlasBorders.cyanStrong,
  },
  glass: {
    background: atlasGradients.glass,
    border: atlasBorders.soft,
    hoverGlow: atlasShadows.cyanGlow,
    hoverBorder: atlasBorders.softStrong,
  },
};

export default function GlowCard({
  variant = "default",
  clickable = false,
  children,
  sx,
  ...rest
}: GlowCardProps) {
  const v = VARIANT[variant];
  return (
    <Box
      {...rest}
      sx={{
        position: "relative",
        display: "block",
        borderRadius: `${atlasRadius.lg}px`,
        background: v.background,
        backdropFilter: variant === "glass" ? "blur(14px)" : undefined,
        border: `1px solid ${v.border}`,
        boxShadow: atlasShadows.card,
        color: atlasColors.textPrimary,
        transition:
          "transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
        ...(clickable
          ? {
              cursor: "pointer",
              "&:hover, &:focus-visible": {
                transform: "translateY(-3px)",
                borderColor: v.hoverBorder,
                boxShadow: v.hoverGlow,
              },
            }
          : {
              "&:hover": {
                borderColor: v.hoverBorder,
                boxShadow: v.hoverGlow,
              },
            }),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
