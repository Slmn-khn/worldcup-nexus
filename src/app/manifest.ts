// Web app manifest (Checkpoint 7A; icons added in Checkpoint 8E). The PWA
// icons are generated from public/brand/worldcup-nexus-icon.png by
// `pnpm assets:icons` — run it before building if the variants are missing.

import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.siteName,
    short_name: "Nexus",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#D6A84F",
    icons: [
      {
        src: "/brand/worldcup-nexus-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/worldcup-nexus-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
