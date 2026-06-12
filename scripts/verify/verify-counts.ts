// Import verification — checks imported core data (Checkpoint 4B) and event
// data (Checkpoint 4C) integrity against the cached source files.
// See docs/DATA_MODEL.md (verification strategy).
// Exits non-zero only if a critical check fails; sample checks are soft.

import "dotenv/config";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { FJELSTUL_DATASETS } from "../../src/server/import/source-manifest";
import { createScriptPrismaClient } from "../import/utils/db";

type Check = {
  name: string;
  passed: boolean;
  detail: string;
  critical: boolean;
};

const checks: Check[] = [];

function check(
  name: string,
  passed: boolean,
  detail: string,
  critical = true,
): void {
  checks.push({ name, passed, detail, critical });
}

/** True when the dataset's CSV is present in the local cache. */
function sourceFileExists(key: string): boolean {
  const dataset = FJELSTUL_DATASETS.find((d) => d.key === key);
  return dataset !== undefined && existsSync(path.resolve(dataset.localPath));
}

/** Years present in the cached source tournaments.csv (empty if not cached). */
function sourceTournamentYears(): number[] {
  const dataset = FJELSTUL_DATASETS.find((d) => d.key === "tournaments");
  if (dataset === undefined) return [];
  const filePath = path.resolve(dataset.localPath);
  if (!existsSync(filePath)) return [];
  const rows = parse(readFileSync(filePath, "utf8"), {
    columns: true,
    bom: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];
  return rows
    .map((row) => Number(row.year))
    .filter((year) => Number.isInteger(year))
    .sort((a, b) => a - b);
}

async function main() {
  console.log("WORLDCUP Nexus — data verification (core + events)\n");
  const prisma = createScriptPrismaClient();

  try {
    const [
      tournaments,
      countries,
      teams,
      players,
      stadiums,
      referees,
      matches,
      squadPlayers,
      rawRows,
    ] = await Promise.all([
      prisma.tournament.count(),
      prisma.country.count(),
      prisma.team.count(),
      prisma.player.count(),
      prisma.stadium.count(),
      prisma.referee.count(),
      prisma.match.count(),
      prisma.squadPlayer.count(),
      prisma.rawSourceRecord.count(),
    ]);
    const [goals, bookings, substitutions, penaltyKicks, awards] =
      await Promise.all([
        prisma.goal.count(),
        prisma.booking.count(),
        prisma.substitution.count(),
        prisma.penaltyKick.count(),
        prisma.award.count(),
      ]);

    console.log("Row counts");
    console.log(`  tournaments:   ${tournaments}`);
    console.log(`  countries:     ${countries}`);
    console.log(`  teams:         ${teams}`);
    console.log(`  players:       ${players}`);
    console.log(`  stadiums:      ${stadiums}`);
    console.log(`  referees:      ${referees}`);
    console.log(`  matches:       ${matches}`);
    console.log(`  squad players: ${squadPlayers}`);
    console.log(`  goals:         ${goals}`);
    console.log(`  bookings:      ${bookings}`);
    console.log(`  substitutions: ${substitutions}`);
    console.log(`  penalty kicks: ${penaltyKicks}`);
    console.log(`  awards:        ${awards}`);
    console.log(`  raw records:   ${rawRows}\n`);

    check("tournaments imported", tournaments > 0, `${tournaments} rows`);
    check("countries imported", countries > 0, `${countries} rows`);
    check("teams imported", teams > 0, `${teams} rows`);
    check("players imported", players > 0, `${players} rows`);
    check("matches imported", matches > 0, `${matches} rows`);

    // Every tournament year present in the cached source must exist in the DB.
    const sourceYears = sourceTournamentYears();
    if (sourceYears.length === 0) {
      check(
        "source tournament years",
        false,
        "tournaments.csv not cached — run pnpm data:download",
        false,
      );
    } else {
      const dbYears = new Set(
        (await prisma.tournament.findMany({ select: { year: true } })).map(
          (t) => t.year,
        ),
      );
      const missingYears = sourceYears.filter((year) => !dbYears.has(year));
      check(
        "all source tournament years in DB",
        missingYears.length === 0,
        missingYears.length === 0
          ? `${sourceYears.length} years matched`
          : `missing: ${missingYears.join(", ")}`,
      );
      for (const year of [1986, 2022]) {
        if (sourceYears.includes(year)) {
          const found = await prisma.tournament.findUnique({ where: { year } });
          check(
            `${year} tournament exists`,
            found !== null,
            found?.name ?? "not found in DB",
          );
        }
      }
    }

    // Relation integrity (join-based checks; FKs back these up at the DB level).
    const matchesWithBothTeams = await prisma.match.count({
      where: {
        homeTeam: { name: { not: "" } },
        awayTeam: { name: { not: "" } },
      },
    });
    check(
      "at least one match has both teams",
      matchesWithBothTeams > 0,
      `${matchesWithBothTeams} matches`,
    );
    check(
      "no match missing home/away team",
      matchesWithBothTeams === matches,
      `${matchesWithBothTeams}/${matches} matches resolve both teams`,
    );

    const selfPlayMatches = await prisma.match.findMany({
      select: { sourceId: true, homeTeamId: true, awayTeamId: true },
    });
    const selfPlay = selfPlayMatches.filter(
      (m) => m.homeTeamId === m.awayTeamId,
    );
    check(
      "no match where a team plays itself",
      selfPlay.length === 0,
      `${selfPlay.length} offending matches`,
    );

    const teamsWithTournament = await prisma.team.count({
      where: { tournament: { year: { gt: 0 } } },
    });
    check(
      "no team without a tournament",
      teamsWithTournament === teams,
      `${teamsWithTournament}/${teams} teams resolve a tournament`,
    );

    const squadPlayersResolved = await prisma.squadPlayer.count({
      where: {
        tournament: { year: { gt: 0 } },
        team: { name: { not: "" } },
        player: { name: { not: "" } },
      },
    });
    check(
      "no squad player without tournament/team/player",
      squadPlayersResolved === squadPlayers,
      `${squadPlayersResolved}/${squadPlayers} squad entries resolve all relations`,
    );

    // ---- Event checks (Checkpoint 4C). Count checks are gated on the
    // corresponding source CSV being cached. ----
    const eventCounts: { name: string; count: number; sourceKey: string }[] = [
      { name: "goals", count: goals, sourceKey: "goals" },
      { name: "bookings", count: bookings, sourceKey: "bookings" },
      {
        name: "substitutions",
        count: substitutions,
        sourceKey: "substitutions",
      },
      {
        name: "penalty kicks",
        count: penaltyKicks,
        sourceKey: "penalty_kicks",
      },
      { name: "awards", count: awards, sourceKey: "award_winners" },
    ];
    for (const { name, count, sourceKey } of eventCounts) {
      if (sourceFileExists(sourceKey)) {
        check(`${name} imported`, count > 0, `${count} rows`);
      } else {
        check(
          `${name} imported`,
          false,
          `${sourceKey}.csv not cached — run pnpm data:download`,
          false,
        );
      }
    }

    const goalsResolved = await prisma.goal.count({
      where: {
        match: { stage: { not: "" } },
        team: { name: { not: "" } },
        player: { name: { not: "" } },
      },
    });
    check(
      "every goal has match/team/player",
      goalsResolved === goals,
      `${goalsResolved}/${goals} goals resolve all relations`,
    );

    const bookingsResolved = await prisma.booking.count({
      where: {
        match: { stage: { not: "" } },
        team: { name: { not: "" } },
        player: { name: { not: "" } },
      },
    });
    check(
      "every booking has match/team/player",
      bookingsResolved === bookings,
      `${bookingsResolved}/${bookings} bookings resolve all relations`,
    );

    const substitutionsResolved = await prisma.substitution.count({
      where: { match: { stage: { not: "" } }, team: { name: { not: "" } } },
    });
    check(
      "every substitution has match/team",
      substitutionsResolved === substitutions,
      `${substitutionsResolved}/${substitutions} substitutions resolve match and team`,
    );

    const penaltyKicksResolved = await prisma.penaltyKick.count({
      where: { match: { stage: { not: "" } }, team: { name: { not: "" } } },
    });
    check(
      "every penalty kick has match/team",
      penaltyKicksResolved === penaltyKicks,
      `${penaltyKicksResolved}/${penaltyKicks} penalty kicks resolve match and team`,
    );

    const awardsResolved = await prisma.award.count({
      where: { tournament: { year: { gt: 0 } } },
    });
    check(
      "every award has a tournament",
      awardsResolved === awards,
      `${awardsResolved}/${awards} awards resolve a tournament`,
    );

    const matchesWithEvents = await prisma.match.count({
      where: { goals: { some: {} } },
    });
    check(
      "at least one match has event rows",
      matchesWithEvents > 0,
      `${matchesWithEvents} matches have goals`,
    );

    const playersWithGoals = await prisma.player.count({
      where: { goals: { some: {} } },
    });
    check(
      "at least one player has goals",
      playersWithGoals > 0,
      `${playersWithGoals} players have goals`,
    );

    const shootoutMatches = await prisma.match.count({
      where: { decidedByPenalties: true },
    });
    if (shootoutMatches > 0) {
      const shootoutMatchesWithKicks = await prisma.match.count({
        where: {
          decidedByPenalties: true,
          penaltyKicks: { some: { type: "SHOOTOUT" } },
        },
      });
      check(
        "matches decided by penalties have shootout kicks",
        shootoutMatchesWithKicks > 0,
        `${shootoutMatchesWithKicks}/${shootoutMatches} shootout matches have kick rows`,
      );
      if (shootoutMatchesWithKicks < shootoutMatches) {
        check(
          "all shootout matches have kick rows",
          false,
          `${shootoutMatches - shootoutMatchesWithKicks} shootout match(es) missing kick rows`,
          false,
        );
      }
    }

    // ---- Soft sample checks (warnings only — source naming may vary). ----
    const t1986 = await prisma.tournament.findUnique({ where: { year: 1986 } });
    if (t1986 !== null) {
      const final1986 = await prisma.match.findFirst({
        where: { tournamentId: t1986.id, stage: "final" },
        select: { id: true, slug: true },
      });
      if (final1986 === null) {
        check(
          "1986 final has goal events",
          false,
          "1986 final match not found by stage name",
          false,
        );
      } else {
        const finalGoals = await prisma.goal.count({
          where: { matchId: final1986.id },
        });
        check(
          "1986 final has goal events",
          finalGoals > 0,
          `${finalGoals} goals in ${final1986.slug}`,
          false,
        );
      }
    }
    const t2022 = await prisma.tournament.findUnique({ where: { year: 2022 } });
    if (t2022 !== null) {
      const final2022 = await prisma.match.findFirst({
        where: { tournamentId: t2022.id, stage: "final" },
        select: { id: true, slug: true, decidedByPenalties: true },
      });
      if (final2022 === null) {
        check(
          "2022 final has penalty kick rows",
          false,
          "2022 final match not found by stage name",
          false,
        );
      } else {
        const finalKicks = await prisma.penaltyKick.count({
          where: { matchId: final2022.id },
        });
        check(
          "2022 final has penalty kick rows",
          finalKicks > 0,
          `${finalKicks} penalty kicks in ${final2022.slug} (decidedByPenalties=${final2022.decidedByPenalties})`,
          false,
        );
      }
    }

    console.log("Checks");
    let criticalFailures = 0;
    for (const { name, passed, detail, critical } of checks) {
      const symbol = passed ? "PASS" : critical ? "FAIL" : "WARN";
      if (!passed && critical) criticalFailures += 1;
      console.log(`  [${symbol}] ${name} — ${detail}`);
    }

    if (criticalFailures > 0) {
      console.error(`\n${criticalFailures} critical check(s) failed.`);
      process.exitCode = 1;
    } else {
      console.log("\nAll critical checks passed.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(
    "\nVerification failed:",
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
});
