// Fjelstul import pipeline — core data (Checkpoint 4B) + events (Checkpoint 4C).
// Source: Fjelstul World Cup Database, jfjelstul/worldcup (GitHub), CC BY 4.0.
// See docs/DATA_SOURCES.md for attribution and docs/DATA_MODEL.md for design.
//
// Imports: RawSourceRecord, Tournament, Country, Team, Stadium, Referee,
// Player, Match, SquadPlayer, then events: Goal, Booking, Substitution,
// PenaltyKick, Award.
//
// Reads ONLY cached CSVs from data/sources/fjelstul/raw — never downloads.
// Never drops tables, never runs migrations.
//
// Usage:
//   pnpm data:import              # upserts (repeatable)
//   pnpm data:import -- --reset   # clears normalized data first, then imports

import "dotenv/config";

import { FJELSTUL_DATASETS } from "../../src/server/import/source-manifest";
import {
  importAwards,
  importBookings,
  importGoals,
  importPenaltyKicks,
  importSubstitutions,
  type ImportReporter,
} from "./loaders/events";
import {
  EVENT_REQUIRED_COLUMNS,
  type EventResolveContext,
} from "./mappers/events";
import { chunk, forEachLimit, readDataset, type RawRow } from "./utils/csv";
import { createScriptPrismaClient } from "./utils/db";
import { dedupeRows } from "./utils/dedupe";
import {
  REQUIRED_COLUMNS,
  mapCountry,
  mapMatch,
  mapPlayer,
  mapReferee,
  mapSquadPlayer,
  mapStadium,
  mapTeam,
  mapTournament,
} from "./utils/mappers";
import { writeImportSummary } from "./utils/report";
import { resetNormalizedData } from "./utils/reset";
import { SlugRegistry } from "./utils/slug";
import { cleanString } from "./utils/values";

const SOURCE = "fjelstul-worldcup";
const RESET = process.argv.includes("--reset");
const UPSERT_CONCURRENCY = 8;
const CREATE_MANY_CHUNK = 500;

/** Datasets normalized by this pipeline, in import order. */
const SELECTED_KEYS = [
  "tournaments",
  "teams",
  "players",
  "stadiums",
  "referees",
  "qualified_teams",
  "matches",
  "squads",
  "goals",
  "bookings",
  "substitutions",
  "penalty_kicks",
  "award_winners",
] as const;

type DatasetKey = (typeof SELECTED_KEYS)[number];

const ALL_REQUIRED_COLUMNS: Record<string, string[]> = {
  ...REQUIRED_COLUMNS,
  ...EVENT_REQUIRED_COLUMNS,
};

/** sourceId stored on each RawSourceRecord, per dataset. */
const RAW_SOURCE_ID: Record<DatasetKey, (row: RawRow) => string | null> = {
  tournaments: (row) => cleanString(row.tournament_id),
  teams: (row) => cleanString(row.team_id),
  players: (row) => cleanString(row.player_id),
  stadiums: (row) => cleanString(row.stadium_id),
  referees: (row) => cleanString(row.referee_id),
  qualified_teams: (row) => `${row.tournament_id}:${row.team_id}`,
  matches: (row) => cleanString(row.match_id),
  squads: (row) => `${row.tournament_id}:${row.team_id}:${row.player_id}`,
  goals: (row) => cleanString(row.goal_id),
  bookings: (row) => cleanString(row.booking_id),
  substitutions: (row) => cleanString(row.substitution_id),
  penalty_kicks: (row) => cleanString(row.penalty_kick_id),
  award_winners: (row) =>
    `${row.tournament_id}:${row.award_id}:${row.player_id}`,
};

const counts: Record<string, number> = {
  rawRows: 0,
  tournaments: 0,
  countries: 0,
  teams: 0,
  stadiums: 0,
  referees: 0,
  players: 0,
  matches: 0,
  squadPlayers: 0,
  goals: 0,
  bookings: 0,
  substitutions: 0,
  penaltyKicks: 0,
  awards: 0,
};
const skippedByDataset: Record<string, number> = {};
const warnings: string[] = [];

