// Maps pre-promotion 2026 URLs (/matches/2026/<sourceId>,
// /tournaments/2026/players/<sourceId>) onto canonical pages once the 2026
// tournament lives in the canonical tables, so every match/player has ONE
// public URL. Returns null before promotion — the legacy pages keep working.

import { prisma } from "@/server/db/prisma";

export async function canonicalMatchSlugForSource(sourceMatchId: number): Promise<string | null> {
  const match = await prisma.match
    .findUnique({ where: { sourceId: `mominul2026:match:${sourceMatchId}` }, select: { slug: true } })
    .catch(() => null);
  return match?.slug ?? null;
}

/**
 * Uses the importer's recorded identity decision (RawSourceRecord
 * "playerIdentity"), which covers players linked to pre-existing canonical
 * profiles as well as newly created ones.
 */
export async function canonicalPlayerSlugForSource(sourcePlayerId: number): Promise<string | null> {
  const record = await prisma.rawSourceRecord
    .findFirst({
      where: { source: "wcn-2026-bundle", entityType: "playerIdentity", sourceId: `playerIdentity:${sourcePlayerId}` },
      orderBy: { importedAt: "desc" },
      select: { payload: true },
    })
    .catch(() => null);
  const canonicalPlayerId = (record?.payload as { canonicalPlayerId?: unknown } | undefined)?.canonicalPlayerId;
  if (typeof canonicalPlayerId !== "string") return null;
  const player = await prisma.player.findUnique({ where: { id: canonicalPlayerId }, select: { slug: true } });
  return player?.slug ?? null;
}
