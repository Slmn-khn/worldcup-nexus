// Tournament Timeline (neon pass). A horizontally scrolling row of glowing
// year-cards (latest → oldest) separated by chevrons. The most recent edition
// glows gold; the rest glow cyan. Server section header + a client TimelineRail
// that adds hold-and-drag scrolling. Data-backed.

import HomeSection from "./HomeSection";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";
import TimelineRail from "./TimelineRail";
import type { HomeTimelineEntry } from "@/server/home/queries";

export default function TournamentTimelineSection({
  entries,
}: {
  entries: HomeTimelineEntry[];
}) {
  return (
    <HomeSection divider>
      <SectionHeader
        eyebrow="The editions"
        title="Tournament Timeline"
        accent="gold"
        action={{ label: "All World Cups", href: "/tournaments" }}
      />
      {entries.length > 0 ? (
        <TimelineRail entries={entries} />
      ) : (
        <EmptyState
          title="Timeline coming soon"
          description="Tournament data has not been imported yet."
        />
      )}
    </HomeSection>
  );
}
