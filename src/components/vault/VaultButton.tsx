// Vault buttons: rectangular, uppercase, letterspaced. Three voices —
// "primary" (white fill, black label), "outline" (white hairline), and
// "text" (uppercase label + arrow). Never rounded, never stripe-filled.

import Button from "@mui/material/Button";
import type { ButtonProps } from "@mui/material/Button";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

type VaultButtonProps = Omit<ButtonProps, "variant"> & {
  variant?: "primary" | "outline" | "text";
  /** Adds the → glyph after the label (default for text variant). */
  arrow?: boolean;
} & { component?: React.ElementType; href?: string };

export default function VaultButton({
  variant = "primary",
  arrow,
  children,
  ...props
}: VaultButtonProps) {
  const showArrow = arrow ?? variant === "text";
  const muiVariant =
    variant === "primary"
      ? "contained"
      : variant === "outline"
        ? "outlined"
        : "text";
  return (
    <Button
      variant={muiVariant}
      color={variant === "primary" ? "primary" : "inherit"}
      disableElevation
      endIcon={
        showArrow ? <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} /> : null
      }
      {...props}
    >
      {children}
    </Button>
  );
}
