// Explorer data API (Checkpoint 6B). Same filters as the /explorer page,
// for client-side consumers. Never exposes RawSourceRecord.

import { NextResponse } from "next/server";
import { getExplorerData } from "@/server/queries/explorer";
import { parseExplorerOptions } from "@/server/queries/parseExplorerParams";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  try {
    const data = await getExplorerData(
      parseExplorerOptions((key) => url.searchParams.get(key)),
    );
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Explorer data is unavailable. Check that the database is running.",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
