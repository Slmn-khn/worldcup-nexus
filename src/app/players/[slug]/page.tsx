// Player profile page (Checkpoint 5E) — database-backed via the query layer.
// Squad data is presented as selections ("World Cup Squads"), never as
// match appearances — appearance/lineup data is not imported.

import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import PageContainer from "@/components/layout/PageContainer";
import SectionHeading from "@/components/ui/SectionHeading";
import PlayerHero from "@/components/players/PlayerHero";
import PlayerStatGrid from "@/components/players/PlayerStatGrid";
import PlayerTournamentHistory from "@/components/players/PlayerTournamentHistory";
import PlayerGoalList from "@/components/players/PlayerGoalList";
import PlayerBookingList from "@/components/players/PlayerBookingList";
import PlayerPenaltyList from "@/components/players/PlayerPenaltyList";
import PlayerSubstitutionList from "@/components/players/PlayerSubstitutionList";
import PlayerAwards from "@/components/players/PlayerAwards";
import VaultFilterBar from "@/components/filters/VaultFilterBar";
import {
  getEnumParam,
  getNumberParam,
  getStringParam,
  type RawSearchParams,
} from "@/lib/search-params";
import { getPlayerProfile } from "@/server/queries/players";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
};

const EVENT_TYPES = [
  "Goal",
  "Booking",
  "PenaltyKick",
  "Substitution",
  "Award",
] as const;
const EVENT_TYPE_LABELS: Record<(typeof EVENT_TYPES)[number], string> = {
  Goal: "Goals",
  Booking: "Cards",
  PenaltyKick: "Penalty kicks",
  Substitution: "Substitutions",
  Award: "Awards",
};

/** Case-insensitive q match over an event's match context fields. */
function contextMatches(
  q: string,
  context: { matchLabel: string; opponent: string | null; stage: string },
): boolean {
  return `${context.matchLabel} ${context.opponent ?? ""} ${context.stage}`
    .toLowerCase()
    .includes(q);
}

