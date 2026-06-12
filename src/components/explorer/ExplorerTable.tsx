"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from "@mui/x-data-grid";
import Link from "@/components/Link";
import { formatDate, formatMinute } from "@/lib/format";
import type { ExplorerRowDto } from "@/server/queries/types";

const EVENT_CHIP_STYLES: Record<string, { color: string; background: string }> =
  {
    Match: { color: "#06111F", background: "#F4C95D" },
    Goal: { color: "#06111F", background: "#C9A13F" },
    Booking: { color: "#06111F", background: "#FACC15" },
    Substitution: { color: "#06111F", background: "#A3E635" },
    PenaltyKick: { color: "#F8FAFC", background: "#7F1D1D" },
    Award: { color: "#CBD5E1", background: "#263B56" },
  };

const EVENT_LABELS: Record<string, string> = {
  PenaltyKick: "Penalty kick",
};

const COLUMNS: GridColDef<ExplorerRowDto>[] = [
  {
    field: "eventType",
    headerName: "Event",
    width: 130,
    sortable: false,
    renderCell: (params) => {
      const style = EVENT_CHIP_STYLES[params.row.eventType];
      return (
        <Chip
          label={EVENT_LABELS[params.row.eventType] ?? params.row.eventType}
          size="small"
          sx={{
            bgcolor: style.background,
            color: style.color,
            fontWeight: 700,
          }}
        />
      );
    },
  },
  {
    field: "tournamentYear",
    headerName: "Tournament",
    width: 110,
    sortable: false,
    renderCell: (params) => (
      <Typography
        component={Link}
        href={`/tournaments/${params.row.tournamentYear}`}
        variant="body2"
        sx={{
          color: "primary.main",
          fontWeight: 700,
          "&:hover": { textDecoration: "underline" },
        }}
      >
        {params.row.tournamentYear}
      </Typography>
    ),
  },
  {
    field: "date",
    headerName: "Date",
    width: 150,
    sortable: false,
    valueGetter: (_value, row) => formatDate(row.date) ?? "—",
  },
  {
    field: "stage",
    headerName: "Stage",
    width: 140,
    sortable: false,
    valueGetter: (_value, row) => row.stage ?? "—",
  },
  {
    field: "matchLabel",
    headerName: "Match",
    width: 240,
    sortable: false,
    renderCell: (params) =>
      params.row.matchLabel !== null && params.row.matchSlug !== null ? (
        <Typography
          component={Link}
          href={`/matches/${params.row.matchSlug}`}
          variant="body2"
          sx={{ color: "text.primary", "&:hover": { color: "primary.main" } }}
        >
          {params.row.matchLabel}
        </Typography>
      ) : (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          —
        </Typography>
      ),
  },
  {
    field: "teamName",
    headerName: "Team",
    width: 150,
    sortable: false,
    renderCell: (params) =>
      params.row.teamName !== null && params.row.teamCountrySlug !== null ? (
        <Typography
          component={Link}
          href={`/countries/${params.row.teamCountrySlug}`}
          variant="body2"
          sx={{ color: "text.primary", "&:hover": { color: "primary.main" } }}
        >
          {params.row.teamName}
        </Typography>
      ) : (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {params.row.teamName ?? "—"}
        </Typography>
      ),
  },
  {
    field: "playerName",
    headerName: "Player",
    width: 190,
    sortable: false,
    renderCell: (params) =>
      params.row.playerName !== null && params.row.playerSlug !== null ? (
        <Typography
          component={Link}
          href={`/players/${params.row.playerSlug}`}
          variant="body2"
          sx={{ color: "text.primary", "&:hover": { color: "primary.main" } }}
        >
          {params.row.playerName}
        </Typography>
      ) : (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {params.row.playerName ?? "—"}
        </Typography>
      ),
  },
  {
    field: "minute",
    headerName: "Minute",
    width: 90,
    sortable: false,
    valueGetter: (_value, row) =>
      formatMinute(row.minute, row.stoppageMinute) ?? "—",
  },
  {
    field: "outcome",
    headerName: "Outcome",
    width: 160,
    sortable: false,
    valueGetter: (_value, row) => row.outcome ?? "—",
  },
  {
    field: "detail",
    headerName: "Detail",
    width: 200,
    sortable: false,
    valueGetter: (_value, row) => row.detail ?? "—",
  },
  {
    field: "href",
    headerName: "Link",
    width: 100,
    sortable: false,
    renderCell: (params) =>
      params.row.href !== null ? (
        <Typography
          component={Link}
          href={params.row.href}
          variant="body2"
          sx={{ color: "primary.main", fontWeight: 700 }}
        >
          View →
        </Typography>
      ) : null,
  },
];

export default function ExplorerTable({
  rows,
  total,
  page,
  pageSize,
}: {
  rows: ExplorerRowDto[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onPaginationModelChange(model: GridPaginationModel) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(model.page + 1));
    params.set("pageSize", String(model.pageSize));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={COLUMNS}
        rowCount={total}
        paginationMode="server"
        paginationModel={{ page: page - 1, pageSize }}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={[25, 50, 100]}
        disableRowSelectionOnClick
        disableColumnMenu
        density="compact"
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "background.paper",
          boxShadow: "0 12px 36px rgba(2, 8, 20, 0.45)",
          "--DataGrid-rowBorderColor": "#263B56",
          "& .MuiDataGrid-columnHeaders": { borderColor: "divider" },
          "& .MuiDataGrid-columnHeader": { bgcolor: "#13243A" },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 700,
            letterSpacing: "0.04em",
          },
          "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "rgba(34, 211, 238, 0.04)",
          },
          "& .MuiDataGrid-footerContainer": { borderColor: "divider" },
        }}
      />
    </Box>
  );
}
