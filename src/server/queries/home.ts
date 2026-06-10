// Home page queries (Checkpoint 4D). Everything is database-backed; nothing
// is invented. "Featured"/"iconic" sections use transparent data-backed
// criteria (recency, finals, leaderboards) rather than editorial picks.

import { prisma } from "@/server/db/prisma";
import { finalStageFilter, matchCardInclude, toMatchCardDto } from "./helpers";
import { getRecordsOverview } from "./records";
import { getTournamentCards } from "./tournaments";
import type {
  ArchiveStatsDto,
  CountryCardDto,
  HomePageDataDto,
  PlayerCardDto,
} from "./types";

export async function getArchiveStats(): Promise<ArchiveStatsDto> {
  const [
    tournaments,
    countries,
    teams,
    players,
    matches,
    goals,
    bookings,
    substitutions,
    penaltyKicks,
    awards,
  ] = await Promise.all([
    prisma.tournament.count(),
    prisma.country.count(),
    prisma.team.count(),
    prisma.player.count(),
    prisma.match.count(),
    prisma.goal.count(),
    prisma.booking.count(),
    prisma.substitution.count(),
    prisma.penaltyKick.count(),
    prisma.award.count(),
  ]);
  return {
    tournaments,
    countries,
    teams,
    players,
    matches,
    goals,
    bookings,
    substitutions,
    penaltyKicks,
    awards,
  };
}

/** Countries with the most tournament participations. */
async function featuredCountries(take: number): Promise<CountryCardDto[]> {
  const countries = await prisma.country.findMany({
    include: { _count: { select: { teams: true, players: true } } },
    orderBy: { teams: { _count: "desc" } },
    take,
  });
  return countries.map((country) => ({
    id: country.id,
    name: country.name,
    slug: country.slug,
    code: country.code,
    flagEmoji: country.flagEmoji,
    tournamentsEntered: country._count.teams,
    playersCount: country._count.players,
    // Aggregates are not computed for the homepage preview.
    matchesCount: null,
    goalsFor: null,
    titlesCount: null,
  }));
}

/** All-time top scorers (excluding own goals) as player cards. */
async function featuredPlayers(take: number): Promise<PlayerCardDto[]> {
  const grouped = await prisma.goal.groupBy({
    by: ["playerId"],
    where: { isOwnGoal: false },
    _count: { _all: true },
    orderBy: { _count: { playerId: "desc" } },
    take,
  });
  const players = await prisma.player.findMany({
    where: { id: { in: grouped.map((g) => g.playerId) } },
    include: {
      country: { select: { name: true, slug: true, flagEmoji: true } },
    },
  });
  const byId = new Map(players.map((p) => [p.id, p]));
  return grouped.flatMap((g) => {
    const player = byId.get(g.playerId);
    if (player === undefined) return [];
    return [
      {
        id: player.id,
        name: player.name,
        slug: player.slug,
        countryName: player.country?.name ?? null,
        countrySlug: player.country?.slug ?? null,
        countryFlagEmoji: player.country?.flagEmoji ?? null,
        position: player.position,
        // Aggregates are not computed for the homepage preview.
        selectedTournamentsCount: null,
        goalsCount: null,
        bookingsCount: null,
        awardsCount: null,
      },
    ];
  });
}

export async function getHomePageData(): Promise<HomePageDataDto> {
  const [archiveStats, tournamentCards, finals, countries, players, records] =
    await Promise.all([
      getArchiveStats(),
      getTournamentCards(),
      prisma.match.findMany({
        where: { stage: finalStageFilter },
        include: matchCardInclude,
        orderBy: { matchDate: "desc" },
        take: 3,
      }),
      featuredCountries(4),
      featuredPlayers(4),
      getRecordsOverview(),
    ]);

  // One marquee leaderboard from each of three record categories.
  const previewBoards = [
    records.playerRecords[0],
    records.teamRecords[0],
    records.matchRecords[0],
  ].filter(
    (leaderboard): leaderboard is NonNullable<typeof leaderboard> =>
      leaderboard !== undefined && leaderboard.items.length > 0,
  );

  return {
    archiveStats,
    featuredTournaments: tournamentCards.slice(0, 3),
    iconicMatches: finals.map(toMatchCardDto),
    featuredCountries: countries,
    featuredPlayers: players,
    recordsPreview: previewBoards.map((leaderboard) => ({
      ...leaderboard,
      items: leaderboard.items.slice(0, 3),
    })),
  };
}
