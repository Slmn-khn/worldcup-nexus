// NeonButton — compact uppercase CTA with a neon glow on hover. Variants:
// gold (filled trophy gold), cyan (filled electric cyan), outline (hairline
// that lights up cyan). Server-safe (CSS-only hover). Polymorphic via the MUI
// Button `component` prop (e.g. component={Link} href=...).

import Button from "@mui/material/Button";
import type { ButtonProps } from "@mui/material/Button";
import { atlasColors, atlasBorders, atlasShadows } from "@/theme/visualTokens";

type NeonButtonVariant = "gold" | "cyan" | "outline";

type NeonButtonProps = Omit<ButtonProps, "variant" | "color"> & {
  neon?: NeonButtonVariant;
} & { component?: React.ElementType; href?: string };

export default function NeonButton({
  neon = "gold",
  children,
  sx,
  ...props
}: NeonButtonProps) {
  const base = {
    borderRadius: "999px",
    px: 3.5,
    minHeight: 48,
    fontSize: "0.8rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    transition:
      "box-shadow 200ms ease, transform 200ms ease, background-color 200ms ease, border-color 200ms ease",
    "&:hover": { transform: "translateY(-1px)" },
  } as const;

  const variants = {
    gold: {
      bgcolor: atlasColors.gold,
      color: "#0A0A0A",
      border: `1px solid ${atlasColors.gold}`,
      boxShadow: atlasShadows.goldGlow,
      "&:hover": {
        ...base["&:hover"],
        bgcolor: atlasColors.goldStrong,
        boxShadow: atlasShadows.goldGlowStrong,
      },
    },
    cyan: {
      bgcolor: atlasColors.cyan,
      color: "#04121A",
      border: `1px solid ${atlasColors.cyan}`,
      boxShadow: atlasShadows.cyanGlow,
      "&:hover": {
        ...base["&:hover"],
        bgcolor: atlasColors.cyanStrong,
        boxShadow: atlasShadows.cyanGlowStrong,
      },
    },
    outline: {
      bgcolor: "transparent",
      color: atlasColors.textPrimary,
      border: `1px solid ${atlasBorders.softStrong}`,
      boxShadow: "none",
      "&:hover": {
        ...base["&:hover"],
        borderColor: atlasColors.cyan,
        color: atlasColors.cyanStrong,
        boxShadow: atlasShadows.cyanGlow,
        bgcolor: "rgba(0,217,255,0.06)",
      },
    },
  } as const;

  return (
    <Button
      variant="text"
      disableElevation
      sx={{ ...base, ...variants[neon], ...sx }}
      {...props}
    >
      {children}
    </Button>
  );
}
