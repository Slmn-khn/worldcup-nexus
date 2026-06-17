// Seed curated, license-cleared media from data/media/curated-player-media.json.
//
// Safety rules (see docs/MEDIA_LICENSE_POLICY.md):
// - Every record is validated with Zod; an invalid record is skipped (with the
//   exact issues logged), never imported half-formed.
// - Refuses to import an asset without source/credit/license UNLESS the provider
//   is GENERATED or LOCAL (assets we created/own).
// - Resolves entities by slug; skips (with a note) anything it cannot resolve.
// - Upsert-safe: re-running does not create duplicate assets/links.
// - A non-APPROVED record is never linked as a public primary asset.
// - Never renders anything publicly — it only writes rows. Status comes from the
//   data file; non-APPROVED rows stay invisible to the public query layer.
//
// Exit behavior:
// - Missing data file (only the .example.json, or nothing): friendly note, exit 0.
// - Empty data file (`[]`): friendly note, exit 0.

import "dotenv/config";

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { z } from "zod";

import { createScriptPrismaClient } from "../import/utils/db";
import type { ScriptPrismaClient } from "../import/utils/db";
import type {
  MediaAssetType,
  MediaEntityType,
} from "../../src/generated/prisma/enums";

const DATA_DIR = resolve(process.cwd(), "data", "media");
const DATA_FILE = resolve(DATA_DIR, "curated-player-media.json");
const EXAMPLE_FILE = resolve(DATA_DIR, "curated-player-media.example.json");

// Enum value sets mirror prisma/schema.prisma. Kept as literal tuples so the
// script validates without importing the generated runtime enums.
const ENTITY_TYPES = [
  "PLAYER",
  "COUNTRY",
  "TOURNAMENT",
  "MATCH",
  "RECORD",
  "ICONIC_MOMENT",
  "STADIUM",
  "GENERIC",
] as const;
const ASSET_TYPES = [
  "PORTRAIT",
  "FLAG",
  "HERO",
  "POSTER",
  "THUMBNAIL",
  "BACKGROUND",
  "EVENT_COVER",
  "TROPHY",
  "STADIUM",
  "SILHOUETTE",
  "FALLBACK",
] as const;
const PROVIDERS = [
  "LOCAL",
  "WIKIMEDIA_COMMONS",
  "WIKIDATA",
  "CLOUDINARY",
  "SUPABASE_STORAGE",
  "GENERATED",
  "MANUAL",
  "OTHER",
] as const;
const LICENSE_TYPES = [
  "PUBLIC_DOMAIN",
  "CC0",
  "CC_BY",
  "CC_BY_SA",
  "CC_BY_NC",
  "RIGHTS_RESERVED",
  "GENERATED_OWNED",
  "UNKNOWN",
] as const;
const STATUSES = [
  "CANDIDATE",
  "APPROVED",
  "REJECTED",
  "NEEDS_REVIEW",
  "ARCHIVED",
] as const;

// Blank/whitespace strings collapse to undefined so "present but empty" is
// treated as missing (and caught by the license check below).
const optionalText = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().min(1).optional(),
);

const curatedEntrySchema = z.object({
  entityType: z.enum(ENTITY_TYPES),
  entitySlug: z.string().trim().min(1),
  assetType: z.enum(ASSET_TYPES),
  provider: z.enum(PROVIDERS),
  providerAssetId: optionalText,
  sourcePageUrl: optionalText,
  originalUrl: optionalText,
  storageUrl: optionalText,
  optimizedUrl: optionalText,
  title: optionalText,
  description: optionalText,
  altText: optionalText,
  licenseType: z.enum(LICENSE_TYPES).optional().default("UNKNOWN"),
  licenseName: optionalText,
  licenseUrl: optionalText,
  creatorName: optionalText,
  creditText: optionalText,
  attributionHtml: optionalText,
  status: z.enum(STATUSES).optional().default("CANDIDATE"),
  caption: optionalText,
  priority: z.number().int().optional(),
  isPrimary: z.boolean().optional(),
});

type CuratedMediaEntry = z.infer<typeof curatedEntrySchema>;

const OWNED_PROVIDERS = new Set<CuratedMediaEntry["provider"]>([
  "GENERATED",
  "LOCAL",
]);

/** A non-owned asset must carry source + credit + a real license. */
function missingLicenseFields(entry: CuratedMediaEntry): string[] {
  if (OWNED_PROVIDERS.has(entry.provider)) return [];
  const missing: string[] = [];
  if (entry.sourcePageUrl == null && entry.originalUrl == null)
    missing.push("sourcePageUrl/originalUrl");
  if (entry.creditText == null && entry.creatorName == null)
    missing.push("creditText/creatorName");
  if (
    entry.licenseType === "UNKNOWN" ||
    entry.licenseType === "RIGHTS_RESERVED"
  )
    missing.push("licenseType");
  return missing;
}

