// DataTableShell — a consistent dark wrapper for tables (records, explorer,
// schedule). Rounded soft-bordered surface, dark elevated header row, soft row
// borders, readable text, hover tint, and horizontal scroll on narrow screens.
// Wrap an MUI <Table> or a custom grid; it styles descendants without changing
// their markup. Server-safe.

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { nexusBorders, nexusColors, nexusRadius } from "@/theme/visualTokens";

type DataTableShellProps = {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
};

export default function DataTableShell({ children, sx }: DataTableShellProps) {
  return (
    <Box
      sx={{
        border: nexusBorders.soft,
        borderRadius: `${nexusRadius.md}px`,
        overflow: "hidden",
        bgcolor: nexusColors.surface,
        // Horizontal scroll only inside this wrapper on narrow screens.
        "& > .DataTableShell-scroll": {
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        },
        // Dark elevated header.
        "& thead .MuiTableCell-root, & .DataTableShell-head": {
          backgroundColor: nexusColors.surfaceElevated,
          color: nexusColors.textSecondary,
          borderBottom: nexusBorders.soft,
        },
        // Soft row borders + readable body text.
        "& .MuiTableCell-root": {
          borderColor: nexusColors.borderSoft,
          color: nexusColors.textPrimary,
        },
        "& tbody .MuiTableRow-root:hover": {
          backgroundColor: "rgba(255,255,255,0.03)",
        },
        ...sx,
      }}
    >
      <Box className="DataTableShell-scroll">{children}</Box>
    </Box>
  );
}
