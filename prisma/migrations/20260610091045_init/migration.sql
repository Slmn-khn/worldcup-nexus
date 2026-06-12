-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('YELLOW', 'SECOND_YELLOW', 'RED');

-- CreateEnum
CREATE TYPE "PenaltyKickType" AS ENUM ('IN_MATCH', 'SHOOTOUT');

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "year" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "hostName" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "teamsCount" INTEGER,
    "matchesCount" INTEGER,
    "goalsCount" INTEGER,
    "winnerTeamId" TEXT,
    "runnerUpTeamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT,
    "fifaCode" TEXT,
    "flagEmoji" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "tournamentId" TEXT NOT NULL,
    "countryId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "countryId" TEXT,
    "position" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stadium" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stadium_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referee" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "tournamentId" TEXT NOT NULL,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "winningTeamId" TEXT,
    "slug" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "matchDate" TIMESTAMP(3),
    "matchNumber" INTEGER,
    "stadiumId" TEXT,
    "refereeId" TEXT,
    "attendance" INTEGER,
    "homeScore" INTEGER NOT NULL DEFAULT 0,
    "awayScore" INTEGER NOT NULL DEFAULT 0,
    "homeScorePenalties" INTEGER,
    "awayScorePenalties" INTEGER,
    "decidedByPenalties" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SquadPlayer" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "shirtNumber" INTEGER,
    "position" TEXT,
    "isCaptain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SquadPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "matchId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "assistPlayerId" TEXT,
    "minute" INTEGER,
    "stoppageMinute" INTEGER,
    "isOwnGoal" BOOLEAN NOT NULL DEFAULT false,
    "isPenalty" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "matchId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "cardType" "CardType" NOT NULL,
    "minute" INTEGER,
    "stoppageMinute" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Substitution" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "matchId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "playerInId" TEXT,
    "playerOutId" TEXT,
    "minute" INTEGER,
    "stoppageMinute" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Substitution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PenaltyKick" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "matchId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "playerId" TEXT,
    "type" "PenaltyKickType" NOT NULL,
    "order" INTEGER,
    "minute" INTEGER,
    "stoppageMinute" INTEGER,
    "converted" BOOLEAN NOT NULL,
    "isSaved" BOOLEAN,
    "isMissed" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PenaltyKick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Award" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "tournamentId" TEXT NOT NULL,
    "playerId" TEXT,
    "teamId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawSourceRecord" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "sourceId" TEXT,
    "payload" JSONB NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawSourceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_sourceId_key" ON "Tournament"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_year_key" ON "Tournament"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_slug_key" ON "Tournament"("slug");

-- CreateIndex
CREATE INDEX "Tournament_year_idx" ON "Tournament"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Country_sourceId_key" ON "Country"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Country_slug_key" ON "Country"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Team_sourceId_key" ON "Team"("sourceId");

-- CreateIndex
CREATE INDEX "Team_countryId_idx" ON "Team"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_tournamentId_slug_key" ON "Team"("tournamentId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Player_sourceId_key" ON "Player"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_slug_key" ON "Player"("slug");

-- CreateIndex
CREATE INDEX "Player_countryId_idx" ON "Player"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "Stadium_sourceId_key" ON "Stadium"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Stadium_slug_key" ON "Stadium"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Referee_sourceId_key" ON "Referee"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Referee_slug_key" ON "Referee"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Match_sourceId_key" ON "Match"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_slug_key" ON "Match"("slug");

-- CreateIndex
CREATE INDEX "Match_tournamentId_idx" ON "Match"("tournamentId");

-- CreateIndex
CREATE INDEX "Match_homeTeamId_idx" ON "Match"("homeTeamId");

-- CreateIndex
CREATE INDEX "Match_awayTeamId_idx" ON "Match"("awayTeamId");

-- CreateIndex
CREATE INDEX "Match_stage_idx" ON "Match"("stage");

-- CreateIndex
CREATE INDEX "Match_matchDate_idx" ON "Match"("matchDate");

-- CreateIndex
CREATE INDEX "SquadPlayer_teamId_idx" ON "SquadPlayer"("teamId");

