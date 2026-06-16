// Seed curated, license-cleared media from data/media/curated-player-media.json.
//
// Safety rules (see docs/MEDIA_LICENSE_POLICY.md):
// - Refuses to import an asset without source/credit/license UNLESS the provider
//   is GENERATED or LOCAL (assets we created/own).
// - Resolves entities by slug; skips (with a note) anything it cannot resolve.
// - Upsert-safe: re-running does not create duplicate assets/links.
// - Never renders anything publicly — it only writes rows. Status comes from the
//   data file; non-APPROVED rows stay invisible to the public query layer.
//
// If only the .example.json file exists, it prints a friendly message and exits 0.

import "dotenv/config";

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createScriptPrismaClient } from "../import/utils/db";
import type { ScriptPrismaClient } from "../import/utils/db";
import type {
  MediaAssetType,
  MediaEntityType,
} from "../../src/generated/prisma/enums";

const DATA_DIR = resolve(process.cwd(), "data", "media");
const DATA_FILE = resolve(DATA_DIR, "curated-player-media.json");
const EXAMPLE_FILE = resolve(DATA_DIR, "curated-player-media.example.json");

type CuratedMediaEntry = {
  entityType: string;
  entitySlug: string;
  assetType: string;
  provider: string;
  providerAssetId?: string | null;
  sourcePageUrl?: string | null;
  originalUrl?: string | null;
  storageUrl?: string | null;
  optimizedUrl?: string | null;
  title?: string | null;
  description?: string | null;
  altText?: string | null;
  licenseType?: string | null;
  licenseName?: string | null;
  licenseUrl?: string | null;
  creatorName?: string | null;
  creditText?: string | null;
  attributionHtml?: string | null;
  status?: string | null;
  caption?: string | null;
  priority?: number | null;
  isPrimary?: boolean | null;
};

const OWNED_PROVIDERS = new Set(["GENERATED", "LOCAL"]);

/** A non-owned asset must carry source + credit + a real license. */
function missingLicenseFields(entry: CuratedMediaEntry): string[] {
  if (OWNED_PROVIDERS.has(entry.provider)) return [];
  const missing: string[] = [];
  const has = (v?: string | null) => v != null && v.trim() !== "";
  if (!has(entry.sourcePageUrl) && !has(entry.originalUrl))
    missing.push("sourcePageUrl/originalUrl");
  if (!has(entry.creditText) && !has(entry.creatorName))
    missing.push("creditText/creatorName");
  if (
    !has(entry.licenseType) ||
    entry.licenseType === "UNKNOWN" ||
    entry.licenseType === "RIGHTS_RESERVED"
  )
    missing.push("licenseType");
  return missing;
}

/** Resolve an entity id from its slug for the supported entity types. */
async function resolveEntityId(
  prisma: ScriptPrismaClient,
  entityType: string,
  slug: string,
): Promise<string | null> {
  switch (entityType) {
    case "PLAYER": {
      const row = await prisma.player.findUnique({ where: { slug } });
      return row?.id ?? null;
    }
    case "COUNTRY": {
      const row = await prisma.country.findUnique({ where: { slug } });
      return row?.id ?? null;
    }
    case "TOURNAMENT": {
      const row = await prisma.tournament.findUnique({ where: { slug } });
      return row?.id ?? null;
    }
    case "MATCH":
    case "ICONIC_MOMENT": {
      const row = await prisma.match.findUnique({ where: { slug } });
      return row?.id ?? null;
    }
    case "STADIUM": {
      const row = await prisma.stadium.findUnique({ where: { slug } });
      return row?.id ?? null;
    }
    default:
      return null;
  }
}