function warn(message: string): void {
  warnings.push(message);
  if (warnings.length <= 25) console.warn(`  warning: ${message}`);
  if (warnings.length === 26)
    console.warn("  (further warnings collected in the JSON report)");
}

function skipRow(dataset: string, reason: string): void {
  skippedByDataset[dataset] = (skippedByDataset[dataset] ?? 0) + 1;
  warn(`${dataset}: skipped row — ${reason}`);
}

function dedupe(
  dataset: string,
  rows: RawRow[],
  keyOf: (row: RawRow) => string | null,
): RawRow[] {
  return dedupeRows(dataset, rows, keyOf, skipRow);
}

async function main() {
  console.log(`WorldCup Atlas — Fjelstul import, core + events (source: ${SOURCE})`);
  console.log(
    RESET
      ? "Mode: --reset (clear normalized data, then import)\n"
      : "Mode: upsert\n",
  );

  // ---- Load and validate all cached CSVs up front (fail fast). ----
  const datasetsByKey = new Map(FJELSTUL_DATASETS.map((d) => [d.key, d]));
  const rowsByKey = {} as Record<DatasetKey, RawRow[]>;
  for (const key of SELECTED_KEYS) {
    const dataset = datasetsByKey.get(key);
    if (dataset === undefined)
      throw new Error(`Dataset ${key} missing from source manifest.`);
    rowsByKey[key] = readDataset(dataset, ALL_REQUIRED_COLUMNS[key]);
    console.log(`  loaded ${key}: ${rowsByKey[key].length} rows`);
  }
  console.log("");

  const prisma = createScriptPrismaClient();
  try {
    if (RESET) {
      console.log(
        "Resetting normalized data (dependency order, no table drops)...",
      );
      await resetNormalizedData(prisma, { rawRecordSource: SOURCE });
    }

    // ---- 1. RawSourceRecord (verbatim copies, repeatable per entityType). ----
    console.log("Importing raw source records...");
    for (const key of SELECTED_KEYS) {
      await prisma.rawSourceRecord.deleteMany({
        where: { source: SOURCE, entityType: key },
      });
      for (const batch of chunk(rowsByKey[key], CREATE_MANY_CHUNK)) {
        const created = await prisma.rawSourceRecord.createMany({
          data: batch.map((row) => ({
            source: SOURCE,
            entityType: key,
            sourceId: RAW_SOURCE_ID[key](row),
            payload: row,
          })),
        });
        counts.rawRows += created.count;
      }
    }
    console.log(`  raw rows inserted: ${counts.rawRows}\n`);

    // ---- 2. Tournaments. ----
    console.log("Importing tournaments...");
    const tournamentRows = dedupe("tournaments", rowsByKey.tournaments, (r) =>
      cleanString(r.tournament_id),
    );
    const tournamentIdBySource = new Map<string, string>();
    for (const row of tournamentRows) {
      const data = mapTournament(row);
      const record = await prisma.tournament.upsert({
        where: { sourceId: data.sourceId ?? undefined },
        update: data,
        create: data,
      });
      tournamentIdBySource.set(data.sourceId as string, record.id);
      counts.tournaments += 1;
    }

    // ---- 3. Countries (derived from the global teams.csv list). ----
    console.log("Importing countries...");
    const countryRows = dedupe("teams", rowsByKey.teams, (r) =>
      cleanString(r.team_id),
    );
    const countryIdBySource = new Map<string, string>();
    for (const row of countryRows) {
      const data = mapCountry(row);
      if (data === null) {
        skipRow("teams", "missing team_id or team_name");
        continue;
      }
      const record = await prisma.country.upsert({
        where: { sourceId: data.sourceId ?? undefined },
        update: data,
        create: data,
      });
      countryIdBySource.set(data.sourceId as string, record.id);
      counts.countries += 1;
    }

    // ---- 4. Teams (one row per tournament participation). ----
    console.log("Importing teams...");
    const teamRows = dedupe(
      "qualified_teams",
      rowsByKey.qualified_teams,
      (r) => `${r.tournament_id}:${r.team_id}`,
    );
    const teamIdBySource = new Map<string, string>();
    for (const row of teamRows) {
      const tournamentSource = cleanString(row.tournament_id);
      const teamSource = cleanString(row.team_id);
      const tournamentDbId =
        tournamentSource !== null
          ? tournamentIdBySource.get(tournamentSource)
          : undefined;
      if (tournamentDbId === undefined) {
        skipRow(
          "qualified_teams",
          `unknown tournament ${tournamentSource ?? "?"}`,
        );
        continue;
      }
      const countryDbId =
        teamSource !== null
          ? (countryIdBySource.get(teamSource) ?? null)
          : null;
      if (countryDbId === null) {
        warn(
          `qualified_teams: no country match for team ${teamSource ?? "?"} (link left empty)`,
        );
      }
      const data = mapTeam(row, tournamentDbId, countryDbId);
      if (data === null) {
        skipRow("qualified_teams", "missing team_id or team_name");
        continue;
      }
      const record = await prisma.team.upsert({
        where: { sourceId: data.sourceId ?? undefined },
        update: data,
        create: data,
      });
      teamIdBySource.set(data.sourceId as string, record.id);
      counts.teams += 1;
    }

    // ---- 5. Stadiums. ----
    console.log("Importing stadiums...");
    const stadiumRows = dedupe("stadiums", rowsByKey.stadiums, (r) =>
      cleanString(r.stadium_id),
    ).sort((a, b) => a.stadium_id.localeCompare(b.stadium_id));
    const stadiumSlugs = new SlugRegistry();
    const stadiumIdBySource = new Map<string, string>();
    for (const row of stadiumRows) {
      const data = mapStadium(row, stadiumSlugs);
      if (data === null) {
        skipRow("stadiums", "missing stadium_id or stadium_name");
        continue;
      }
      const record = await prisma.stadium.upsert({
        where: { sourceId: data.sourceId ?? undefined },
        update: data,
        create: data,
      });
      stadiumIdBySource.set(data.sourceId as string, record.id);
      counts.stadiums += 1;
    }

    // ---- 6. Referees (entities only; match links are not in the selected subset). ----
    console.log("Importing referees...");
    const refereeRows = dedupe("referees", rowsByKey.referees, (r) =>
      cleanString(r.referee_id),
    ).sort((a, b) => a.referee_id.localeCompare(b.referee_id));
    const refereeSlugs = new SlugRegistry();
    for (const row of refereeRows) {
      const data = mapReferee(row, refereeSlugs);
      if (data === null) {
        skipRow("referees", "missing referee_id or name");
        continue;
      }
      await prisma.referee.upsert({
        where: { sourceId: data.sourceId ?? undefined },
        update: data,
        create: data,
      });
      counts.referees += 1;
    }

    // ---- 7. Players (largest dataset; bounded concurrency). ----
    console.log("Importing players...");
    const playerRows = dedupe("players", rowsByKey.players, (r) =>
      cleanString(r.player_id),
    ).sort((a, b) => a.player_id.localeCompare(b.player_id));
    const playerSlugs = new SlugRegistry();
    const playerInputs = playerRows
      .map((row) => {
        const data = mapPlayer(row, playerSlugs);
        if (data === null)
          skipRow("players", `unusable name for ${row.player_id}`);
        return data;
      })
      .filter((data): data is NonNullable<typeof data> => data !== null);
    const playerIdBySource = new Map<string, string>();
    await forEachLimit(playerInputs, UPSERT_CONCURRENCY, async (data) => {
      const record = await prisma.player.upsert({
        where: { sourceId: data.sourceId ?? undefined },
        update: data,
        create: data,
      });
      playerIdBySource.set(data.sourceId as string, record.id);
      counts.players += 1;
    });

    // ---- 8. Matches. ----
    console.log("Importing matches...");
    const matchRows = dedupe("matches", rowsByKey.matches, (r) =>
      cleanString(r.match_id),
    );
    const matchCtx = {
      tournamentIdBySource,
      teamIdBySource,
      stadiumIdBySource,
    };
    const matchCountByTournament = new Map<string, number>();
    const matchBySource = new Map<
      string,
      { id: string; decidedByPenalties: boolean }
    >();
    for (const row of matchRows) {
      const result = mapMatch(row, matchCtx);
      if (!result.ok) {
        skipRow("matches", result.reason);
        continue;
      }
      const record = await prisma.match.upsert({
        where: { sourceId: result.data.sourceId ?? undefined },
        update: result.data,
        create: result.data,
      });
      matchBySource.set(result.data.sourceId as string, {
        id: record.id,
        decidedByPenalties: result.data.decidedByPenalties === true,
      });
      counts.matches += 1;
      matchCountByTournament.set(
        result.data.tournamentId,
        (matchCountByTournament.get(result.data.tournamentId) ?? 0) + 1,
      );
    }

    // ---- 8b. Tournament winner + matches count (source-backed resolution). ----
    console.log("Resolving tournament winners and match counts...");
    for (const row of tournamentRows) {
      const tournamentSource = cleanString(row.tournament_id);
      const tournamentDbId =
        tournamentSource !== null
          ? tournamentIdBySource.get(tournamentSource)
          : undefined;
      if (tournamentSource === null || tournamentDbId === undefined) continue;

      const winnerName = cleanString(row.winner);
      let winnerTeamId: string | null = null;
      if (winnerName !== null) {
        const winnerTeam = await prisma.team.findFirst({
          where: { tournamentId: tournamentDbId, name: winnerName },
          select: { id: true },
        });
        if (winnerTeam === null) {
          warn(
            `tournaments: winner "${winnerName}" not matched to a team in ${tournamentSource}`,
          );
        } else {
          winnerTeamId = winnerTeam.id;
        }
      }
      await prisma.tournament.update({
        where: { id: tournamentDbId },
        data: {
          winnerTeamId,
          matchesCount: matchCountByTournament.get(tournamentDbId) ?? 0,
          // goalsCount and runnerUpTeamId stay null until event data lands (4C).
        },
      });
    }

    // ---- 9. Squad players. ----
    console.log("Importing squad players...");
    const squadRows = dedupe(
      "squads",
      rowsByKey.squads,
      (r) => `${r.tournament_id}:${r.team_id}:${r.player_id}`,
    );
    const squadCtx = { tournamentIdBySource, teamIdBySource, playerIdBySource };
    const squadInputs = squadRows
      .map((row) => {
        const result = mapSquadPlayer(row, squadCtx);
        if (!result.ok) {
          skipRow("squads", result.reason);
          return null;
        }
        return result.data;
      })
      .filter((data): data is NonNullable<typeof data> => data !== null);
    await forEachLimit(squadInputs, UPSERT_CONCURRENCY, async (data) => {
      await prisma.squadPlayer.upsert({
        where: {
          tournamentId_teamId_playerId: {
            tournamentId: data.tournamentId,
            teamId: data.teamId,
            playerId: data.playerId,
          },
        },
        update: data,
        create: data,
      });
      counts.squadPlayers += 1;
    });

    // ---- 10–14. Events (Checkpoint 4C): goals, bookings, substitutions,
    // penalty kicks, awards. ----
    const eventCtx: EventResolveContext = {
      tournamentIdBySource,
      teamIdBySource,
      playerIdBySource,
      matchBySource,
    };
    const reporter: ImportReporter = { warn, skipRow };

    console.log("Importing goals...");
    counts.goals = await importGoals(
      prisma,
      rowsByKey.goals,
      eventCtx,
      reporter,
    );
    console.log("Importing bookings...");
    counts.bookings = await importBookings(
      prisma,
      rowsByKey.bookings,
      eventCtx,
      reporter,
    );
    console.log("Importing substitutions...");
    counts.substitutions = await importSubstitutions(
      prisma,
      rowsByKey.substitutions,
      eventCtx,
      reporter,
    );
    console.log("Importing penalty kicks...");
    counts.penaltyKicks = await importPenaltyKicks(
      prisma,
      rowsByKey.penalty_kicks,
      eventCtx,
      reporter,
    );
    console.log("Importing awards...");
    counts.awards = await importAwards(
      prisma,
      rowsByKey.award_winners,
      eventCtx,
      reporter,
    );

    // ---- 14b. Tournament goals count + runner-up (source-backed resolution). ----
    console.log("Resolving tournament goal counts and runners-up...");
    for (const tournamentDbId of tournamentIdBySource.values()) {
      const goalsCount = await prisma.goal.count({
        where: { match: { tournamentId: tournamentDbId } },
      });

      // Runner-up = the losing finalist of the deciding "final" stage match.
      // Tournaments without a decided final (e.g. 1950's final round group)
      // keep null — derived only, never invented.
      const finals = await prisma.match.findMany({
        where: {
          tournamentId: tournamentDbId,
          stage: "final",
          winningTeamId: { not: null },
        },
        select: { homeTeamId: true, awayTeamId: true, winningTeamId: true },
      });
      let runnerUpTeamId: string | null = null;
      if (finals.length === 1) {
        const final = finals[0];
        runnerUpTeamId =
          final.winningTeamId === final.homeTeamId
            ? final.awayTeamId
            : final.homeTeamId;
      } else if (finals.length > 1) {
        warn(
          `tournaments: ${finals.length} decided finals found for tournament ${tournamentDbId} — runner-up left null`,
        );
      }
      await prisma.tournament.update({
        where: { id: tournamentDbId },
        data: { goalsCount, runnerUpTeamId },
      });
    }

    // ---- Summary. ----
    const totalSkipped = Object.values(skippedByDataset).reduce(
      (sum, n) => sum + n,
      0,
    );
    const summary = {
      importedAt: new Date().toISOString(),
      source: SOURCE,
      counts,
      eventCounts: {
        goals: counts.goals,
        bookings: counts.bookings,
        substitutions: counts.substitutions,
        penaltyKicks: counts.penaltyKicks,
        awards: counts.awards,
      },
      skippedByDataset,
      warnings,
    };
    const reportPath = await writeImportSummary(summary);

    console.log("\nImport summary");
    console.log(`  raw rows inserted:     ${counts.rawRows}`);
    console.log(`  tournaments imported:  ${counts.tournaments}`);
    console.log(`  countries imported:    ${counts.countries}`);
    console.log(`  teams imported:        ${counts.teams}`);
    console.log(`  stadiums imported:     ${counts.stadiums}`);
    console.log(`  referees imported:     ${counts.referees}`);
    console.log(`  players imported:      ${counts.players}`);
    console.log(`  matches imported:      ${counts.matches}`);
    console.log(`  squad players:         ${counts.squadPlayers}`);
    console.log(`  goals imported:        ${counts.goals}`);
    console.log(`  bookings imported:     ${counts.bookings}`);
    console.log(`  substitutions:         ${counts.substitutions}`);
    console.log(`  penalty kicks:         ${counts.penaltyKicks}`);
    console.log(`  awards imported:       ${counts.awards}`);
    console.log(`  skipped rows:          ${totalSkipped}`);
    console.log(`  warnings:              ${warnings.length}`);
    console.log(`\nReport written to ${reportPath}`);
    console.log("Next: pnpm data:verify");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(
    "\nImport failed:",
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
});
