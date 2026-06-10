// Explorer export API (Checkpoint 6B). CSV (default) or JSON, respecting
// the same filters as /explorer, capped at EXPLORER_EXPORT_CAP rows.
// Never exposes RawSourceRecord or environment values.

import { NextResponse } from "next/server";
import { toCsv } from "@/server/exports/csv";
import {
  EXPLORER_EXPORT_CAP,
  getExplorerExport,
} from "@/server/queries/explorer";
import { parseExplorerOptions } from "@/server/queries/parseExplorerParams";
import type { ExplorerRowDto } from "@/server/queries/types";

export const dynamic = "force-dynamic";

const CSV_HEADERS: { key: string; label: string }[] = [
  { key: "eventType", label: "eventType" },
  { key: "tournamentYear", label: "tournamentYear" },
  { key: "tournamentName", label: "tournamentName" },
  { key: "date", label: "date" },
  { key: "stage", label: "stage" },
  { key: "matchLabel", label: "matchLabel" },
  { key: "teamName", label: "teamName" },
  { key: "playerName", label: "playerName" },
  { key: "minute", label: "minute" },
  { key: "detail", label: "detail" },
  { key: "value", label: "value" },
  { key: "href", label: "href" },
];

function toExportRow(row: ExplorerRowDto): Record<string, unknown> {
  return {
    eventType: row.eventType,
    tournamentYear: row.tournamentYear,
    tournamentName: row.tournamentName,
    date: row.date,
    stage: row.stage,
    matchLabel: row.matchLabel,
    teamName: row.teamName,
    playerName: row.playerName,
    minute: row.minute,
    detail: row.detail,
    value: row.outcome,
    href: row.href,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "json" ? "json" : "csv";

  try {
    const data = await getExplorerExport(
      parseExplorerOptions((key) => url.searchParams.get(key)),
    );
    const truncated = data.total > data.rows.length;

    if (format === "json") {
      return NextResponse.json(
        {
          exportedAt: new Date().toISOString(),
          filters: data.activeFilters,
          total: data.total,
          count: data.rows.length,
          cap: EXPLORER_EXPORT_CAP,
          truncated,
          rows: data.rows.map(toExportRow),
        },
        {
          headers: truncated ? { "X-Export-Truncated": "true" } : undefined,
        },
      );
    }

    const csv = toCsv(CSV_HEADERS, data.rows.map(toExportRow));
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="worldcup-atlas-explorer.csv"',
        ...(truncated
          ? {
              "X-Export-Truncated": "true",
              "X-Export-Cap": String(EXPLORER_EXPORT_CAP),
            }
          : {}),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Export is unavailable. Check that the database is running.",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