async function main() {
  console.log("WORLDCUP Nexus — curated media seed\n");

  if (!existsSync(DATA_FILE)) {
    if (existsSync(EXAMPLE_FILE)) {
      console.log(
        "No curated-player-media.json found (only the .example.json).\n" +
          "Copy data/media/curated-player-media.example.json to\n" +
          "data/media/curated-player-media.json, fill in license-cleared\n" +
          "entries, then re-run `pnpm media:seed`. Nothing to do — exiting.",
      );
      return;
    }
    console.log(
      "No data/media/curated-player-media.json and no example file. " +
        "Nothing to seed — exiting.",
    );
    return;
  }

  let entries: CuratedMediaEntry[];
  try {
    const parsed = JSON.parse(readFileSync(DATA_FILE, "utf8"));
    if (!Array.isArray(parsed)) throw new Error("expected a JSON array");
    entries = parsed as CuratedMediaEntry[];
  } catch (error) {
    console.error(
      "Failed to parse curated-player-media.json:",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
    return;
  }

  const prisma = createScriptPrismaClient();
  let imported = 0;
  let skipped = 0;

  try {
    const job = await prisma.mediaImportJob.create({
      data: {
        provider: "MANUAL",
        entityType: "GENERIC",
        query: "curated-player-media.json",
        status: "RUNNING",
        recordsFound: entries.length,
      },
    });

    for (const entry of entries) {
      const label = `${entry.entityType}:${entry.entitySlug}`;

      const missing = missingLicenseFields(entry);
      if (missing.length > 0) {
        console.log(`[SKIP] ${label} — missing ${missing.join(", ")}`);
        skipped += 1;
        continue;
      }

      const entityId = await resolveEntityId(
        prisma,
        entry.entityType,
        entry.entitySlug,
      );
      if (entityId === null) {
        console.log(`[SKIP] ${label} — entity not found by slug`);
        skipped += 1;
        continue;
      }

      // Idempotency: a curated asset is identified by its entity link
      // (entityType + entityId + usage) — re-running updates that asset in place.
      const usage = entry.assetType as MediaAssetType;
      const existingLink = await prisma.entityMedia.findFirst({
        where: {
          entityType: entry.entityType as MediaEntityType,
          entityId,
          usage,
        },
        include: { mediaAsset: true },
      });

      const assetData = {
        assetType: entry.assetType,
        status: entry.status ?? "CANDIDATE",
        provider: entry.provider,
        providerAssetId: entry.providerAssetId ?? null,
        sourcePageUrl: entry.sourcePageUrl ?? null,
        originalUrl: entry.originalUrl ?? null,
        storageUrl: entry.storageUrl ?? null,
        optimizedUrl: entry.optimizedUrl ?? null,
        title: entry.title ?? null,
        description: entry.description ?? null,
        altText: entry.altText ?? null,
        licenseType: entry.licenseType ?? "UNKNOWN",
        licenseName: entry.licenseName ?? null,
        licenseUrl: entry.licenseUrl ?? null,
        creatorName: entry.creatorName ?? null,
        creditText: entry.creditText ?? null,
        attributionHtml: entry.attributionHtml ?? null,
      } as const;

      if (existingLink) {
        await prisma.mediaAsset.update({
          where: { id: existingLink.mediaAssetId },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: assetData as any,
        });
        await prisma.entityMedia.update({
          where: { id: existingLink.id },
          data: {
            priority: entry.priority ?? existingLink.priority,
            isPrimary: entry.isPrimary ?? existingLink.isPrimary,
            caption: entry.caption ?? null,
            displayAlt: entry.altText ?? null,
          },
        });
        console.log(`[UPDATE] ${label}`);
      } else {
        await prisma.mediaAsset.create({
          data: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(assetData as any),
            entityLinks: {
              create: {
                entityType: entry.entityType as MediaEntityType,
                entityId,
                usage,
                priority: entry.priority ?? 100,
                isPrimary: entry.isPrimary ?? true,
                caption: entry.caption ?? null,
                displayAlt: entry.altText ?? null,
              },
            },
          },
        });
        console.log(`[CREATE] ${label}`);
      }
      imported += 1;
    }

    await prisma.mediaImportJob.update({
      where: { id: job.id },
      data: {
        status: "DONE",
        recordsImported: imported,
        finishedAt: new Date(),
      },
    });

    console.log(`\nDone. ${imported} imported, ${skipped} skipped.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(
    "\nSeed failed:",
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
});
