// Freshness labelling for the fixture data. Pure and unit-testable.

import { STALE_AFTER_MINUTES } from "./constants";
import type { FixtureFreshness } from "./types";

/**
 * Builds a "Last synced X ago" descriptor from the most recent sync time.
 * `null` lastSynced means nothing has been imported yet.
 */
export function getFreshness(
  lastSyncedAt: Date | null,
  now: Date = new Date(),
): FixtureFreshness {
  if (lastSyncedAt === null) {
    return {
      lastSyncedAt: null,
      ageMinutes: null,
      isStale: true,
      label: "Not yet synced",
    };
  }

  const ageMs = Math.max(0, now.getTime() - lastSyncedAt.getTime());
  const ageMinutes = Math.floor(ageMs / 60_000);
  const isStale = ageMinutes >= STALE_AFTER_MINUTES;

  return {
    lastSyncedAt: lastSyncedAt.toISOString(),
    ageMinutes,
    isStale,
    label: `Last synced ${formatAge(ageMinutes)}`,
  };
}

/** "just now" / "5 minutes ago" / "2 hours ago" / "3 days ago". */
export function formatAge(ageMinutes: number): string {
  if (ageMinutes < 1) return "just now";
  if (ageMinutes < 60) {
    return `${ageMinutes} minute${ageMinutes === 1 ? "" : "s"} ago`;
  }
  const hours = Math.floor(ageMinutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
