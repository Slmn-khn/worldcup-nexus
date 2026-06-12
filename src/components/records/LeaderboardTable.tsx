import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import { formatNumber } from "@/lib/format";
import type { RecordLeaderboardDto } from "@/server/queries/types";

/** Compact leaderboard card: title, description, ranked rows with links. */
export default function LeaderboardTable({
  leaderboard,
}: {
  leaderboard: RecordLeaderboardDto;
}) {
  return (
    <Box
      sx={{
        border: "1px solid rgba(244, 201, 93, 0.22)",
        borderRadius: 2,
        background: "linear-gradient(145deg, #0E1A2A, #101827)",
        boxShadow: "0 10px 30px rgba(2, 8, 20, 0.35)",
        overflow: "hidden",
        transition: "border-color 200ms ease, box-shadow 200ms ease",
        "&:hover": {
          borderColor: "rgba(34, 211, 238, 0.35)",
          boxShadow:
            "0 12px 36px rgba(2, 8, 20, 0.5), 0 0 18px rgba(34, 211, 238, 0.08)",
        },
      }}
    >
      <Box
        sx={{
          px: 2.5,
          pt: 2,
          pb: 1.5,
          bgcolor: "#13243A",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="overline"
          sx={{
            color: "primary.main",
            letterSpacing: "0.12em",
            display: "block",
          }}
        >
          {leaderboard.title}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
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
                "&:hover": { bgcolor: "rgba(34, 211, 238, 0.04)" },
              }}
            >
              <TableCell
                sx={{
                  width: 36,
                  color: item.rank <= 3 ? "primary.main" : "#94A3B8",
                  fontWeight: 700,
                  borderColor: "divider",
                }}
              >
                {item.rank}
              </TableCell>
              <TableCell sx={{ borderColor: "divider" }}>
                {item.href !== null ? (
                  <Typography
                    component={Link}
                    href={item.href}
                    variant="body2"
                    sx={{
                      color: "text.primary",
                      fontWeight: 600,
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    {item.label}
                  </Typography>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: "text.primary", fontWeight: 600 }}
                  >
                    {item.label}
                  </Typography>
                )}
                {item.detail !== null ? (
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", display: "block" }}
                  >
                    {item.detail}
                  </Typography>
                ) : null}
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  color: "primary.main",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  borderColor: "divider",
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
