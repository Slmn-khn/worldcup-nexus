// Server-side media query layer. Pages and route handlers read media ONLY
// through these helpers — never the browser, never raw Prisma rows.
//
// Guarantees:
// - Only APPROVED assets are returned (status filter is enforced in the query).
// - Ordering is isPrimary desc, priority asc, createdAt asc.
// - DTOs are serializable and never include rawMetadata.
// - Nothing throws when an entity has no media — callers get [] / null.

import { prisma } from "@/server/db/prisma";
import { MediaAssetStatus } from "@/generated/prisma/enums";
import type { MediaAssetType, MediaEntityType } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import type { MediaAssetDto } from "./types";
import { resolveMediaUrl } from "./selectors";

type EntityMediaWithAsset = Prisma.EntityMediaGetPayload<{
  include: { mediaAsset: true };
}>;

/** Map a joined EntityMedia + MediaAsset row to a frontend-safe DTO. */
function toMediaAssetDto(link: EntityMediaWithAsset): MediaAssetDto {
  const asset = link.mediaAsset;
  return {
    id: asset.id,
    assetType: asset.assetType,
    url: resolveMediaUrl(asset),
    altText: link.displayAlt ?? asset.altText,
    width: asset.width,
    height: asset.height,
    blurDataUrl: asset.blurDataUrl,
    dominantColor: asset.dominantColor,
    focalX: asset.focalX,
    focalY: asset.focalY,
    provider: asset.provider,
    licenseType: asset.licenseType,
    licenseName: asset.licenseName,
    licenseUrl: asset.licenseUrl,
    creatorName: asset.creatorName,
    creditText: asset.creditText,
    attributionHtml: asset.attributionHtml,
    sourcePageUrl: asset.sourcePageUrl,
    caption: link.caption,
    isPrimary: link.isPrimary,
    priority: link.priority,
  };
}

// Public ordering: primary first, then priority asc, then oldest first.
const MEDIA_ORDER_BY: Prisma.EntityMediaOrderByWithRelationInput[] = [
  { isPrimary: "desc" },
  { priority: "asc" },
  { createdAt: "asc" },
];

/**
 * The single best APPROVED asset for one entity (optionally filtered by usage),
 * or null when none exists. Never throws.
 */
export async function getPrimaryMediaForEntity(input: {
  entityType: MediaEntityType;
  entityId: string;
  usage?: MediaAssetType;
}): Promise<MediaAssetDto | null> {
  const link = await prisma.entityMedia.findFirst({
    where: {
      entityType: input.entityType,
      entityId: input.entityId,
      ...(input.usage ? { usage: input.usage } : {}),
      mediaAsset: { status: MediaAssetStatus.APPROVED },
    },
    include: { mediaAsset: true },
    orderBy: MEDIA_ORDER_BY,
  });
  return link ? toMediaAssetDto(link) : null;
}

/**
 * Best APPROVED asset per entity for a batch of ids (optionally filtered by
 * usage). Returns a map keyed by entityId; ids with no media are simply absent.
 * Returns an empty map for an empty id list. Never throws.
 */
export async function getMediaForEntities(input: {
  entityType: MediaEntityType;
  entityIds: string[];
  usage?: MediaAssetType;
}): Promise<Map<string, MediaAssetDto>> {
  const result = new Map<string, MediaAssetDto>();
  const ids = [...new Set(input.entityIds)].filter((id) => id !== "");
  if (ids.length === 0) return result;

  const links = await prisma.entityMedia.findMany({
    where: {
      entityType: input.entityType,
      entityId: { in: ids },
      ...(input.usage ? { usage: input.usage } : {}),
      mediaAsset: { status: MediaAssetStatus.APPROVED },
    },
    include: { mediaAsset: true },
    orderBy: MEDIA_ORDER_BY,
  });

  // orderBy already sorts the best link first; keep the first per entity.
  for (const link of links) {
    if (!result.has(link.entityId)) {
      result.set(link.entityId, toMediaAssetDto(link));
    }
  }
  return result;
}
