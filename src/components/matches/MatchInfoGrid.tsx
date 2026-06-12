import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { formatDate, formatNumber, formatStage } from "@/lib/format";
import type { MatchDetailDto } from "@/server/queries/types";

/** Renders only facts present in the imported data — absent fields are omitted. */
export default function MatchInfoGrid({ match }: { match: MatchDetailDto }) {
  const stadiumLocation =
    match.stadium !== null
      ? [match.stadium.city, match.stadium.country]
          .filter((part): part is string => part !== null)
          .join(", ")
      : null;

  const rows = [
    { label: "Date", value: formatDate(match.matchDate) },
    { label: "Stage", value: formatStage(match.stage) },
    { label: "Stadium", value: match.stadium?.name ?? null },
    {
      label: "Location",
      value: stadiumLocation !== "" ? stadiumLocation : null,
    },
    { label: "Referee", value: match.referee?.name ?? null },
    {
      label: "Attendance",
      value: match.attendance !== null ? formatNumber(match.attendance) : null,
    },
    {
      label: "Match number",
      value: match.matchNumber !== null ? `#${match.matchNumber}` : null,
    },
  ].filter(
    (row): row is { label: string; value: string } => row.value !== null,
  );

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr 1fr",
          sm: "repeat(3, 1fr)",
          md: "repeat(5, 1fr)",
        },
      }}
    >
      {rows.map((row) => (
        <Box
          key={row.label}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1.5,
            bgcolor: "background.paper",
            px: 2,
            py: 1.5,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: "text.secondary",
              letterSpacing: "0.12em",
              display: "block",
              lineHeight: 1.8,
            }}
          >
            {row.label}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.primary", fontWeight: 600 }}
          >
            {row.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
