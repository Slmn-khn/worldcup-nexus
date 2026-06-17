// Server-side media query layer. Pages and route handlers read media ONLY
// through these helpers — never the browser, never raw Prisma rows.
//
// Guarantees:
// - Only APPROVED assets are returned (status filter is enforced in the query).
// - Ordering is isPrimary desc, priority asc, createdAt asc.
// - DTOs are serializable and never include rawMetadata.
// - Nothing throws when an entity has no media — callers get [] / null.

import { prisma } from "@/server/db/prisma";
import {
  MediaAssetStatus,
  MediaAssetType as MediaAssetTypeEnum,
  MediaEntityType as MediaEntityTypeEnum,
} from "@/generated/prisma/enums";
import type { MediaAssetType, MediaEntityType } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import type { MediaAssetDto, MediaCreditDto } from "./types";
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

/**
 * Best APPROVED PORTRAIT per player, keyed by the player's slug. Resolves slugs
 * to ids internally so callers can pass the slugs they already have on a card.
 * Slugs with no approved portrait are simply absent from the map. Returns an
 * empty map for an empty input. Never throws — a failure resolves to an empty
 * map so media can never block a page render.
 */
export async function getPrimaryPlayerPortraitsBySlug(
  slugs: string[],
): Promise<Map<string, MediaAssetDto>> {
  const result = new Map<string, MediaAssetDto>();
  const uniqueSlugs = [...new Set(slugs)].filter((slug) => slug !== "");
  if (uniqueSlugs.length === 0) return result;

  try {
    const players = await prisma.player.findMany({
      where: { slug: { in: uniqueSlugs } },
      select: { id: true, slug: true },
    });
    if (players.length === 0) return result;

    const slugById = new Map(players.map((p) => [p.id, p.slug]));
    const byId = await getMediaForEntities({
      entityType: MediaEntityTypeEnum.PLAYER,
      entityIds: players.map((p) => p.id),
      usage: MediaAssetTypeEnum.PORTRAIT,
    });

    for (const [id, dto] of byId) {
      const slug = slugById.get(id);
      if (slug !== undefined) result.set(slug, dto);
    }
    return result;
  } catch {
    // Media is a decorative enhancement — never let a query failure break a page.
    return result;
  }
}

/**
 * All APPROVED assets' public attribution rows, for the credits page. Ordered
 * newest first. Never includes rawMetadata. Returns [] when there is none and
 * never throws.
 */
export async function getApprovedMediaCredits(): Promise<MediaCreditDto[]> {
  try {
    const assets = await prisma.mediaAsset.findMany({
      where: { status: MediaAssetStatus.APPROVED },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        assetType: true,
        title: true,
        altText: true,
        provider: true,
        licenseType: true,
        licenseName: true,
        licenseUrl: true,
        creatorName: true,
        creditText: true,
        attributionHtml: true,
        sourcePageUrl: true,
      },
    });
    return assets;
  } catch {
    return [];
  }
}
