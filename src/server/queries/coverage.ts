// Canonical archive coverage, computed from the Tournament table so page copy
// ("… in the archive (1930–2026)") is true on every database: before the 2026
// promotion it reads 1930–2022, afterwards 1930–2026. Never hard-coded.

import { cache } from "react";

import { prisma } from "@/server/db/prisma";

export type CanonicalCoverage = {
  startYear: number | null;
  endYear: number | null;
  /** "1930–2026", or null when the archive is empty/unavailable. */
  label: string | null;
  /** True once the latest edition (2026) lives in the canonical tables. */
  includes2026: boolean;
};

export const getCanonicalCoverage = cache(async (): Promise<CanonicalCoverage> => {
  try {
    const span = await prisma.tournament.aggregate({ _min: { year: true }, _max: { year: true } });
    const startYear = span._min.year;
    const endYear = span._max.year;
    return {
      startYear,
      endYear,
      label: startYear !== null && endYear !== null ? `${startYear}–${endYear}` : null,
      includes2026: endYear !== null && endYear >= 2026,
    };
  } catch {
    return { startYear: null, endYear: null, label: null, includes2026: false };
  }
});

/** "(1930–2026)" suffix for meta lines, empty when unknown. */
export function coverageSuffix(coverage: CanonicalCoverage): string {
  return coverage.label === null ? "" : ` (${coverage.label})`;
}
