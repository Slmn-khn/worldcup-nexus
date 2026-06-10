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
import { getCountryProfile } from "@/server/queries/countries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

// Deduplicates the query between generateMetadata and the page render.
const getProfile = cache(async (slug: string) => getCountryProfile(slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const country = await getProfile(decodeURIComponent(slug));
  if (country === null) {
    return { title: "Country not found" };
  }
  return {
    title: country.name,
    description: `Explore ${country.name}'s World Cup history, including tournaments, matches, goals, finals, and top scorers.`,
  };
}

const SECTION_SX = { py: { xs: 4, md: 5 } };

export default async function CountryProfilePage({ params }: Props) {
  const { slug } = await params;
  if (slug.trim() === "") notFound();

  const country = await getProfile(decodeURIComponent(slug));
  if (country === null) notFound();

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
        <CountryMatchList matches={country.matches} />
      </PageContainer>
    </Box>
  );
}
