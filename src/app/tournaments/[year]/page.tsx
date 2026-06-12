// Tournament detail page (Checkpoint 5B) — database-backed via the query layer.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PageContainer from "@/components/layout/PageContainer";
import SectionHeading from "@/components/ui/SectionHeading";
import EmptyState from "@/components/ui/EmptyState";
import TournamentHero from "@/components/tournaments/TournamentHero";
import TournamentStatGrid from "@/components/tournaments/TournamentStatGrid";
import TournamentSectionNav from "@/components/tournaments/TournamentSectionNav";
import TournamentTeamsGrid from "@/components/tournaments/TournamentTeamsGrid";
import TournamentMatchList from "@/components/tournaments/TournamentMatchList";
import TournamentTopScorers from "@/components/tournaments/TournamentTopScorers";
import TournamentAwards from "@/components/tournaments/TournamentAwards";
import FadeIn from "@/components/motion/FadeIn";
import { formatNumber } from "@/lib/format";
import { getTournamentByYear } from "@/server/queries/tournaments";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ year: string }> };

function parseYear(raw: string): number | null {
  const year = Number(raw);
  return Number.isInteger(year) && year >= 1900 && year <= 2100 ? year : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year: rawYear } = await params;
  const year = parseYear(rawYear);
  if (year === null) {
    return { title: "Tournament not found", robots: { index: false } };
  }
  return {
    title: `${year} World Cup`,
    description: `Explore the ${year} World Cup tournament, including teams, matches, goals, awards, and records.`,
  };
}

const SECTION_SX = { py: { xs: 4, md: 5 }, scrollMarginTop: 96 };

export default async function TournamentDetailPage({ params }: Props) {
  const { year: rawYear } = await params;
  const year = parseYear(rawYear);
  if (year === null) notFound();

  const tournament = await getTournamentByYear(year);
  if (tournament === null) notFound();

  const shootoutMatches = tournament.matches.filter(
    (match) => match.decidedByPenalties,
  );

  return (
    <Box>
      <TournamentHero tournament={tournament} />

      <PageContainer sx={{ pt: 3 }}>
        <TournamentSectionNav />
      </PageContainer>

      {/* Overview */}
      <PageContainer component="section" id="overview" sx={SECTION_SX}>
        <SectionHeading
          title="Overview"
          subtitle="Tournament totals counted from imported source data."
        />
        <TournamentStatGrid tournament={tournament} />
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", display: "block", mt: 2 }}
        >
          Group standings and knockout bracket views will be added after
          standings/bracket queries are finalized.
        </Typography>
      </PageContainer>

      {/* Teams */}
      <PageContainer component="section" id="teams" sx={SECTION_SX}>
        <SectionHeading
          title="Teams"
          subtitle={`${formatNumber(tournament.teams.length)} nations qualified for this tournament.`}
        />
        <FadeIn y={14}>
          <TournamentTeamsGrid teams={tournament.teams} />
        </FadeIn>
      </PageContainer>

      {/* Matches */}
      <PageContainer component="section" id="matches" sx={SECTION_SX}>
        <SectionHeading
          title="Matches"
          subtitle={`Every match of the tournament, stage by stage (${formatNumber(tournament.matches.length)} total).`}
        />
        <FadeIn y={14}>
          <TournamentMatchList matches={tournament.matches} />
        </FadeIn>
      </PageContainer>

      {/* Top Scorers */}
      <PageContainer component="section" id="top-scorers" sx={SECTION_SX}>
        <SectionHeading
          title="Top Scorers"
          subtitle="Leading scorers of the tournament, excluding own goals."
        />
        <FadeIn y={14}>
          <TournamentTopScorers scorers={tournament.topScorers} />
        </FadeIn>
      </PageContainer>

      {/* Awards */}
      <PageContainer component="section" id="awards" sx={SECTION_SX}>
        <SectionHeading
          title="Awards"
          subtitle="Official tournament awards in the archive."
        />
        <FadeIn y={14}>
          <TournamentAwards awards={tournament.awards} />
        </FadeIn>
      </PageContainer>

      {/* Penalties */}
      <PageContainer
        component="section"
        id="penalties"
        sx={{ ...SECTION_SX, pb: { xs: 7, md: 9 } }}
      >
        <SectionHeading
          title="Penalty Shootouts"
          subtitle={
            tournament.stats.penaltyShootouts > 0
              ? `${formatNumber(tournament.stats.penaltyShootouts)} matches went to penalties, with ${formatNumber(tournament.stats.penaltyKicks)} shootout kicks recorded.`
              : undefined
          }
        />
        {shootoutMatches.length > 0 ? (
          <FadeIn y={14}>
            <TournamentMatchList matches={shootoutMatches} />
          </FadeIn>
        ) : (
          <EmptyState
            title="No penalty shootouts"
            description="No match at this tournament was decided by a penalty shootout."
          />
        )}
      </PageContainer>
    </Box>
  );
}
