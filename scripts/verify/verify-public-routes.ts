// Public route / SEO verification (Checkpoint 7A). Checks that the public
// surface exists and that sitemap/robots/site config produce sane output.
//
// Usage: pnpm public:verify

import "dotenv/config";

import { existsSync } from "node:fs";
import path from "node:path";
import { prisma } from "@/server/db/prisma";
import { siteConfig } from "@/lib/site";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

type Check = { name: string; passed: boolean; detail: string };
const checks: Check[] = [];

function check(name: string, passed: boolean, detail: string): void {
  checks.push({ name, passed, detail });
}

const REQUIRED_FILES = [
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/app/not-found.tsx",
  "src/app/error.tsx",
  "src/app/sitemap.ts",
  "src/app/robots.ts",
  "src/app/manifest.ts",
  "src/app/sources/page.tsx",
  "src/app/about/page.tsx",
  "src/app/tournaments/page.tsx",
  "src/app/matches/page.tsx",
  "src/app/countries/page.tsx",
  "src/app/players/page.tsx",
  "src/app/records/page.tsx",
  "src/app/explorer/page.tsx",
  "docs/DEPLOYMENT.md",
];

async function main() {
  console.log("WorldCup Atlas — public route verification\n");

  for (const file of REQUIRED_FILES) {
    check(`file exists: ${file}`, existsSync(path.resolve(file)), file);
  }

  check(
    "site config has required values",
    siteConfig.siteName === "WorldCup Atlas" &&
      siteConfig.disclaimer.includes("not affiliated with FIFA") &&
      siteConfig.siteUrl.startsWith("http") &&
      siteConfig.sourceAttribution.license === "CC-BY-SA 4.0" &&
      siteConfig.sourceAttribution.copyright.includes("Joshua C. Fjelstul"),
    `${siteConfig.siteName} @ ${siteConfig.siteUrl}, license ${siteConfig.sourceAttribution.license}`,
  );

  const robotsResult = robots();
  const rules = Array.isArray(robotsResult.rules)
    ? robotsResult.rules
    : [robotsResult.rules];
  check(
    "robots policy is sane",
    rules.some((rule) => rule?.allow === "/") &&
      rules.some((rule) =>
        Array.isArray(rule?.disallow)
          ? rule.disallow.includes("/api/")
          : rule?.disallow === "/api/",
      ) &&
      typeof robotsResult.sitemap === "string" &&
      robotsResult.sitemap.endsWith("/sitemap.xml"),
    `sitemap: ${robotsResult.sitemap}`,
  );

  const entries = await sitemap();
  const urls = entries.map((entry) => entry.url);
  check(
    "sitemap returns entries",
    entries.length > 9 && entries.length < 50000,
    `${entries.length} entries`,
  );
  check(
    "sitemap covers key routes",
    ["/", "/tournaments", "/records", "/sources", "/about"].every((route) =>
      urls.some(
        (url) => url === `${siteConfig.siteUrl.replace(/\/$/, "")}${route}`,
      ),
    ) && urls.some((url) => url.includes("/tournaments/1")),
    "static + dynamic routes present",
  );
  check(
    "sitemap does not leak API routes",
    !urls.some((url) => url.includes("/api/")),
    "no /api/ URLs",
  );

  console.log("Checks");
  let failures = 0;
  for (const { name, passed, detail } of checks) {
    if (!passed) failures += 1;
    console.log(`  [${passed ? "PASS" : "FAIL"}] ${name} — ${detail}`);
  }

  if (failures > 0) {
    console.error(`\n${failures} public route check(s) failed.`);
    process.exitCode = 1;
  } else {
    console.log("\nAll public route checks passed.");
  }
}

main()
  .catch((error) => {
    console.error(
      "\nPublic route verification failed:",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
