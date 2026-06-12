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
import { formatDate, formatMinute, formatStage } from "@/lib/format";
import type { ExplorerRowDto } from "@/server/queries/types";

// Chip tiers: solid gold only for the headline events (Match, Goal);
// everything else is a quiet tint — color never reads as alarm or status.
const EVENT_CHIP_STYLES: Record<
  string,
  { color: string; background: string; border: string }
> = {
  Match: {
    color: "#07111F",
    background: "#F4C95D",
    border: "transparent",
  },
  Goal: {
    color: "#07111F",
    background: "#D6A84F",
    border: "transparent",
  },
  Booking: {
    color: "#FACC15",
    background: "rgba(250, 204, 21, 0.14)",
    border: "rgba(250, 204, 21, 0.3)",
  },
  Substitution: {
    color: "#4ADE80",
    background: "rgba(34, 197, 94, 0.14)",
    border: "rgba(34, 197, 94, 0.3)",
  },
  PenaltyKick: {
    color: "#38BDF8",
    background: "rgba(56, 189, 248, 0.12)",
    border: "rgba(56, 189, 248, 0.3)",
  },
  Award: {
    color: "#CBD5E1",
    background: "transparent",
    border: "rgba(148, 163, 184, 0.3)",
  },
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
            border: `1px solid ${style.border}`,
            fontWeight: 600,
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
    valueGetter: (_value, row) => formatStage(row.stage) ?? "—",
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
          borderRadius: 3,
          bgcolor: "background.paper",
          boxShadow: "0 8px 24px rgba(2, 6, 14, 0.45)",
          fontSize: "0.875rem",
          "--DataGrid-rowBorderColor": "rgba(148, 163, 184, 0.12)",
          "& .MuiDataGrid-columnHeaders": { borderColor: "divider" },
          "& .MuiDataGrid-columnHeader": { bgcolor: "#122238" },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 700,
            fontSize: "0.74rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#94A3B8",
          },
          "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "rgba(56, 189, 248, 0.04)",
          },
          "& .MuiDataGrid-footerContainer": {
            borderColor: "divider",
            bgcolor: "#0D1828",
          },
        }}
      />
    </Box>
  );
}
