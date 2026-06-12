// Central site configuration used by metadata, layout, footer, sitemap,
// and robots. Single source of truth for naming and the independence
// disclaimer — WORLDCUP Nexus never claims FIFA affiliation.

export const siteConfig = {
  siteName: "WORLDCUP Nexus",
  tagline: "Every World Cup. Every Era. Every Legend.",
  description: "An independent historical archive of the FIFA World Cup.",
  disclaimer:
    "WORLDCUP Nexus is an independent historical archive and is not affiliated with FIFA.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  sourceAttribution: {
    name: "Fjelstul World Cup Database",
    author: "Joshua C. Fjelstul, Ph.D.",
    copyright: "© 2023 Joshua C. Fjelstul, Ph.D.",
    license: "CC-BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/legalcode",
    repositoryUrl: "https://www.github.com/jfjelstul/worldcup",
  },
  navLinks: [
    { label: "Tournaments", href: "/tournaments" },
    { label: "Matches", href: "/matches" },
    { label: "Countries", href: "/countries" },
    { label: "Players", href: "/players" },
    { label: "Records", href: "/records" },
    { label: "Explorer", href: "/explorer" },
    { label: "Sources", href: "/sources" },
    { label: "About", href: "/about" },
  ],
} as const;
