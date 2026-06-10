// DEV-ONLY data summary endpoint. Returns archive stats and record
// leaderboards from the query layer so the import can be eyeballed without
// Prisma Studio. Disabled (404) outside development. Never exposes
// RawSourceRecord payloads.

import { NextResponse } from "next/server";
import { getArchiveStats } from "@/server/queries/home";
import { getRecordsOverview } from "@/server/queries/records";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const [archiveStats, records] = await Promise.all([
    getArchiveStats(),
    getRecordsOverview(),
  ]);
  return NextResponse.json({ archiveStats, records });
}
