// Checkpoint 4B verification — checks imported core data integrity against
// the cached source files. See docs/DATA_MODEL.md (verification strategy).
// Exits non-zero if any critical check fails.

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
  console.log("WorldCup Atlas — data verification (Checkpoint 4B)\n");
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

    console.log("Row counts");
    console.log(`  tournaments:   ${tournaments}`);
    console.log(`  countries:     ${countries}`);
    console.log(`  teams:         ${teams}`);
    console.log(`  players:       ${players}`);
    console.log(`  stadiums:      ${stadiums}`);
    console.log(`  referees:      ${referees}`);
    console.log(`  matches:       ${matches}`);
    console.log(`  squad players: ${squadPlayers}`);
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
