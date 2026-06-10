// Deletes normalized imported data in safe dependency order (children first).
// Never drops tables, never runs migrations.

import type { ScriptPrismaClient } from "./db";

export async function resetNormalizedData(
  prisma: ScriptPrismaClient,
): Promise<void> {
  // Event tables first (empty until Checkpoint 4C, but kept here so reset
  // stays correct once they are populated).
  await prisma.goal.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.substitution.deleteMany();
  await prisma.penaltyKick.deleteMany();
  await prisma.award.deleteMany();

  await prisma.squadPlayer.deleteMany();
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.player.deleteMany();
  await prisma.stadium.deleteMany();
  await prisma.referee.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.country.deleteMany();
}
