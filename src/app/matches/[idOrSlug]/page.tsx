// Match detail page (Checkpoint 5C) — database-backed via the query layer.

import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PageContainer from "@/components/layout/PageContainer";
import SectionHeading from "@/components/ui/SectionHeading";
import MatchHero from "@/components/matches/MatchHero";
import MatchInfoGrid from "@/components/matches/MatchInfoGrid";
import MatchTimeline from "@/components/matches/MatchTimeline";
import MatchEventList from "@/components/matches/MatchEventList";
import PenaltyShootout from "@/components/matches/PenaltyShootout";
import MatchRelatedLinks from "@/components/matches/MatchRelatedLinks";
import { getMatchByIdOrSlug } from "@/server/queries/matches";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ idOrSlug: string }> };

// Deduplicates the query between generateMetadata and the page render.
const getMatch = cache(async (idOrSlug: string) =>
  getMatchByIdOrSlug(idOrSlug),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { idOrSlug } = await params;
  const match = await getMatch(decodeURIComponent(idOrSlug));
  if (match === null) {
    return { title: "Match not found" };
  }
  return {
    title: `${match.homeTeam.name} vs ${match.awayTeam.name}, ${match.tournamentYear}`,
    description:
      `Explore ${match.homeTeam.name} vs ${match.awayTeam.name} from the ${match.tournamentYear} World Cup, ` +
      "including score, goals, cards, substitutions, penalties, venue, and referee.",
  };
}

const SECTION_SX = { py: { xs: 4, md: 5 } };

export default async function MatchDetailPage({ params }: Props) {
  const { idOrSlug } = await params;
  if (idOrSlug.trim() === "") notFound();

  const match = await getMatch(decodeURIComponent(idOrSlug));
  if (match === null) notFound();

  const showShootout =
    match.decidedByPenalties ||
    match.penaltyKicks.some((kick) => kick.type === "SHOOTOUT");

  return (
    <Box>
      <MatchHero match={match} />

      {/* Match information */}
      <PageContainer component="section" sx={SECTION_SX}>
        <SectionHeading
          title="Match Information"
          subtitle="Facts recorded in the imported source data."
        />
        <MatchInfoGrid match={match} />
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", display: "block", mt: 2 }}
        >
          Lineup and formation views will be added after appearance/lineup data
          is imported.
        </Typography>
      </PageContainer>

      {/* Timeline */}
      <PageContainer component="section" sx={SECTION_SX}>
        <SectionHeading
          title="Timeline"
          subtitle="Goals, cards, and substitutions in chronological order."
        />
        <MatchTimeline match={match} />
      </PageContainer>

      {/* Penalty shootout */}
      {showShootout ? (
        <PageContainer component="section" sx={SECTION_SX}>
          <SectionHeading
            title="Penalty Shootout"
            subtitle={
              match.penaltyScore !== null
                ? `Final shootout score: ${match.penaltyScore}.`
                : undefined
            }
          />
          <PenaltyShootout match={match} />
        </PageContainer>
      ) : null}

      {/* Event breakdown */}
      <PageContainer component="section" sx={SECTION_SX}>
        <SectionHeading
          title="Event Breakdown"
          subtitle="The same events grouped by category."
        />
        <MatchEventList match={match} />
      </PageContainer>

      {/* Related */}
      <PageContainer
        component="section"
        sx={{ ...SECTION_SX, pb: { xs: 7, md: 9 } }}
      >
        <SectionHeading title="Explore Related" />
        <MatchRelatedLinks match={match} />
      </PageContainer>
    </Box>
  );
}
