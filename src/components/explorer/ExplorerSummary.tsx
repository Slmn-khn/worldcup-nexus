import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatNumber } from "@/lib/format";

export default function ExplorerSummary({
  total,
  page,
  pageSize,
  eventType,
  tournamentYear,
}: {
  total: number;
  page: number;
  pageSize: number;
  eventType: string | null;
  tournamentYear: number | null;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ flexWrap: "wrap", rowGap: 1, alignItems: "center" }}
    >
      <Chip
        label={`${formatNumber(total)} rows`}
        size="small"
        sx={{
          bgcolor: "rgba(244, 201, 93, 0.12)",
          color: "primary.main",
          fontWeight: 700,
        }}
      />
      <Chip
        label={eventType ?? "All event types"}
        size="small"
        variant="outlined"
        sx={{ color: "text.secondary", borderColor: "divider" }}
      />
      <Chip
        label={
          tournamentYear !== null
            ? `Tournament ${tournamentYear}`
            : "All tournaments"
        }
        size="small"
        variant="outlined"
        sx={{ color: "text.secondary", borderColor: "divider" }}
      />
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        Page {formatNumber(page)} of {formatNumber(totalPages)}
      </Typography>
    </Stack>
  );
}
