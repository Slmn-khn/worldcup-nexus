import { NextResponse } from "next/server";

import { prisma } from "@/server/db/prisma";
import { enforceRateLimit } from "@/server/security/rate-limit";

// Never prerender this route at build time; it must hit the live database.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limited = enforceRateLimit("health", request);
  if (limited !== null) return limited;

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      app: "WORLDCUP Nexus",
      database: "connected",
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        app: "WORLDCUP Nexus",
        database: "disconnected",
      },
      { status: 500 },
    );
  }
}
