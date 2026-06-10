// Checkpoint 4D verification — exercises the page query layer end to end
// against the live database. Exits non-zero only on critical failures;
// naming-dependent sample lookups are soft (warnings).

import "dotenv/config";

import { prisma } from "@/server/db/prisma";
import { getArchiveStats, getHomePageData } from "@/server/queries/home";
import { getCountryProfile } from "@/server/queries/countries";
import {
  getFinalMatchForTournament,
  getMatchByIdOrSlug,
} from "@/server/queries/matches";
import { getPlayerProfile } from "@/server/queries/players";
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

  // ---- Country profile (find Brazil by slug, then name). ----
  const brazil = await prisma.country.findFirst({
    where: {
      OR: [
        { slug: "brazil" },
        { name: { equals: "Brazil", mode: "insensitive" } },
      ],
    },
    select: { slug: true, name: true },
  });
  if (brazil === null) {
    check(
      "getCountryProfile(Brazil)",
      false,
      "Brazil not found by slug or name",
      false,
    );
  } else {
    const profile = await getCountryProfile(brazil.slug);
    check(
      "getCountryProfile(Brazil)",
      profile !== null &&
        profile.totals.matchesPlayed > 0 &&
        profile.totals.goalsFor > 0,
      profile !== null
        ? `${profile.name} (${brazil.slug}): ${profile.totals.tournamentsEntered} tournaments, ` +
            `${profile.totals.matchesPlayed} matches, ${profile.totals.goalsFor} goals for, ` +
            `${profile.totals.goalsAgainst} against, ${profile.totals.finalsPlayed} finals`
        : "returned null",
    );
  }

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
      profile !== null && profile.squadTournaments.length > 0,
      profile !== null
        ? `${profile.name} (${maradona.slug}): ${profile.squadTournaments.length} squad tournaments, ` +
            `${profile.totals.goals} goals, ${profile.totals.bookings} cards, ${profile.totals.awards} awards`
        : "returned null",
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

  // ---- Records overview. ----
  const records = await getRecordsOverview();
  const nonEmpty = records.filter((board) => board.items.length > 0);
  check(
    "getRecordsOverview has non-empty leaderboards",
    nonEmpty.length > 0,
    `${nonEmpty.length}/${records.length} leaderboards populated`,
  );
  for (const board of records) {
    const top = board.items[0];
    console.log(
      `  leaderboard ${board.key}: ${board.items.length} items` +
        (top !== undefined ? ` (top: ${top.label} — ${top.value})` : ""),
    );
  }
  console.log("");

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
