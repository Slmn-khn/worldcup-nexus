// Frontend-safe media DTOs. The public query layer returns only these shapes —
// never raw Prisma MediaAsset rows, and never rawMetadata.

import type {
  MediaAssetType,
  MediaEntityType,
  MediaLicenseType,
  MediaSourceProvider,
} from "@/generated/prisma/enums";

export type {
  MediaAssetType,
  MediaEntityType,
  MediaLicenseType,
  MediaSourceProvider,
};

/** A single approved media asset resolved for an entity. */
export type MediaAssetDto = {
  id: string;
  assetType: MediaAssetType;
  /** Best render URL: optimized → storage → original. Null when none set. */
  url: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
  dominantColor: string | null;
  focalX: number | null;
  focalY: number | null;
  // Attribution (safe to show publicly on a credits surface).
  provider: MediaSourceProvider;
  licenseType: MediaLicenseType;
  licenseName: string | null;
  licenseUrl: string | null;
  creatorName: string | null;
  creditText: string | null;
  attributionHtml: string | null;
  sourcePageUrl: string | null;
  /** From the EntityMedia link, when resolved through one. */
  caption: string | null;
  isPrimary: boolean;
  priority: number;
};

/**
 * One approved asset's public attribution row, for the credits surface.
 * Never includes rawMetadata or storage internals.
 */
export type MediaCreditDto = {
  id: string;
  assetType: MediaAssetType;
  title: string | null;
  altText: string | null;
  provider: MediaSourceProvider;
  licenseType: MediaLicenseType;
  licenseName: string | null;
  licenseUrl: string | null;
  creatorName: string | null;
  creditText: string | null;
  attributionHtml: string | null;
  sourcePageUrl: string | null;
};

export type MediaFallbackKind =
  | "silhouette"
  | "flag"
  | "tournament-gradient"
  | "event"
  | "gradient";

/** Neutral, data-free fallback metadata for an entity with no approved media. */
export type MediaFallbackDto = {
  kind: MediaFallbackKind;
  /** Suggested asset role the fallback stands in for. */
  usage: MediaAssetType;
  label: string;
};