/** Resolve an entity id from its slug for the supported entity types. */
async function resolveEntityId(
  prisma: ScriptPrismaClient,
  entityType: CuratedMediaEntry["entityType"],
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

type Summary = {
  recordsRead: number;
  playersFound: number;
  assetsCreated: number;
  assetsUpdated: number;
  linksCreated: number;
  skipped: number;
};

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

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(DATA_FILE, "utf8"));
  } catch (error) {
    console.error(
      "Failed to parse curated-player-media.json:",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
    return;
  }

  if (!Array.isArray(raw)) {
    console.error(
      "curated-player-media.json must be a JSON array. Nothing seeded.",
    );
    process.exitCode = 1;
    return;
  }

  if (raw.length === 0) {
    console.log(
      "curated-player-media.json is empty ([]). No curated media to seed yet — " +
        "exiting cleanly.",
    );
    return;
  }

  const prisma = createScriptPrismaClient();
  const summary: Summary = {
    recordsRead: raw.length,
    playersFound: 0,
    assetsCreated: 0,
    assetsUpdated: 0,
    linksCreated: 0,
    skipped: 0,
  };
  const foundEntityIds = new Set<string>();

  try {
    const job = await prisma.mediaImportJob.create({
      data: {
        provider: "MANUAL",
        entityType: "GENERIC",
        query: "curated-player-media.json",
        status: "RUNNING",
        recordsFound: raw.length,
      },
    });

    for (let i = 0; i < raw.length; i += 1) {
      const parsed = curatedEntrySchema.safeParse(raw[i]);
      if (!parsed.success) {
        const issues = parsed.error.issues
          .map(
            (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
          )
          .join("; ");
        console.log(`[SKIP] record #${i} — invalid: ${issues}`);
        summary.skipped += 1;
        continue;
      }
      const entry = parsed.data;
      const label = `${entry.entityType}:${entry.entitySlug}`;

      const missing = missingLicenseFields(entry);
      if (missing.length > 0) {
        console.log(`[SKIP] ${label} — missing ${missing.join(", ")}`);
        summary.skipped += 1;
        continue;
      }

      const entityId = await resolveEntityId(
        prisma,
        entry.entityType,
        entry.entitySlug,
      );
      if (entityId === null) {
        console.warn(`[SKIP] ${label} — entity not found by slug`);
        summary.skipped += 1;
        continue;
      }
      foundEntityIds.add(entityId);

      const usage = entry.assetType as MediaAssetType;
      const entityType = entry.entityType as MediaEntityType;
      const isApproved = entry.status === "APPROVED";

      // Idempotency: a curated asset is identified by its entity link
      // (entityType + entityId + usage) — re-running updates it in place.
      const existingLink = await prisma.entityMedia.findFirst({
        where: { entityType, entityId, usage },
        include: { mediaAsset: true },
      });

      // A non-APPROVED record never becomes a public primary asset. An APPROVED
      // record is primary only when no other primary asset already holds the
      // slot (unless the data explicitly states otherwise).
      let isPrimary = false;
      if (isApproved) {
        if (entry.isPrimary !== undefined) {
          isPrimary = entry.isPrimary;
        } else {
          const existingPrimary = await prisma.entityMedia.findFirst({
            where: {
              entityType,
              entityId,
              usage,
              isPrimary: true,
              ...(existingLink ? { id: { not: existingLink.id } } : {}),
            },
          });
          isPrimary = existingPrimary === null;
        }
      }

      const assetData = {
        assetType: entry.assetType,
        status: entry.status,
        provider: entry.provider,
        providerAssetId: entry.providerAssetId ?? null,
        sourcePageUrl: entry.sourcePageUrl ?? null,
        originalUrl: entry.originalUrl ?? null,
        storageUrl: entry.storageUrl ?? null,
        optimizedUrl: entry.optimizedUrl ?? null,
        title: entry.title ?? null,
        description: entry.description ?? null,
        altText: entry.altText ?? null,
        licenseType: entry.licenseType,
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
            priority: entry.priority ?? 10,
            isPrimary,
            caption: entry.caption ?? null,
            displayAlt: entry.altText ?? null,
          },
        });
        summary.assetsUpdated += 1;
        console.log(`[UPDATE] ${label}${isPrimary ? " (primary)" : ""}`);
      } else {
        await prisma.mediaAsset.create({
          data: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(assetData as any),
            entityLinks: {
              create: {
                entityType,
                entityId,
                usage,
                priority: entry.priority ?? 10,
                isPrimary,
                caption: entry.caption ?? null,
                displayAlt: entry.altText ?? null,
              },
            },
          },
        });
        summary.assetsCreated += 1;
        summary.linksCreated += 1;
        console.log(`[CREATE] ${label}${isPrimary ? " (primary)" : ""}`);
      }
    }

    summary.playersFound = foundEntityIds.size;

    await prisma.mediaImportJob.update({
      where: { id: job.id },
      data: {
        status: "DONE",
        recordsImported: summary.assetsCreated + summary.assetsUpdated,
        finishedAt: new Date(),
      },
    });

    console.log(
      "\nDone.\n" +
        `  recordsRead:   ${summary.recordsRead}\n` +
        `  playersFound:  ${summary.playersFound}\n` +
        `  assetsCreated: ${summary.assetsCreated}\n` +
        `  assetsUpdated: ${summary.assetsUpdated}\n` +
        `  linksCreated:  ${summary.linksCreated}\n` +
        `  skipped:       ${summary.skipped}`,
    );
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
