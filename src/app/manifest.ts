// Web app manifest (Checkpoint 7A). No icon set exists yet beyond the
// favicon, so icons are intentionally omitted.

import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.siteName,
    short_name: "Atlas",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#06111F",
    theme_color: "#F4C95D",
  };
}
