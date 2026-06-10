// Checkpoint 4D verification — exercises the page query layer end to end
// against the live database. Exits non-zero only on critical failures;
// naming-dependent sample lookups are soft (warnings).

import "dotenv/config";

import { prisma } from "@/server/db/prisma";
import { getArchiveStats, getHomePageData } from "@/server/queries/home";
import { getCountryCards, getCountryProfile } from "@/server/queries/countries";
import {
  getFinalMatchForTournament,
  getMatchByIdOrSlug,
  getMatchCards,
} from "@/server/queries/matches";
import { getPlayerCards, getPlayerProfile } from "@/server/queries/players";
import { getRecordsOverview } from "@/server/queries/records";
import {
  getTournamentByYear,
  getTournamentCards,
} from "@/server/queries/tournaments";

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

async function main() {
  console.log("WorldCup Atlas — page query verification (Checkpoint 4D)\n");

  // ---- Archive stats. ----
  const stats = await getArchiveStats();
  check(
    "getArchiveStats tournaments > 0",
    stats.tournaments > 0,
    `${stats.tournaments}`,
  );
  check("getArchiveStats matches > 0", stats.matches > 0, `${stats.matches}`);
  check("getArchiveStats players > 0", stats.players > 0, `${stats.players}`);
  check("getArchiveStats goals > 0", stats.goals > 0, `${stats.goals}`);

  // ---- Tournament cards + details. ----
  const cards = await getTournamentCards();
  check(
    "getTournamentCards returns tournaments",
    cards.length > 0,
    `${cards.length} cards`,
  );

  for (const year of [1986, 2022]) {
    if (!cards.some((card) => card.year === year)) {
      check(
        `getTournamentByYear(${year})`,
        false,
        `${year} not in database — skipped`,
        false,
      );
      continue;
    }
    const detail = await getTournamentByYear(year);
    check(
      `getTournamentByYear(${year})`,
      detail !== null && detail.matches.length > 0 && detail.teams.length > 0,
      detail !== null
        ? `${detail.name}: ${detail.teams.length} teams, ${detail.matches.length} matches, ` +
            `${detail.topScorers.length} top scorers, ${detail.awards.length} awards, ` +
            `winner ${detail.winner ?? "?"}, final ${detail.finalScore ?? "n/a"}`
        : "returned null",
    );
  }

  // ---- Country cards (critical). ----
  const countryCards = await getCountryCards();
  check(
    "getCountryCards returns countries",
    countryCards.length > 0,
    `${countryCards.length} countries`,
  );

  // ---- Country profiles (find by slug, then name — soft on naming). ----
  for (const countryName of ["Brazil", "Argentina"]) {
    const found = await prisma.country.findFirst({
      where: {
        OR: [
          { slug: countryName.toLowerCase() },
          { name: { equals: countryName, mode: "insensitive" } },
        ],
      },
      select: { slug: true },
    });
    if (found === null) {
      check(
        `getCountryProfile(${countryName})`,
        false,
        `${countryName} not found by slug or name`,
        false,
      );
      continue;
    }
    const profile = await getCountryProfile(found.slug);
    check(
      `getCountryProfile(${countryName})`,
      profile !== null &&
        profile.participations.length > 0 &&
        profile.matches.length > 0 &&
        profile.totals.matchesPlayed > 0 &&
        profile.totals.goalsFor > 0,
      profile !== null
        ? `${profile.name} (${found.slug}): ${profile.totals.tournamentsEntered} tournaments, ` +
            `${profile.totals.titles} titles, ${profile.totals.finalsPlayed} finals ` +
            `(${profile.totals.finalsWon} won), ${profile.totals.matchesPlayed} matches ` +
            `(${profile.totals.wins}W ${profile.totals.draws}D ${profile.totals.losses}L), ` +
            `${profile.totals.goalsFor}:${profile.totals.goalsAgainst} goals, ` +
            `${profile.topScorers.length} top scorers`
        : "returned null",
    );
    if (profile !== null && profile.topScorers.length === 0) {
      check(
        `${countryName} has top scorers`,
        false,
        "no goal data resolved",
        false,
      );
    }
  }

  // ---- Player cards (critical). ----
  const playerCards = await getPlayerCards({ take: 5 });
  check(
    "getPlayerCards returns players",
    playerCards.length > 0,
    `${playerCards.length} players (take 5)`,
  );

  // ---- Player profile (find Maradona by name, then use real slug). ----
  const maradona = await prisma.player.findFirst({
    where: { name: { contains: "Maradona", mode: "insensitive" } },
    select: { slug: true, name: true },
    orderBy: { slug: "asc" },
  });
  if (maradona === null) {
    check(
      "getPlayerProfile(Maradona)",
      false,
      "no player matching 'Maradona' found",
      false,
    );
  } else {
    const profile = await getPlayerProfile(maradona.slug);
    check(
      "getPlayerProfile(Maradona)",
      profile !== null &&
        profile.squadTournaments.length > 0 &&
        profile.goals.length > 0,
      profile !== null
        ? `${profile.name} (${maradona.slug}): ${profile.totals.selectedTournaments} squad tournaments, ` +
            `${profile.totals.goals} goals, ${profile.totals.bookings} cards, ` +
            `${profile.substitutions.length} substitutions, ${profile.totals.awards} awards`
        : "returned null",
    );
  }

  // ---- Players with each record type resolve with that data (critical if such a player exists). ----
  const playerDataChecks: {
    name: string;
    where: object;
    count: (
      profile: NonNullable<Awaited<ReturnType<typeof getPlayerProfile>>>,
    ) => number;
  }[] = [
    {
      name: "goals",
      where: { goals: { some: {} } },
      count: (p) => p.goals.length,
    },
    {
      name: "bookings",
      where: { bookings: { some: {} } },
      count: (p) => p.bookings.length,
    },
    {
      name: "penalty kicks",
      where: { penaltyKicks: { some: {} } },
      count: (p) => p.penaltyKicks.length,
    },
    {
      name: "awards",
      where: { awards: { some: {} } },
      count: (p) => p.awards.length,
    },
  ];
  for (const playerCheck of playerDataChecks) {
    const sample = await prisma.player.findFirst({
      where: playerCheck.where,
      select: { slug: true },
    });
    if (sample === null) {
      check(
        `player with ${playerCheck.name} resolves`,
        false,
        "no such player in database",
        false,
      );
      continue;
    }
    const profile = await getPlayerProfile(sample.slug);
    const count = profile !== null ? playerCheck.count(profile) : 0;
    check(
      `player with ${playerCheck.name} resolves with data`,
      profile !== null && count > 0,
      `${sample.slug}: ${count} ${playerCheck.name}`,
    );
  }

  // ---- 1986 final via the finals helper, then by slug (soft on stage naming). ----
  const t1986 = await prisma.tournament.findUnique({
    where: { year: 1986 },
    select: { id: true },
  });
  if (t1986 === null) {
    check(
      "1986 final resolves",
      false,
      "1986 tournament not in database",
      false,
    );
  } else {
    const finalCard = await getFinalMatchForTournament(t1986.id);
    if (finalCard === null) {
      check(
        "1986 final resolves",
        false,
        "no 'final' stage match found for 1986 (stage naming)",
        false,
      );
    } else {
      const detail = await getMatchByIdOrSlug(finalCard.slug);
      check(
        "getMatchByIdOrSlug(1986 final)",
        detail !== null && detail.goals.length > 0,
        detail !== null
          ? `${detail.homeTeam.name} ${detail.score} ${detail.awayTeam.name} — ` +
              `${detail.goals.length} goals, ${detail.bookings.length} cards, ` +
              `${detail.substitutions.length} sub records, stadium ${detail.stadium?.name ?? "?"}`
          : "returned null",
      );
    }
  }

  // ---- Match cards for the /matches index (critical). ----
  const matchIndex = await getMatchCards({ pageSize: 5 });
  const firstCard = matchIndex.matches[0];
  check(
    "getMatchCards returns matches",
    matchIndex.matches.length > 0 && matchIndex.totalCount > 0,
    `${matchIndex.matches.length} cards (of ${matchIndex.totalCount} total)`,
  );
  if (firstCard !== undefined) {
    check(
      "first match card is complete",
      firstCard.id !== "" &&
        firstCard.slug !== "" &&
        firstCard.homeTeam.name !== "" &&
        firstCard.awayTeam.name !== "" &&
        firstCard.href.startsWith("/matches/"),
      `${firstCard.tournamentYear}: ${firstCard.homeTeam.name} ${firstCard.score} ${firstCard.awayTeam.name} → ${firstCard.href}`,
    );
    const resolved = await getMatchByIdOrSlug(
      firstCard.href.replace("/matches/", ""),
    );
    check(
      "first match card href resolves",
      resolved !== null && resolved.id === firstCard.id,
      resolved !== null ? `resolved ${resolved.slug}` : "returned null",
    );
  }

  // ---- Generic match resolution (critical). ----
  const anyMatch = await prisma.match.findFirst({
    select: { slug: true, id: true },
  });
  if (anyMatch === null) {
    check(
      "getMatchByIdOrSlug resolves a match",
      false,
      "no matches in database",
    );
  } else {
    const bySlug = await getMatchByIdOrSlug(anyMatch.slug);
    const byId = await getMatchByIdOrSlug(anyMatch.id);
    check(
      "getMatchByIdOrSlug resolves a match",
      bySlug !== null && byId !== null,
      `slug ${anyMatch.slug}: ${bySlug !== null ? "ok" : "null"}, id lookup: ${byId !== null ? "ok" : "null"}`,
    );
  }

  // ---- Matches with each event type resolve with their events (critical). ----
  const eventChecks: {
    name: string;
    where: object;
    count: (
      detail: NonNullable<Awaited<ReturnType<typeof getMatchByIdOrSlug>>>,
    ) => number;
  }[] = [
    {
      name: "goals",
      where: { goals: { some: {} } },
      count: (d) => d.goals.length,
    },
    {
      name: "bookings",
      where: { bookings: { some: {} } },
      count: (d) => d.bookings.length,
    },
    {
      name: "substitutions",
      where: { substitutions: { some: {} } },
      count: (d) => d.substitutions.length,
    },
    {
      name: "penalty kicks",
      where: { penaltyKicks: { some: {} } },
      count: (d) => d.penaltyKicks.length,
    },
  ];
  for (const eventCheck of eventChecks) {
    const sample = await prisma.match.findFirst({
      where: eventCheck.where,
      select: { slug: true },
    });
    if (sample === null) {
      check(
        `match with ${eventCheck.name} resolves`,
        false,
        "no such match in database",
        false,
      );
      continue;
    }
    const detail = await getMatchByIdOrSlug(sample.slug);
    const count = detail !== null ? eventCheck.count(detail) : 0;
    check(
      `match with ${eventCheck.name} resolves with events`,
      detail !== null && count > 0,
      `${sample.slug}: ${count} ${eventCheck.name}`,
    );
  }

  // ---- 2022 final (soft — depends on source stage naming). ----
  const t2022 = await prisma.tournament.findUnique({
    where: { year: 2022 },
    select: { id: true },
  });
  if (t2022 !== null) {
    const final2022 = await getFinalMatchForTournament(t2022.id);
    if (final2022 === null) {
      check(
        "2022 final resolves",
        false,
        "no 'final' stage match found for 2022",
        false,
      );
    } else {
      const detail = await getMatchByIdOrSlug(final2022.slug);
      check(
        "getMatchByIdOrSlug(2022 final)",
        detail !== null,
        detail !== null
          ? `${detail.homeTeam.name} ${detail.score} ${detail.awayTeam.name} — ` +
              `${detail.penaltyKicks.length} penalty kicks, shootout: ${detail.decidedByPenalties}`
          : "returned null",
        false,
      );
    }
  }

  // ---- Records overview (Checkpoint 5F shape). ----
  const records = await getRecordsOverview();
  check(
    "getRecordsOverview scopeLabel exists",
    records.scopeLabel.length > 0 && records.scopeNote.length > 0,
    `"${records.scopeLabel}"`,
  );

  const categories: {
    name: string;
    boards: typeof records.teamRecords;
    requiredIf: number;
  }[] = [
    {
      name: "team records",
      boards: records.teamRecords,
      requiredIf: stats.goals,
    },
    {
      name: "player records",
      boards: records.playerRecords,
      requiredIf: stats.goals,
    },
    {
      name: "match records",
      boards: records.matchRecords,
      requiredIf: stats.matches,
    },
    {
      name: "tournament records",
      boards: records.tournamentRecords,
      requiredIf: stats.tournaments,
    },
    {
      name: "penalty records",
      boards: records.penaltyRecords,
      requiredIf: stats.penaltyKicks,
    },
    {
      name: "discipline records",
      boards: records.disciplineRecords,
      requiredIf: stats.bookings,
    },
  ];
  for (const category of categories) {
    const populated = category.boards.filter((board) => board.items.length > 0);
    check(
      `records: ${category.name} populated`,
      populated.length > 0,
      `${populated.length}/${category.boards.length} leaderboards`,
      category.requiredIf > 0, // critical only when the underlying data exists
    );
    for (const board of populated) {
      const top = board.items[0];
      console.log(
        `  ${category.name} / ${board.key}: ${board.items.length} items (top: ${top.label} — ${top.value})`,
      );
    }
  }
  console.log("");

  const allItems = categories.flatMap((c) => c.boards.flatMap((b) => b.items));
  check(
    "at least one record item has a valid link",
    allItems.some((item) => item.href !== null && item.href.startsWith("/")),
    `${allItems.filter((item) => item.href !== null).length}/${allItems.length} items linked`,
  );
  const serialized = JSON.stringify(records);
  check(
    "records do not expose RawSourceRecord data",
    !serialized.includes('"payload"') &&
      !serialized.toLowerCase().includes("rawsourcerecord"),
    `${serialized.length} chars serialized, no payload fields`,
  );

  // ---- Home page bundle. ----
  const home = await getHomePageData();
  check(
    "getHomePageData sections populated",
    home.featuredTournaments.length > 0 &&
      home.iconicMatches.length > 0 &&
      home.featuredCountries.length > 0 &&
      home.featuredPlayers.length > 0 &&
      home.recordsPreview.length > 0,
    `tournaments ${home.featuredTournaments.length}, finals ${home.iconicMatches.length}, ` +
      `countries ${home.featuredCountries.length}, players ${home.featuredPlayers.length}, ` +
      `record boards ${home.recordsPreview.length}`,
  );

  // ---- Report. ----
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
    console.log("\nAll critical query checks passed.");
  }
}

main()
  .catch((error) => {
    console.error(
      "\nQuery verification failed:",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
