import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { formatNumber } from "@/lib/format";
import type { ExplorerActiveFilters } from "@/server/queries/types";

/** Serializes active filters into export-route query params. */
function filterQueryString(active: ExplorerActiveFilters): string {
  const params = new URLSearchParams();
  if (active.eventType !== null) params.set("eventType", active.eventType);
  if (active.tournamentYear !== null)
    params.set("tournamentYear", String(active.tournamentYear));
  if (active.countrySlug !== null)
    params.set("countrySlug", active.countrySlug);
  if (active.playerSlug !== null) params.set("playerSlug", active.playerSlug);
  if (active.stage !== null) params.set("stage", active.stage);
  if (active.q !== null) params.set("q", active.q);
  const query = params.toString();
  return query === "" ? "" : `&${query}`;
}

export default function ExplorerSummary({
  total,
  page,
  pageSize,
  active,
}: {
  total: number;
  page: number;
  pageSize: number;
  active: ExplorerActiveFilters;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const filterChips = [
    active.eventType,
    active.tournamentYear !== null
      ? `Tournament ${active.tournamentYear}`
      : null,
    active.countrySlug !== null ? `Country: ${active.countrySlug}` : null,
    active.playerSlug !== null ? `Player: ${active.playerSlug}` : null,
    active.stage !== null ? `Stage: ${active.stage}` : null,
    active.q !== null ? `“${active.q}”` : null,
  ].filter((label): label is string => label !== null);
  const exportQuery = filterQueryString(active);

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
          bgcolor: "rgba(34, 211, 238, 0.12)",
          color: "#22D3EE",
          fontWeight: 700,
        }}
      />
      {filterChips.length > 0 ? (
        filterChips.map((label) => (
          <Chip
            key={label}
            label={label}
            size="small"
            variant="outlined"
            sx={{
              color: "text.primary",
              borderColor: "rgba(34, 211, 238, 0.35)",
              bgcolor: "rgba(34, 211, 238, 0.05)",
            }}
          />
        ))
      ) : (
        <Chip
          label="No filters"
          size="small"
          variant="outlined"
          sx={{ color: "text.secondary", borderColor: "divider" }}
        />
      )}
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        Page {formatNumber(page)} of {formatNumber(totalPages)}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ ml: "auto !important" }}>
        <Button
          component="a"
          href={`/api/export/explorer?format=csv${exportQuery}`}
          size="small"
          variant="outlined"
          startIcon={<FileDownloadOutlinedIcon />}
          sx={{
            color: "text.primary",
            borderColor: "rgba(34, 211, 238, 0.4)",
            "&:hover": { borderColor: "#22D3EE", color: "#22D3EE" },
          }}
        >
          Export CSV
        </Button>
        <Button
          component="a"
          href={`/api/export/explorer?format=json${exportQuery}`}
          size="small"
          variant="outlined"
          startIcon={<FileDownloadOutlinedIcon />}
          sx={{
            color: "text.primary",
            borderColor: "rgba(34, 211, 238, 0.4)",
            "&:hover": { borderColor: "#22D3EE", color: "#22D3EE" },
          }}
        >
          Export JSON
        </Button>
      </Stack>
    </Stack>
  );
}
