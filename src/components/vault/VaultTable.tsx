// Vault table shell: hairline row dividers, uppercase headers, black
// surface. Renders a simple column/row model with right-aligned numeric
// columns and horizontal overflow on mobile.

import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { atlas } from "@/theme/tokens";

export type VaultColumn = {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  /** Strong numeric/score column (white, bold, tabular). */
  strong?: boolean;
};

type VaultTableProps = {
  columns: VaultColumn[];
  rows: Record<string, React.ReactNode>[];
  /** Accessible table caption (visually hidden). */
  label: string;
};

export default function VaultTable({ columns, rows, label }: VaultTableProps) {
  return (
    <Box
      sx={{
        border: `1px solid ${atlas.border}`,
        bgcolor: atlas.canvasSoft,
        overflowX: "auto",
      }}
    >
      <Table size="small" aria-label={label} sx={{ minWidth: 560 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: atlas.surfaceSoft }}>
            {columns.map((column) => (
              <TableCell key={column.key} align={column.align ?? "left"}>
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={index}
              sx={{
                "&:last-of-type td": { borderBottom: "none" },
                transition: "background-color 150ms ease",
                "&:hover": { bgcolor: atlas.surfaceSoft },
              }}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align ?? "left"}
                  sx={
                    column.strong
                      ? {
                          color: atlas.textPrimary,
                          fontWeight: 700,
                          fontVariantNumeric: "tabular-nums",
                          whiteSpace: "nowrap",
                        }
                      : { color: atlas.textSecondary, fontWeight: 300 }
                  }
                >
                  {row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
