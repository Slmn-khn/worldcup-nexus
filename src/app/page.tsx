// DB-backed home page (Phase 4 — homepage visual upgrade). All data comes from
// the server-side orchestrator (getHomeViewModel), which wraps every section in
// its own try/catch so a failed fixture/media/finals query degrades to a
// polished fallback instead of crashing the page. Nothing here is hardcoded or
// mocked; sections without data render honest empty states.

import type { Metadata } from "next";
import Box from "@mui/material/Box";
import VaultSection from "@/components/vault/VaultSection";
import EmptyState from "@/components/ui/EmptyState";
import HomeLatestMatchesSection from "@/components/fixtures/HomeLatestMatchesSection";
import HomeHero from "@/components/home/HomeHero";
import ArchiveStatsSection from "@/components/home/ArchiveStatsSection";
import TournamentTimelineSection from "@/components/home/TournamentTimelineSection";
import FeaturedTournamentsSection from "@/components/home/FeaturedTournamentsSection";
import RecentFinalsSection from "@/components/home/RecentFinalsSection";
import ExploreByCountrySection from "@/components/home/ExploreByCountrySection";
import TopPlayerRecordsSection from "@/components/home/TopPlayerRecordsSection";
import RecordsFirstsSection from "@/components/home/RecordsFirstsSection";
import { getHomeViewModel } from "@/server/home/queries";

// Live archive data — always render from the current database state.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "WORLDCUP Nexus — Independent World Cup Archive" },
  description:
    "Explore every World Cup tournament, nation, player, match, goal, and penalty in one independent historical archive.",
};

export default async function Home() {
  const home = await getHomeViewModel();
  const { archiveStats } = home;

  const span =
    archiveStats.spanStart !== null && archiveStats.spanEnd !== null
      ? `${archiveStats.spanStart}–${archiveStats.spanEnd}`
      : null;

  return (
    <Box>
      {/* 1 — Hero */}
      <HomeHero span={span} />

      {/* 2 — Latest 2026 Matches / Schedule (existing fixture pipeline; DB-backed,
          no third-party calls from the browser). */}
      <VaultSection
        eyebrow="2026 World Cup"
        title="Latest Matches & Scores"
        description="Live, today's, recent, and upcoming 2026 World Cup fixtures."
        action={{ label: "Full schedule", href: "/schedule/2026" }}
      >
        {home.fixtures !== null ? (
          <HomeLatestMatchesSection data={home.fixtures} />
        ) : (
          <EmptyState
            title="2026 schedule temporarily unavailable"
            description="Fixtures appear here once the next sync runs. The rest of the archive is unaffected."
          />
        )}
      </VaultSection>

      {/* 3 — Archive at a Glance */}
      <ArchiveStatsSection stats={archiveStats} />

      {/* 4 — Tournament Timeline */}
      <TournamentTimelineSection entries={home.timeline} />

      {/* 5 — Featured Tournaments */}
      <FeaturedTournamentsSection tournaments={home.featuredTournaments} />

      {/* 6 — Recent Finals / Iconic Matches */}
      <RecentFinalsSection finals={home.recentFinals} />

      {/* 7 — Explore by Country */}
      <ExploreByCountrySection countries={home.countries} />

      {/* 8 — Top Player Records */}
      <TopPlayerRecordsSection players={home.playerRecords} />

      {/* 9 — Records & Firsts */}
      <RecordsFirstsSection records={home.records} />
    </Box>
  );
}
