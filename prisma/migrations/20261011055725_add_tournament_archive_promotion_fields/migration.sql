-- AlterTable
ALTER TABLE "Award" ADD COLUMN     "details" JSONB,
ADD COLUMN     "rank" INTEGER,
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "verificationStatus" TEXT;

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "extraTime" BOOLEAN,
ADD COLUMN     "groupName" TEXT;

-- AlterTable
ALTER TABLE "RawSourceRecord" ADD COLUMN     "importRunId" TEXT,
ADD COLUMN     "retrievedAt" TIMESTAMP(3),
ADD COLUMN     "sourceChecksum" TEXT,
ADD COLUMN     "sourceUrl" TEXT;

-- AlterTable
ALTER TABLE "Stadium" ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "attendance" INTEGER,
ADD COLUMN     "fourthPlaceTeamId" TEXT,
ADD COLUMN     "hostCountries" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "thirdPlaceTeamId" TEXT,
ADD COLUMN     "verificationStatus" TEXT;

-- CreateTable
CREATE TABLE "DataImportRun" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "tournamentYear" INTEGER,
    "sourceChecksum" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "targetSummary" TEXT,
    "counts" JSONB,
    "warnings" JSONB,
    "errors" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataImportRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataImportCheckpoint" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceChecksum" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "rowsCompleted" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataImportCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DataImportRun_source_tournamentYear_idx" ON "DataImportRun"("source", "tournamentYear");

-- CreateIndex
CREATE INDEX "DataImportRun_status_idx" ON "DataImportRun"("status");

-- CreateIndex
CREATE INDEX "DataImportCheckpoint_runId_idx" ON "DataImportCheckpoint"("runId");

-- CreateIndex
CREATE UNIQUE INDEX "DataImportCheckpoint_source_sourceChecksum_entity_key" ON "DataImportCheckpoint"("source", "sourceChecksum", "entity");

-- CreateIndex
CREATE INDEX "Match_tournamentId_groupName_idx" ON "Match"("tournamentId", "groupName");

-- CreateIndex
CREATE INDEX "RawSourceRecord_importRunId_idx" ON "RawSourceRecord"("importRunId");

-- AddForeignKey
ALTER TABLE "DataImportCheckpoint" ADD CONSTRAINT "DataImportCheckpoint_runId_fkey" FOREIGN KEY ("runId") REFERENCES "DataImportRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
