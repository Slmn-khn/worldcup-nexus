// Pure, DB-free helpers for the media query layer. Kept separate so they can be
// unit-tested without a database or the generated Prisma client.

import type { MediaAssetDto } from "./types";

/** The minimal asset shape these selectors read (a subset of MediaAsset). */
export type AssetUrlSource = {
  optimizedUrl?: string | null;
  storageUrl?: string | null;
  originalUrl?: string | null;
};

/** Best render URL: optimized → storage → original. Null when none is set. */
export function resolveMediaUrl(asset: AssetUrlSource): string | null {
  const candidate = asset.optimizedUrl ?? asset.storageUrl ?? asset.originalUrl;
  if (candidate == null) return null;
  const trimmed = candidate.trim();
  return trimmed === "" ? null : trimmed;
}

/** Sort key for an entity↔media link. */
export type SortableLink = {
  isPrimary: boolean;
  priority: number;
  createdAt: Date | string;
};

function toTime(value: Date | string): number {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

/**
 * Comparator implementing the public ordering: isPrimary desc, priority asc,
 * createdAt asc. Stable and total so `sort` is deterministic.
 */
export function compareMediaLinks(a: SortableLink, b: SortableLink): number {
  if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
  if (a.priority !== b.priority) return a.priority - b.priority;
  return toTime(a.createdAt) - toTime(b.createdAt);
}

/** Sort a copy of the links by the public ordering. */
export function sortMediaLinks<T extends SortableLink>(links: readonly T[]): T[] {
  return [...links].sort(compareMediaLinks);
}

/**
 * Pick the single best media DTO for an entity (the first after sorting), or
 * null when there are none. Never throws on an empty list. DTOs carry no
 * createdAt, so ties fall back to insertion order (already stable).
 */
export function selectPrimaryMedia(
  media: readonly MediaAssetDto[],
): MediaAssetDto | null {
  if (media.length === 0) return null;
  return (
    [...media].sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      return a.priority - b.priority;
    })[0] ?? null
  );
}
