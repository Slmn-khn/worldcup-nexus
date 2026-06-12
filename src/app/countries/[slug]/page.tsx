// Country profile page (Checkpoint 5D) — database-backed via the query layer.

import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import PageContainer from "@/components/layout/PageContainer";
import SectionHeading from "@/components/ui/SectionHeading";
import CountryHero from "@/components/countries/CountryHero";
import CountryStatGrid from "@/components/countries/CountryStatGrid";
import CountryTournamentTimeline from "@/components/countries/CountryTournamentTimeline";
import CountryMatchList from "@/components/countries/CountryMatchList";
import CountryTopScorers from "@/components/countries/CountryTopScorers";
import CountryFinals from "@/components/countries/CountryFinals";
import VaultFilterBar from "@/components/filters/VaultFilterBar";
import EmptyState from "@/components/ui/EmptyState";
import { formatStage } from "@/lib/format";
import {
  getEnumParam,
  getNumberParam,
  getStringParam,
  type RawSearchParams,
} from "@/lib/search-params";
import { getCountryProfile } from "@/server/queries/countries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
};

const RESULTS = ["W", "D", "L"] as const;
const RESULT_LABELS: Record<(typeof RESULTS)[number], string> = {
  W: "Wins",
  D: "Draws",
  L: "Losses",
};

// Deduplicates the query between generateMetadata and the page render.
const getProfile = cache(async (slug: string) => getCountryProfile(slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const country = await getProfile(decodeURIComponent(slug));
  if (country === null) {
    return { title: "Country not found", robots: { index: false } };
  }
  return {
    title: country.name,
    description: `Explore ${country.name}'s World Cup history, including tournaments, matches, goals, finals, and top scorers.`,
  };
}

const SECTION_SX = { py: { xs: 4, md: 5 } };

export default async function CountryProfilePage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  if (slug.trim() === "") notFound();

  const [country, rawParams] = await Promise.all([
    getProfile(decodeURIComponent(slug)),
    searchParams,
  ]);
  if (country === null) notFound();

  // Local archive controls — they narrow the match list only; hero, stats,
  // timeline, finals, and top scorers always show the full history.
  const matchFilters = {
    q: getStringParam(rawParams, "q"),
    tournamentYear: getNumberParam(rawParams, "tournamentYear", {
      min: 1900,
      max: 2100,
    }),
    stage: getStringParam(rawParams, "stage"),
    result: getEnumParam(rawParams, "result", RESULTS),
  };
  const q = matchFilters.q?.toLowerCase();
  const filteredMatches = country.matches.filter((match) => {
    if (
      matchFilters.tournamentYear !== undefined &&
      match.tournamentYear !== matchFilters.tournamentYear
    ) {
      return false;
    }
    if (
      matchFilters.stage !== undefined &&
      match.stage.toLowerCase() !== matchFilters.stage.toLowerCase()
    ) {
      return false;
    }
    if (
      matchFilters.result !== undefined &&
      match.result !== matchFilters.result
    ) {
      return false;
    }
    if (q !== undefined) {
      const haystack =
        `${match.homeTeam.name} ${match.awayTeam.name} ${match.opponent} ${match.stage} ${match.stadiumName ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
  const yearOptions = [
    ...new Set(country.matches.map((match) => match.tournamentYear)),
  ]
    .sort((a, b) => b - a)
    .map((year) => ({ label: String(year), value: String(year) }));
  const stageOptions = [
    ...new Set(country.matches.map((match) => match.stage)),
  ].map((stage) => ({ label: formatStage(stage) ?? stage, value: stage }));

  const activeMatchFilters = [
    matchFilters.q !== undefined
      ? { param: "q", label: "Search", value: matchFilters.q }
      : null,
    matchFilters.tournamentYear !== undefined
      ? {
          param: "tournamentYear",
          label: "Tournament",
          value: String(matchFilters.tournamentYear),
        }
      : null,
    matchFilters.stage !== undefined
      ? {
          param: "stage",
          label: "Stage",
          value: formatStage(matchFilters.stage) ?? matchFilters.stage,
        }
      : null,
    matchFilters.result !== undefined
      ? {
          param: "result",
          label: "Result",
          value: RESULT_LABELS[matchFilters.result],
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <Box>
      <CountryHero country={country} />

      {/* Stats */}
      <PageContainer component="section" sx={SECTION_SX}>
        <SectionHeading
          title="All-Time Record"
          subtitle="Totals counted from imported matches and goal events. Shootout wins count as wins."
        />
        <CountryStatGrid country={country} />
      </PageContainer>

      {/* Tournament timeline */}
      <PageContainer component="section" sx={SECTION_SX}>
        <SectionHeading
          title="Tournament History"
          subtitle="Every tournament entered. Champions and runners-up come from tournament results — other finishes are not recorded in the imported dataset."
        />
        <CountryTournamentTimeline participations={country.participations} />
      </PageContainer>

      {/* Finals */}
      <PageContainer component="section" sx={SECTION_SX}>
        <SectionHeading
          title="Finals"
          subtitle="Deciding finals involving this nation."
        />
        <CountryFinals finals={country.finals} />
      </PageContainer>

      {/* Top scorers */}
      <PageContainer component="section" sx={SECTION_SX}>
        <SectionHeading
          title="Top Scorers"
          subtitle="Leading scorers for this nation across all imported tournaments, excluding own goals."
        />
        <CountryTopScorers scorers={country.topScorers} />
      </PageContainer>

      {/* Matches */}
      <PageContainer
        component="section"
        sx={{ ...SECTION_SX, pb: { xs: 7, md: 9 } }}
      >
        <SectionHeading title="Matches" subtitle="Most recent matches first." />
        <Box sx={{ mb: 3 }}>
          <VaultFilterBar
            fields={[
              { kind: "search", placeholder: "Search matches…" },
              {
                kind: "select",
                param: "tournamentYear",
                label: "Tournament",
                options: yearOptions,
                allLabel: "All tournaments",
              },
              {
                kind: "select",
                param: "stage",
                label: "Stage",
                options: stageOptions,
                allLabel: "All stages",
              },
              {
                kind: "select",
                param: "result",
                label: "Result",
                options: RESULTS.map((result) => ({
                  label: RESULT_LABELS[result],
                  value: result,
                })),
                allLabel: "All results",
              },
            ]}
            active={activeMatchFilters}
            resultCount={filteredMatches.length}
            totalCount={country.matches.length}
            resultNoun="matches"
          />
        </Box>
        {filteredMatches.length > 0 ? (
          <CountryMatchList matches={filteredMatches} />
        ) : (
          <EmptyState
            title="No matches fit these filters"
            description={`No ${country.name} match fits the current tournament, stage, result, or search.`}
          />
        )}
      </PageContainer>
    </Box>
  );
}
