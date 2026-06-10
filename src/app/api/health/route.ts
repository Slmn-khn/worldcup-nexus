import { NextResponse } from "next/server";

import { prisma } from "@/server/db/prisma";

// Never prerender this route at build time; it must hit the live database.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      app: "WorldCup Atlas",
      database: "connected",
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        app: "WorldCup Atlas",
        database: "disconnected",
      },
      { status: 500 },
    );
  }
}
