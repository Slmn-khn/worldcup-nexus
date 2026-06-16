-- CreateEnum
CREATE TYPE "FixtureStatus" AS ENUM ('SCHEDULED', 'LIVE', 'HALF_TIME', 'FINISHED', 'POSTPONED', 'CANCELLED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "FixtureSource" AS ENUM ('OPENFOOTBALL', 'WORLDCUP26', 'MANUAL');

-- CreateTable
CREATE TABLE "Fixture" (
    "id" TEXT NOT NULL,
    "tournamentYear" INTEGER NOT NULL,
    "source" "FixtureSource" NOT NULL,
    "sourceId" TEXT,
    "matchNumber" INTEGER,
    "round" TEXT,
    "stage" TEXT,
    "groupName" TEXT,
    "kickoffAtUtc" TIMESTAMP(3),
    "kickoffDateLabel" TEXT,
    "kickoffTimeLabel" TEXT,
    "venueTimeZone" TEXT,
    "homeTeamName" TEXT,
    "awayTeamName" TEXT,
    "homeTeamSlug" TEXT,
    "awayTeamSlug" TEXT,
    "homeTeamCode" TEXT,
    "awayTeamCode" TEXT,
    "homeTeamFlag" TEXT,
    "awayTeamFlag" TEXT,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "homePenaltyScore" INTEGER,
    "awayPenaltyScore" INTEGER,
    "status" "FixtureStatus" NOT NULL DEFAULT 'UNKNOWN',
    "venueName" TEXT,
    "cityName" TEXT,
    "countryName" TEXT,
    "sourcePriority" INTEGER NOT NULL DEFAULT 100,
    "sourceUpdatedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fixture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixtureSyncLog" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "recordsFetched" INTEGER NOT NULL DEFAULT 0,
    "recordsUpserted" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FixtureSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Fixture_tournamentYear_idx" ON "Fixture"("tournamentYear");

-- CreateIndex
CREATE INDEX "Fixture_kickoffAtUtc_idx" ON "Fixture"("kickoffAtUtc");

-- CreateIndex
CREATE INDEX "Fixture_status_idx" ON "Fixture"("status");

-- CreateIndex
CREATE INDEX "Fixture_groupName_idx" ON "Fixture"("groupName");

-- CreateIndex
CREATE INDEX "Fixture_stage_idx" ON "Fixture"("stage");

-- CreateIndex
CREATE INDEX "Fixture_homeTeamSlug_idx" ON "Fixture"("homeTeamSlug");

-- CreateIndex
CREATE INDEX "Fixture_awayTeamSlug_idx" ON "Fixture"("awayTeamSlug");

-- CreateIndex
CREATE UNIQUE INDEX "Fixture_source_sourceId_key" ON "Fixture"("source", "sourceId");

-- CreateIndex
CREATE INDEX "FixtureSyncLog_provider_idx" ON "FixtureSyncLog"("provider");

-- CreateIndex
CREATE INDEX "FixtureSyncLog_status_idx" ON "FixtureSyncLog"("status");

-- CreateIndex
CREATE INDEX "FixtureSyncLog_startedAt_idx" ON "FixtureSyncLog"("startedAt");
