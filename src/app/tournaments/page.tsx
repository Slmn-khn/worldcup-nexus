// All-tournaments page — database-backed, with URL-driven Vault archive
// controls (Checkpoint 7D).

import type { Metadata } from "next";
import Box from "@mui/material/Box";
import PageContainer from "@/components/layout/PageContainer";
import VaultPageHeader from "@/components/vault/VaultPageHeader";
import VaultFilterBar from "@/components/filters/VaultFilterBar";
import EmptyState from "@/components/ui/EmptyState";
import TournamentCard from "@/components/tournaments/TournamentCard";
import { formatNumber } from "@/lib/format";
import {
  getEnumParam,
  getNumberParam,
  getStringParam,
  type RawSearchParams,
} from "@/lib/search-params";
import { getTournamentIndex } from "@/server/queries/tournaments";
import type { TournamentSort } from "@/server/queries/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "World Cup Tournaments",
  description:
    "Browse every FIFA World Cup tournament in the WorldCup Atlas archive.",
};

const SORTS: TournamentSort[] = [
  "newest",
  "oldest",
  "most-goals",
  "most-matches",
  "most-teams",
];
const SORT_OPTIONS = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Most goals", value: "most-goals" },
  { label: "Most matches", value: "most-matches" },
  { label: "Most teams", value: "most-teams" },
];

type Props = { searchParams: Promise<RawSearchParams> };

export default async function TournamentsPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = {
    q: getStringParam(params, "q"),
    yearFrom: getNumberParam(params, "yearFrom", { min: 1900, max: 2100 }),
    yearTo: getNumberParam(params, "yearTo", { min: 1900, max: 2100 }),
    host: getStringParam(params, "host"),
    winner: getStringParam(params, "winner"),
    sort: getEnumParam(params, "sort", SORTS),
  };
  const index = await getTournamentIndex(filters);

  const active = [
    filters.q !== undefined
      ? { param: "q", label: "Search", value: filters.q }
      : null,
    filters.yearFrom !== undefined
      ? { param: "yearFrom", label: "From", value: String(filters.yearFrom) }
      : null,
    filters.yearTo !== undefined
      ? { param: "yearTo", label: "To", value: String(filters.yearTo) }
      : null,
    filters.host !== undefined
      ? { param: "host", label: "Host", value: filters.host }
      : null,
    filters.winner !== undefined
      ? { param: "winner", label: "Winner", value: filters.winner }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <Box>
      <VaultPageHeader
        title="World Cup Tournaments"
        lede="Browse every tournament in the archive, from the earliest editions to the modern era."
        meta={`${formatNumber(index.total)} tournaments in the archive`}
      />

      <PageContainer sx={{ py: { xs: 5, md: 7 } }}>
        <VaultFilterBar
          fields={[
            { kind: "search", placeholder: "Search tournaments…" },
            {
              kind: "select",
              param: "yearFrom",
              label: "From year",
              options: [...index.options.years].reverse(),
              allLabel: "Any",
            },
            {
              kind: "select",
              param: "yearTo",
              label: "To year",
              options: index.options.years,
              allLabel: "Any",
            },
            {
              kind: "select",
              param: "host",
              label: "Host",
              options: index.options.hosts,
              allLabel: "All hosts",
            },
            {
              kind: "select",
              param: "winner",
              label: "Winner",
              options: index.options.winners,
              allLabel: "All winners",
            },
            {
              kind: "select",
              param: "sort",
              label: "Sort",
              options: SORT_OPTIONS,
              allLabel: "Newest first",
            },
          ]}
          active={active}
          resultCount={index.filteredTotal}
          totalCount={index.total}
          resultNoun="tournaments"
        />

        <Box sx={{ mt: 4 }}>
          {index.tournaments.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gap: 3,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "repeat(3, 1fr)",
                },
              }}
            >
              {index.tournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  year={tournament.year}
                  name={tournament.name}
                  host={tournament.hostName}
                  winner={tournament.winner}
                  runnerUp={tournament.runnerUp}
                  finalScore={tournament.finalScore}
                  teamsCount={tournament.teamsCount}
                  matchesCount={tournament.matchesCount}
                  goalsCount={tournament.goalsCount}
                  href={`/tournaments/${tournament.year}`}
                />
              ))}
            </Box>
          ) : index.total === 0 ? (
            <EmptyState
              title="No tournaments yet"
              description="Tournament data has not been imported. Run the data import pipeline and refresh."
            />
          ) : (
            <EmptyState
              title="No tournaments match these filters"
              description="Try a wider year range or clear the filters."
            />
          )}
        </Box>
      </PageContainer>
    </Box>
  );
}
