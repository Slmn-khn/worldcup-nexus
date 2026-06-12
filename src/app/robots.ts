// Robots policy (Checkpoint 7A): public pages crawlable, API routes not.

import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.siteUrl.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
