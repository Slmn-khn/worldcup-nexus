// Sitemap generated from the live database (Checkpoint 7A). Historical data
// is stable, so detail pages use low-frequency entries. A query failure
// throws — failing the build loudly beats shipping a bad sitemap.

import type { MetadataRoute } from "next";
import { prisma } from "@/server/db/prisma";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.siteUrl.replace(/\/$/, "");

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/tournaments`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/matches`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/countries`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/players`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/records`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/explorer`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/sources`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.5 },
  ];

  const [tournaments, matches, countries, players] = await Promise.all([
    prisma.tournament.findMany({ select: { year: true } }),
    prisma.match.findMany({ select: { slug: true } }),
    prisma.country.findMany({ select: { slug: true } }),
    prisma.player.findMany({ select: { slug: true } }),
  ]);

  return [
    ...staticEntries,
    ...tournaments.map((tournament) => ({
      url: `${base}/tournaments/${tournament.year}`,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    ...countries.map((country) => ({
      url: `${base}/countries/${country.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    ...matches.map((match) => ({
      url: `${base}/matches/${match.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
    ...players.map((player) => ({
      url: `${base}/players/${player.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
