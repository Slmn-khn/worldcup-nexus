// Canonical host countries for tournament DTOs. Hosts come from the
// tournament's own data (Tournament.hostCountries, else the hostName label
// split on ", ") and are resolved against the Country table by name — the
// archive's single host source. Nothing here is presentation; the decorative
// host maps (src/components/maps/hostMap) consume the resolved refs.

import { cache } from "react";

import { prisma } from "@/server/db/prisma";

export type HostCountryRef = {
  /** Display name exactly as the tournament records it. */
  name: string;
  /** Canonical Country slug, or null when the name matches no Country row. */
  slug: string | null;
  /** Canonical Country code (ISO 3166 alpha-3 style, e.g. "DEU", "ENG"). */
  code: string | null;
};

type CountryDirectoryEntry = { name: string; slug: string; code: string | null };

/**
 * Host labels that differ from the Country row's name. Fjelstul records the
 * 2002 co-host as "Korea"; the country is "South Korea". Documented, tiny,
 * and the only place host labels are normalised.
 */
export const HOST_NAME_ALIASES: Readonly<Record<string, string>> = {
  korea: "south-korea",
};

export function splitHostNames(hostName: string | null, hostCountries: readonly string[] = []): string[] {
  if (hostCountries.length > 0) return [...hostCountries];
  return (hostName ?? "")
    .split(/\s*,\s*/)
    .map((name) => name.trim())
    .filter((name) => name !== "");
}

/** Pure resolution against a preloaded country directory (unit-tested). */
export function resolveHostCountries(
  hostName: string | null,
  hostCountries: readonly string[],
  directory: readonly CountryDirectoryEntry[],
): HostCountryRef[] {
  const byName = new Map(directory.map((c) => [c.name.toLowerCase(), c]));
  const bySlug = new Map(directory.map((c) => [c.slug, c]));
  return splitHostNames(hostName, hostCountries).map((name) => {
    const alias = HOST_NAME_ALIASES[name.toLowerCase()];
    const country = (alias !== undefined ? bySlug.get(alias) : undefined) ?? byName.get(name.toLowerCase());
    if (country === undefined && process.env.NODE_ENV === "development") {
      console.warn(`[hosts] host "${name}" matches no Country row — its map falls back to the gradient`);
    }
    return { name, slug: country?.slug ?? null, code: country?.code ?? null };
  });
}

/** One Country lookup per request, shared by every DTO that needs hosts. */
export const getCountryDirectory = cache(async (): Promise<CountryDirectoryEntry[]> => {
  try {
    return await prisma.country.findMany({ select: { name: true, slug: true, code: true } });
  } catch (error) {
    console.error("[hosts] country directory unavailable", error);
    return [];
  }
});
