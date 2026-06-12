// Records page (Checkpoint 5F) — database-backed leaderboard hub.
// Scope is labeled honestly: leaderboards combine all imported tournaments
// (men's and women's editions) and say so. No appearances/assists/clean
// sheet records — that data is not imported.

import type { Metadata } from "next";
import Box from "@mui/material/Box";
import PageContainer from "@/components/layout/PageContainer";
import RecordsHero from "@/components/records/RecordsHero";
import RecordsCategorySection from "@/components/records/RecordsCategorySection";
import RecordStatCard from "@/components/records/RecordStatCard";
import StaggerContainer from "@/components/motion/StaggerContainer";
import { getRecordsOverview } from "@/server/queries/records";
import type {
  RecordItemDto,
  RecordLeaderboardDto,
} from "@/server/queries/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book of Records",
  description:
    "Explore World Cup records and leaderboards for teams, players, matches, tournaments, penalties, and discipline.",
};

/** The #1 item of a board, for the highlight strip. */
function topOf(
  leaderboards: RecordLeaderboardDto[],
  key: string,
): { title: string; item: RecordItemDto } | null {
  const leaderboard = leaderboards.find((board) => board.key === key);
  const item = leaderboard?.items[0];
  return leaderboard !== undefined && item !== undefined
    ? { title: leaderboard.title, item }
    : null;
}

export default async function RecordsPage() {
  const records = await getRecordsOverview();

  const highlights = [
    topOf(records.playerRecords, "top-goal-scorers"),
    topOf(records.teamRecords, "most-titles-by-nation"),
    topOf(records.matchRecords, "highest-scoring-matches"),
    topOf(records.tournamentRecords, "most-goals-by-tournament"),
  ].filter(
    (highlight): highlight is NonNullable<typeof highlight> =>
      highlight !== null,
  );

  return (
    <Box>
      <RecordsHero
        scopeLabel={records.scopeLabel}
        scopeNote={records.scopeNote}
      />

      {highlights.length > 0 ? (
        <PageContainer sx={{ pt: { xs: 4, md: 5 } }}>
          <StaggerContainer
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
            }}
          >
            {highlights.map((highlight) => (
              <RecordStatCard
                key={highlight.title}
                title={highlight.title}
                item={highlight.item}
              />
            ))}
          </StaggerContainer>
        </PageContainer>
      ) : null}

      <RecordsCategorySection
        id="team-records"
        title="Team Records"
        description="Nation-level records aggregated across each nation's tournament teams."
        leaderboards={records.teamRecords}
      />
      <RecordsCategorySection
        id="player-records"
        title="Player Records"
        description="Player records from imported goal and award data. Appearance and assist records are not computable from the imported dataset."
        leaderboards={records.playerRecords}
      />
      <RecordsCategorySection
        id="match-records"
        title="Match Records"
        description="Single-match records from imported results."
        leaderboards={records.matchRecords}
      />
      <RecordsCategorySection
        id="tournament-records"
        title="Tournament Records"
        description="Per-tournament records counted from imported matches and goal events."
        leaderboards={records.tournamentRecords}
      />
      <RecordsCategorySection
        id="penalty-records"
        title="Penalty Records"
        description="Penalty shootout records. The source records shootout kicks only — in-match penalties are counted as goals."
        leaderboards={records.penaltyRecords}
      />
      <Box sx={{ pb: { xs: 4, md: 5 } }}>
        <RecordsCategorySection
          id="discipline-records"
          title="Discipline Records"
          description="Cards and bookings from imported match events."
          leaderboards={records.disciplineRecords}
        />
      </Box>
    </Box>
  );
}