-- CreateIndex
CREATE INDEX "SquadPlayer_playerId_idx" ON "SquadPlayer"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "SquadPlayer_tournamentId_teamId_playerId_key" ON "SquadPlayer"("tournamentId", "teamId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "Goal_sourceId_key" ON "Goal"("sourceId");

-- CreateIndex
CREATE INDEX "Goal_matchId_idx" ON "Goal"("matchId");

-- CreateIndex
CREATE INDEX "Goal_teamId_idx" ON "Goal"("teamId");

-- CreateIndex
CREATE INDEX "Goal_playerId_idx" ON "Goal"("playerId");

-- CreateIndex
CREATE INDEX "Goal_assistPlayerId_idx" ON "Goal"("assistPlayerId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_sourceId_key" ON "Booking"("sourceId");

-- CreateIndex
CREATE INDEX "Booking_matchId_idx" ON "Booking"("matchId");

-- CreateIndex
CREATE INDEX "Booking_teamId_idx" ON "Booking"("teamId");

-- CreateIndex
CREATE INDEX "Booking_playerId_idx" ON "Booking"("playerId");

-- CreateIndex
CREATE INDEX "Booking_cardType_idx" ON "Booking"("cardType");

-- CreateIndex
CREATE UNIQUE INDEX "Substitution_sourceId_key" ON "Substitution"("sourceId");

-- CreateIndex
CREATE INDEX "Substitution_matchId_idx" ON "Substitution"("matchId");

-- CreateIndex
CREATE INDEX "Substitution_teamId_idx" ON "Substitution"("teamId");

-- CreateIndex
CREATE INDEX "Substitution_playerInId_idx" ON "Substitution"("playerInId");

-- CreateIndex
CREATE INDEX "Substitution_playerOutId_idx" ON "Substitution"("playerOutId");

-- CreateIndex
CREATE UNIQUE INDEX "PenaltyKick_sourceId_key" ON "PenaltyKick"("sourceId");

-- CreateIndex
CREATE INDEX "PenaltyKick_matchId_idx" ON "PenaltyKick"("matchId");

-- CreateIndex
CREATE INDEX "PenaltyKick_teamId_idx" ON "PenaltyKick"("teamId");

-- CreateIndex
CREATE INDEX "PenaltyKick_playerId_idx" ON "PenaltyKick"("playerId");

-- CreateIndex
CREATE INDEX "PenaltyKick_type_idx" ON "PenaltyKick"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Award_sourceId_key" ON "Award"("sourceId");

-- CreateIndex
CREATE INDEX "Award_tournamentId_idx" ON "Award"("tournamentId");

-- CreateIndex
CREATE INDEX "Award_playerId_idx" ON "Award"("playerId");

-- CreateIndex
CREATE INDEX "Award_teamId_idx" ON "Award"("teamId");

-- CreateIndex
CREATE INDEX "RawSourceRecord_source_entityType_idx" ON "RawSourceRecord"("source", "entityType");

-- CreateIndex
CREATE INDEX "RawSourceRecord_sourceId_idx" ON "RawSourceRecord"("sourceId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winningTeamId_fkey" FOREIGN KEY ("winningTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_stadiumId_fkey" FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "Referee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadPlayer" ADD CONSTRAINT "SquadPlayer_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadPlayer" ADD CONSTRAINT "SquadPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadPlayer" ADD CONSTRAINT "SquadPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_assistPlayerId_fkey" FOREIGN KEY ("assistPlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Substitution" ADD CONSTRAINT "Substitution_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Substitution" ADD CONSTRAINT "Substitution_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Substitution" ADD CONSTRAINT "Substitution_playerInId_fkey" FOREIGN KEY ("playerInId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Substitution" ADD CONSTRAINT "Substitution_playerOutId_fkey" FOREIGN KEY ("playerOutId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PenaltyKick" ADD CONSTRAINT "PenaltyKick_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PenaltyKick" ADD CONSTRAINT "PenaltyKick_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PenaltyKick" ADD CONSTRAINT "PenaltyKick_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
