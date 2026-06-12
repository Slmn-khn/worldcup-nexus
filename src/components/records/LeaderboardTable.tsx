// Leaderboard panel: uppercase title strip, hairline-divided ranked rows,
// strong white values, gold top-3 ranks. Zero radius, no shadow.

import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import { formatNumber } from "@/lib/format";
import { atlas, eyebrowSx, tabularNums } from "@/theme/tokens";
import type { RecordLeaderboardDto } from "@/server/queries/types";

export default function LeaderboardTable({
  leaderboard,
}: {
  leaderboard: RecordLeaderboardDto;
}) {
  return (
    <Box
      sx={{
        border: `1px solid ${atlas.border}`,
        bgcolor: atlas.canvasSoft,
        transition: "border-color 150ms ease",
        "&:hover": { borderColor: atlas.borderStrong },
      }}
    >
      <Box
        sx={{
          px: 2.5,
          pt: 2,
          pb: 1.5,
          bgcolor: atlas.surfaceSoft,
          borderBottom: `1px solid ${atlas.border}`,
        }}
      >
        <Typography component="p" sx={{ ...eyebrowSx, color: atlas.textPrimary }}>
          {leaderboard.title}
        </Typography>
        <Typography variant="caption" sx={{ color: atlas.textMuted }}>
          {leaderboard.description}
        </Typography>
      </Box>
      <Table size="small">
        <TableBody>
          {leaderboard.items.map((item) => (
            <TableRow
              key={`${item.rank}-${item.label}`}
              sx={{
                "&:last-of-type td": { borderBottom: "none" },
                transition: "background-color 150ms ease",
                "&:hover": { bgcolor: atlas.surfaceSoft },
              }}
            >
              <TableCell
                sx={{
                  ...tabularNums,
                  width: 44,
                  fontFamily: atlas.fontDisplay,
                  fontSize: "0.95rem",
                  color: item.rank <= 3 ? atlas.gold : atlas.textMuted,
                  fontWeight: 700,
                }}
              >
                {String(item.rank).padStart(2, "0")}
              </TableCell>
              <TableCell>
                {item.href !== null ? (
                  <Typography
                    component={Link}
                    href={item.href}
                    variant="body2"
                    sx={{
                      color: atlas.textPrimary,
                      fontWeight: 600,
                      "&:hover": { color: atlas.goldStrong },
                    }}
                  >
                    {item.label}
                  </Typography>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: atlas.textPrimary, fontWeight: 600 }}
                  >
                    {item.label}
                  </Typography>
                )}
                {item.detail !== null ? (
                  <Typography
                    variant="caption"
                    sx={{ color: atlas.textMuted, display: "block" }}
                  >
                    {item.detail}
                  </Typography>
                ) : null}
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  ...tabularNums,
                  fontFamily: atlas.fontDisplay,
                  fontSize: "1.05rem",
                  color: atlas.textPrimary,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {formatNumber(item.value)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
