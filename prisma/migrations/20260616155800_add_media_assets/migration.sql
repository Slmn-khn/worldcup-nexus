-- CreateEnum
CREATE TYPE "MediaEntityType" AS ENUM ('PLAYER', 'COUNTRY', 'TOURNAMENT', 'MATCH', 'RECORD', 'ICONIC_MOMENT', 'STADIUM', 'GENERIC');

-- CreateEnum
CREATE TYPE "MediaAssetType" AS ENUM ('PORTRAIT', 'FLAG', 'HERO', 'POSTER', 'THUMBNAIL', 'BACKGROUND', 'EVENT_COVER', 'TROPHY', 'STADIUM', 'SILHOUETTE', 'FALLBACK');

-- CreateEnum
CREATE TYPE "MediaSourceProvider" AS ENUM ('LOCAL', 'WIKIMEDIA_COMMONS', 'WIKIDATA', 'CLOUDINARY', 'SUPABASE_STORAGE', 'GENERATED', 'MANUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaLicenseType" AS ENUM ('PUBLIC_DOMAIN', 'CC0', 'CC_BY', 'CC_BY_SA', 'CC_BY_NC', 'RIGHTS_RESERVED', 'GENERATED_OWNED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "MediaAssetStatus" AS ENUM ('CANDIDATE', 'APPROVED', 'REJECTED', 'NEEDS_REVIEW', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Country" ADD COLUMN     "flagCode" TEXT,
ADD COLUMN     "iso2Code" TEXT,
ADD COLUMN     "iso3Code" TEXT;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "commonsCategory" TEXT,
ADD COLUMN     "wikidataId" TEXT;

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "themeColorPrimary" TEXT,
ADD COLUMN     "themeColorSecondary" TEXT,
ADD COLUMN     "visualTheme" TEXT;

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "assetType" "MediaAssetType" NOT NULL,
    "status" "MediaAssetStatus" NOT NULL DEFAULT 'CANDIDATE',
    "provider" "MediaSourceProvider" NOT NULL,
    "providerAssetId" TEXT,
    "sourcePageUrl" TEXT,
    "originalUrl" TEXT,
    "storageUrl" TEXT,
    "optimizedUrl" TEXT,
    "title" TEXT,
    "description" TEXT,
    "altText" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "blurDataUrl" TEXT,
    "dominantColor" TEXT,
    "focalX" DOUBLE PRECISION,
    "focalY" DOUBLE PRECISION,
    "licenseType" "MediaLicenseType" NOT NULL DEFAULT 'UNKNOWN',
    "licenseName" TEXT,
    "licenseUrl" TEXT,
    "creatorName" TEXT,
    "creditText" TEXT,
    "attributionHtml" TEXT,
    "rawMetadata" JSONB,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityMedia" (
    "id" TEXT NOT NULL,
    "entityType" "MediaEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "usage" "MediaAssetType" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "caption" TEXT,
    "displayAlt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntityMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaImportJob" (
    "id" TEXT NOT NULL,
    "provider" "MediaSourceProvider" NOT NULL,
    "entityType" "MediaEntityType" NOT NULL,
    "entityId" TEXT,
    "query" TEXT,
    "status" TEXT NOT NULL,
    "recordsFound" INTEGER NOT NULL DEFAULT 0,
    "recordsImported" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaAsset_assetType_idx" ON "MediaAsset"("assetType");

-- CreateIndex
CREATE INDEX "MediaAsset_status_idx" ON "MediaAsset"("status");

-- CreateIndex
CREATE INDEX "MediaAsset_provider_idx" ON "MediaAsset"("provider");

-- CreateIndex
CREATE INDEX "MediaAsset_licenseType_idx" ON "MediaAsset"("licenseType");

-- CreateIndex
CREATE INDEX "EntityMedia_entityType_entityId_idx" ON "EntityMedia"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "EntityMedia_mediaAssetId_idx" ON "EntityMedia"("mediaAssetId");

-- CreateIndex
CREATE INDEX "EntityMedia_usage_idx" ON "EntityMedia"("usage");

-- CreateIndex
CREATE INDEX "EntityMedia_isPrimary_idx" ON "EntityMedia"("isPrimary");

-- CreateIndex
CREATE INDEX "MediaImportJob_provider_idx" ON "MediaImportJob"("provider");

-- CreateIndex
CREATE INDEX "MediaImportJob_entityType_entityId_idx" ON "MediaImportJob"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "MediaImportJob_status_idx" ON "MediaImportJob"("status");

-- AddForeignKey
ALTER TABLE "EntityMedia" ADD CONSTRAINT "EntityMedia_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