// Deduplicates the query between generateMetadata and the page render.
const getProfile = cache(async (slug: string) => getPlayerProfile(slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const player = await getProfile(decodeURIComponent(slug));
  if (player === null) {
    return { title: "Player not found", robots: { index: false } };
  }
  return {
    title: player.name,
    description: `Explore ${player.name}'s World Cup record, including selected tournaments, goals, bookings, penalties, substitutions, and awards.`,
  };
}

const SECTION_SX = { py: { xs: 4, md: 5 } };

export default async function PlayerProfilePage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  if (slug.trim() === "") notFound();

  const [player, rawParams] = await Promise.all([
    getProfile(decodeURIComponent(slug)),
    searchParams,
  ]);
  if (player === null) notFound();

  // Local archive controls — they narrow the event sections only; hero,
  // stat grid, and the squad history always show the full career.
  const eventFilters = {
    q: getStringParam(rawParams, "q"),
    tournamentYear: getNumberParam(rawParams, "tournamentYear", {
      min: 1900,
      max: 2100,
    }),
    eventType: getEnumParam(rawParams, "eventType", EVENT_TYPES),
  };
  const q = eventFilters.q?.toLowerCase();
  const year = eventFilters.tournamentYear;

  const goals = player.goals.filter(
    (goal) =>
      (year === undefined || goal.tournamentYear === year) &&
      (q === undefined || contextMatches(q, goal)),
  );
  const bookings = player.bookings.filter(
    (booking) =>
      (year === undefined || booking.tournamentYear === year) &&
      (q === undefined || contextMatches(q, booking)),
  );
  const penaltyKicks = player.penaltyKicks.filter(
    (kick) =>
      (year === undefined || kick.tournamentYear === year) &&
      (q === undefined || contextMatches(q, kick)),
  );
  const substitutions = player.substitutions.filter(
    (sub) =>
      (year === undefined || sub.tournamentYear === year) &&
      (q === undefined || contextMatches(q, sub)),
  );
  const awards = player.awards.filter(
    (award) =>
      (year === undefined || award.tournamentYear === year) &&
      (q === undefined || award.name.toLowerCase().includes(q)),
  );

  const showSection = (type: (typeof EVENT_TYPES)[number]) =>
    eventFilters.eventType === undefined || eventFilters.eventType === type;

  const yearOptions = [
    ...new Set(player.squadTournaments.map((squad) => squad.tournamentYear)),
  ]
    .sort((a, b) => b - a)
    .map((squadYear) => ({
      label: String(squadYear),
      value: String(squadYear),
    }));

  const activeEventFilters = [
    eventFilters.q !== undefined
      ? { param: "q", label: "Search", value: eventFilters.q }
      : null,
    eventFilters.tournamentYear !== undefined
      ? {
          param: "tournamentYear",
          label: "Tournament",
          value: String(eventFilters.tournamentYear),
        }
      : null,
    eventFilters.eventType !== undefined
      ? {
          param: "eventType",
          label: "Events",
          value: EVENT_TYPE_LABELS[eventFilters.eventType],
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <Box>
      <PlayerHero player={player} />

      {/* Stats */}
      <PageContainer component="section" sx={SECTION_SX}>
        <SectionHeading
          title="World Cup Record"
          subtitle="Totals counted from imported squad and event data. Squad selections are not match appearances."
        />
        <PlayerStatGrid player={player} />
      </PageContainer>

      {/* Squads — always the full history (q/year never trim selections). */}
      <PageContainer component="section" sx={SECTION_SX}>
        <SectionHeading
          title="World Cup Squads"
          subtitle="Tournaments where this player was selected in the squad."
        />
        <PlayerTournamentHistory squads={player.squadTournaments} />
      </PageContainer>

      {/* Event archive controls */}
      <PageContainer component="section" sx={{ pt: { xs: 2, md: 3 } }}>
        <VaultFilterBar
          fields={[
            { kind: "search", placeholder: "Search events — opponents, stages…" },
            {
              kind: "select",
              param: "tournamentYear",
              label: "Tournament",
              options: yearOptions,
              allLabel: "All tournaments",
            },
            {
              kind: "select",
              param: "eventType",
              label: "Events",
              options: EVENT_TYPES.map((type) => ({
                label: EVENT_TYPE_LABELS[type],
                value: type,
              })),
              allLabel: "All events",
            },
          ]}
          active={activeEventFilters}
          resultCount={
            (showSection("Goal") ? goals.length : 0) +
            (showSection("Booking") ? bookings.length : 0) +
            (showSection("PenaltyKick") ? penaltyKicks.length : 0) +
            (showSection("Substitution") ? substitutions.length : 0) +
            (showSection("Award") ? awards.length : 0)
          }
          resultNoun="events"
        />
      </PageContainer>

      {/* Goals */}
      {showSection("Goal") ? (
        <PageContainer component="section" sx={SECTION_SX}>
          <SectionHeading
            title="Goals"
            subtitle="Every recorded goal, in chronological order."
          />
          <PlayerGoalList goals={goals} />
        </PageContainer>
      ) : null}

      {/* Cards */}
      {showSection("Booking") ? (
        <PageContainer component="section" sx={SECTION_SX}>
          <SectionHeading
            title="Cards"
            subtitle="Bookings across all imported tournaments."
          />
          <PlayerBookingList bookings={bookings} />
        </PageContainer>
      ) : null}

      {/* Penalties */}
      {showSection("PenaltyKick") ? (
        <PageContainer component="section" sx={SECTION_SX}>
          <SectionHeading
            title="Penalty Kicks"
            subtitle="Shootout kicks from the imported dataset. In-match penalty goals appear in the goals list."
          />
          <PlayerPenaltyList kicks={penaltyKicks} />
        </PageContainer>
      ) : null}

      {/* Substitutions */}
      {showSection("Substitution") ? (
        <PageContainer component="section" sx={SECTION_SX}>
          <SectionHeading
            title="Substitutions"
            subtitle="Times this player came on or went off."
          />
          <PlayerSubstitutionList substitutions={substitutions} />
        </PageContainer>
      ) : null}

      {/* Awards */}
      {showSection("Award") ? (
        <PageContainer
          component="section"
          sx={{ ...SECTION_SX, pb: { xs: 7, md: 9 } }}
        >
          <SectionHeading
            title="Awards"
            subtitle="Official tournament awards in the archive."
          />
          <PlayerAwards awards={awards} />
        </PageContainer>
      ) : null}
    </Box>
  );
}
