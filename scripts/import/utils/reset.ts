// Deletes normalized imported data in safe dependency order (children first).
// Never drops tables, never runs migrations.

import type { ScriptPrismaClient } from "./db";

export async function resetNormalizedData(
  prisma: ScriptPrismaClient,
  options: { rawRecordSource?: string } = {},
): Promise<void> {
  // Event tables first (children of matches/teams/players).
  await prisma.award.deleteMany();
  await prisma.penaltyKick.deleteMany();
  await prisma.substitution.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.goal.deleteMany();

  await prisma.squadPlayer.deleteMany();
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.player.deleteMany();
  await prisma.stadium.deleteMany();
  await prisma.referee.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.country.deleteMany();

  // Raw source records for this source are re-inserted by the import anyway;
  // clearing them here keeps --reset a true clean slate.
  if (options.rawRecordSource !== undefined) {
    await prisma.rawSourceRecord.deleteMany({
      where: { source: options.rawRecordSource },
    });
  }
}
