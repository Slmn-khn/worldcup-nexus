// Neutral, data-free fallbacks for entities with no approved media. These never
// reference an external image — they describe what the UI should render in the
// absence of media (a silhouette card, a CSS flag, a dark gradient, …).

import type { MediaEntityType } from "@/generated/prisma/enums";
import type { MediaFallbackDto } from "./types";

/**
 * Describe the fallback for an entity type. Pure and synchronous — safe to call
 * for every entity on a page. The component layer decides how to render each
 * `kind` (see src/components/media/*).
 */
export function getMediaFallbackForEntity(input: {
  entityType: MediaEntityType;
}): MediaFallbackDto {
  switch (input.entityType) {
    case "PLAYER":
      return { kind: "silhouette", usage: "SILHOUETTE", label: "Player" };
    case "COUNTRY":
      return { kind: "flag", usage: "FLAG", label: "Country" };
    case "TOURNAMENT":
      return { kind: "tournament-gradient", usage: "HERO", label: "Tournament" };
    case "MATCH":
    case "ICONIC_MOMENT":
      return { kind: "event", usage: "EVENT_COVER", label: "Match" };
    case "STADIUM":
      return { kind: "gradient", usage: "STADIUM", label: "Stadium" };
    case "RECORD":
    case "GENERIC":
    default:
      return { kind: "gradient", usage: "BACKGROUND", label: "WORLDCUP Nexus" };
  }
}
