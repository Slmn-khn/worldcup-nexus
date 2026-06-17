// DataPanel — a dark rounded panel wrapper for tables, filters, and stat blocks.
// Soft border, subtle gradient fill, consistent radius. Server-safe.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  nexusBorders,
  nexusColors,
  nexusGradients,
  nexusRadius,
} from "@/theme/visualTokens";

type DataPanelProps = {
  children: React.ReactNode;
  /** Optional uppercase panel label rendered in the corner. */
  label?: string;
  /** Optional right-aligned content beside the label (e.g. a count). */
  meta?: React.ReactNode;
  /** Remove inner padding (e.g. when wrapping a flush table). */
  flush?: boolean;
  sx?: SxProps<Theme>;
};

export default function DataPanel({
  children,
  label,
  meta,
  flush = false,
  sx,
}: DataPanelProps) {
  return (
    <Box
      sx={{
        background: nexusGradients.card,
        border: nexusBorders.soft,
        borderRadius: `${nexusRadius.md}px`,
        overflow: "hidden",
        ...sx,
      }}
    >
      {label || meta ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            px: { xs: 2, md: 3 },
            py: 1.75,
            borderBottom: nexusBorders.soft,
          }}
        >
          {label ? (
            <Typography
              component="p"
              sx={{
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: nexusColors.textSecondary,
              }}
            >
              {label}
            </Typography>
          ) : (
            <span />
          )}
          {meta ? (
            <Typography
              component="span"
              sx={{
                fontVariantNumeric: "tabular-nums",
                fontSize: "0.72rem",
                color: nexusColors.textMuted,
              }}
            >
              {meta}
            </Typography>
          ) : null}
        </Box>
      ) : null}
      <Box sx={{ p: flush ? 0 : { xs: 2, md: 3 } }}>{children}</Box>
    </Box>
  );
}
