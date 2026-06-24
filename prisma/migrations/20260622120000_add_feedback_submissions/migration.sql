-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('BUG_REPORT', 'INCORRECT_DATA', 'FEATURE_REQUEST', 'DESIGN_FEEDBACK', 'MISSING_DATA', 'SCHEDULE_ISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('PENDING', 'REVIEWED', 'PLANNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'SPAM');

-- CreateEnum
CREATE TYPE "FeedbackPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "FeedbackSubmission" (
    "id" TEXT NOT NULL,
    "type" "FeedbackType" NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "FeedbackPriority" NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "pageUrl" TEXT,
    "tournamentYear" INTEGER,
    "countryName" TEXT,
    "playerName" TEXT,
    "matchLabel" TEXT,
    "email" TEXT,
    "name" TEXT,
    "ipHash" TEXT,
    "userAgentHash" TEXT,
    "fingerprintHash" TEXT,
    "turnstileSuccess" BOOLEAN NOT NULL DEFAULT false,
    "spamScore" INTEGER NOT NULL DEFAULT 0,
    "spamReasons" JSONB,
    "duplicateHash" TEXT,
    "duplicateOfId" TEXT,
    "adminNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedbackSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackEvent" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeedbackSubmission_type_idx" ON "FeedbackSubmission"("type");

-- CreateIndex
CREATE INDEX "FeedbackSubmission_status_idx" ON "FeedbackSubmission"("status");

-- CreateIndex
CREATE INDEX "FeedbackSubmission_priority_idx" ON "FeedbackSubmission"("priority");

-- CreateIndex
CREATE INDEX "FeedbackSubmission_createdAt_idx" ON "FeedbackSubmission"("createdAt");

-- CreateIndex
CREATE INDEX "FeedbackSubmission_duplicateHash_idx" ON "FeedbackSubmission"("duplicateHash");

-- CreateIndex
CREATE INDEX "FeedbackEvent_feedbackId_idx" ON "FeedbackEvent"("feedbackId");

-- CreateIndex
CREATE INDEX "FeedbackEvent_action_idx" ON "FeedbackEvent"("action");

-- CreateIndex
CREATE INDEX "FeedbackEvent_createdAt_idx" ON "FeedbackEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "FeedbackEvent" ADD CONSTRAINT "FeedbackEvent_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "FeedbackSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
