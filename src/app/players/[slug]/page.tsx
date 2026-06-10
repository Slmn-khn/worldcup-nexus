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
import { getPlayerProfile } from "@/server/queries/players";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

// Deduplicates the query between generateMetadata and the page render.
const getProfile = cache(async (slug: string) => getPlayerProfile(slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const player = await getProfile(decodeURIComponent(slug));
  if (player === null) {
    return { title: "WorldCup Atlas — Player not found" };
  }
  return {
    title: `WorldCup Atlas — ${player.name}`,
    description: `Explore ${player.name}'s World Cup record, including selected tournaments, goals, bookings, penalties, substitutions, and awards.`,
  };
}

const SECTION_SX = { py: { xs: 4, md: 5 } };

export default async function PlayerProfilePage({ params }: Props) {
  const { slug } = await params;
  if (slug.trim() === "") notFound();

  const player = await getProfile(decodeURIComponent(slug));
  if (player === null) notFound();

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

      {/* Squads */}
      <PageContainer component="section" sx={SECTION_SX}>
        <SectionHeading
          title="World Cup Squads"
          subtitle="Tournaments where this player was selected in the squad."
        />
        <PlayerTournamentHistory squads={player.squadTournaments} />
      </PageContainer>

      {/* Goals */}
      <PageContainer component="section" sx={SECTION_SX}>
        <SectionHeading
          title="Goals"
          subtitle="Every recorded goal, in chronological order."
        />
        <PlayerGoalList goals={player.goals} />
      </PageContainer>

      {/* Cards */}
      <PageContainer component="section" sx={SECTION_SX}>
        <SectionHeading
          title="Cards"
          subtitle="Bookings across all imported tournaments."
        />
        <PlayerBookingList bookings={player.bookings} />
      </PageContainer>

      {/* Penalties */}
      <PageContainer component="section" sx={SECTION_SX}>
        <SectionHeading
          title="Penalty Kicks"
          subtitle="Shootout kicks from the imported dataset. In-match penalty goals appear in the goals list."
        />
        <PlayerPenaltyList kicks={player.penaltyKicks} />
      </PageContainer>

      {/* Substitutions */}
      <PageContainer component="section" sx={SECTION_SX}>
        <SectionHeading
          title="Substitutions"
          subtitle="Times this player came on or went off."
        />
        <PlayerSubstitutionList substitutions={player.substitutions} />
      </PageContainer>

      {/* Awards */}
      <PageContainer
        component="section"
        sx={{ ...SECTION_SX, pb: { xs: 7, md: 9 } }}
      >
        <SectionHeading
          title="Awards"
          subtitle="Official tournament awards in the archive."
        />
        <PlayerAwards awards={player.awards} />
      </PageContainer>
    </Box>
  );
}
