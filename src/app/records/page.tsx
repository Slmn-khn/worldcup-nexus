// Records page — database-backed leaderboard hub with Vault category tabs
// and search (Checkpoint 7D). Scope is labeled honestly: leaderboards
// combine all imported tournaments (men's and women's editions) and say so.

import type { Metadata } from "next";
import Box from "@mui/material/Box";
import PageContainer from "@/components/layout/PageContainer";
import RecordsHero from "@/components/records/RecordsHero";
import RecordsCategorySection from "@/components/records/RecordsCategorySection";
import RecordsCategoryTabs from "@/components/records/RecordsCategoryTabs";
import RecordStatCard from "@/components/records/RecordStatCard";
import VaultFilterBar from "@/components/filters/VaultFilterBar";
import EmptyState from "@/components/ui/EmptyState";
import {
  getEnumParam,
  getStringParam,
  type RawSearchParams,
} from "@/lib/search-params";
import { getRecordsOverview } from "@/server/queries/records";
import type {
  RecordCategoryKey,
  RecordItemDto,
  RecordLeaderboardDto,
} from "@/server/queries/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Book of Records",
  description:
    "Explore World Cup records and leaderboards for teams, players, matches, tournaments, penalties, and discipline.",
};

const CATEGORIES: RecordCategoryKey[] = [
  "teams",
  "players",
  "matches",
  "tournaments",
  "penalties",
  "discipline",
];

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

/** A leaderboard matches q when its title, description, or any entry does. */
function boardMatches(board: RecordLeaderboardDto, q: string): boolean {
  const needle = q.toLowerCase();
  if (board.title.toLowerCase().includes(needle)) return true;
  if (board.description.toLowerCase().includes(needle)) return true;
  return board.items.some(
    (item) =>
      item.label.toLowerCase().includes(needle) ||
      (item.detail !== null && item.detail.toLowerCase().includes(needle)),
  );
}

type Props = { searchParams: Promise<RawSearchParams> };

export default async function RecordsPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = getEnumParam(params, "category", CATEGORIES);
  const q = getStringParam(params, "q");

  const records = await getRecordsOverview();

  const sections: {
    key: RecordCategoryKey;
    id: string;
    title: string;
    description: string;
    leaderboards: RecordLeaderboardDto[];
  }[] = [
    {
      key: "teams",
      id: "team-records",
      title: "Team Records",
      description:
        "Nation-level records aggregated across each nation's tournament teams.",
      leaderboards: records.teamRecords,
    },
    {
      key: "players",
      id: "player-records",
      title: "Player Records",
      description:
        "Player records from imported goal and award data. Appearance and assist records are not computable from the imported dataset.",
      leaderboards: records.playerRecords,
    },
    {
      key: "matches",
      id: "match-records",
      title: "Match Records",
      description: "Single-match records from imported results.",
      leaderboards: records.matchRecords,
    },
    {
      key: "tournaments",
      id: "tournament-records",
      title: "Tournament Records",
      description:
        "Per-tournament records counted from imported matches and goal events.",
      leaderboards: records.tournamentRecords,
    },
    {
      key: "penalties",
      id: "penalty-records",
      title: "Penalty Records",
      description:
        "Penalty shootout records. The source records shootout kicks only — in-match penalties are counted as goals.",
      leaderboards: records.penaltyRecords,
    },
    {
      key: "discipline",
      id: "discipline-records",
      title: "Discipline Records",
      description: "Cards and bookings from imported match events.",
      leaderboards: records.disciplineRecords,
    },
  ];

  // Category narrows sections; q narrows leaderboards inside them. Entries
  // are never trimmed — a matching board renders whole (no partial records).
  const visibleSections = sections
    .filter((section) => category === undefined || section.key === category)
    .map((section) => ({
      ...section,
      leaderboards:
        q === undefined
          ? section.leaderboards
          : section.leaderboards.filter((board) => boardMatches(board, q)),
    }))
    .filter((section) =>
      section.leaderboards.some((board) => board.items.length > 0),
    );

  const showHighlights = category === undefined && q === undefined;
  const highlights = showHighlights
    ? [
        topOf(records.playerRecords, "top-goal-scorers"),
        topOf(records.teamRecords, "most-titles-by-nation"),
        topOf(records.matchRecords, "highest-scoring-matches"),
        topOf(records.tournamentRecords, "most-goals-by-tournament"),
      ].filter(
        (highlight): highlight is NonNullable<typeof highlight> =>
          highlight !== null,
      )
    : [];

  const active = [
    q !== undefined ? { param: "q", label: "Search", value: q } : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <Box>
      <RecordsHero
        scopeLabel={records.scopeLabel}
        scopeNote={records.scopeNote}
      />

      <PageContainer sx={{ pt: { xs: 4, md: 5 } }}>
        <RecordsCategoryTabs category={category} q={q} />
        <Box sx={{ mt: 3 }}>
          <VaultFilterBar
            label="Archive Controls"
            fields={[
              {
                kind: "search",
                placeholder: "Search records — names, teams, matches…",
              },
            ]}
            active={active}
            resultCount={visibleSections.reduce(
              (sum, section) => sum + section.leaderboards.length,
              0,
            )}
            resultNoun="leaderboards"
          />
        </Box>
      </PageContainer>

      {highlights.length > 0 ? (
        <PageContainer sx={{ pt: { xs: 4, md: 5 } }}>
          <Box
            sx={{
              display: "grid",
              gap: 3,
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
          </Box>
        </PageContainer>
      ) : null}

      {visibleSections.length > 0 ? (
        visibleSections.map((section, index) => (
          <Box
            key={section.id}
            sx={
              index === visibleSections.length - 1
                ? { pb: { xs: 4, md: 5 } }
                : undefined
            }
          >
            <RecordsCategorySection
              id={section.id}
              title={section.title}
              description={section.description}
              leaderboards={section.leaderboards}
            />
          </Box>
        ))
      ) : (
        <PageContainer sx={{ py: { xs: 5, md: 7 } }}>
          <EmptyState
            title="No records match"
            description="No leaderboard matches this search. Records cover names, teams, matches, and record categories from the imported dataset."
          />
        </PageContainer>
      )}
    </Box>
  );
}
