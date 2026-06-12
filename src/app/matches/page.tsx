// Matches index page — database-backed, paged Vault archive rows with
// URL-driven archive controls (Checkpoint 7D).

import type { Metadata } from "next";
import Box from "@mui/material/Box";
import PageContainer from "@/components/layout/PageContainer";
import VaultPageHeader from "@/components/vault/VaultPageHeader";
import VaultFilterBar from "@/components/filters/VaultFilterBar";
import VaultPager from "@/components/filters/VaultPager";
import EmptyState from "@/components/ui/EmptyState";
import MatchRowList from "@/components/matches/MatchRowList";
import { formatDate, formatNumber, formatStage } from "@/lib/format";
import {
  getBooleanParam,
  getEnumParam,
  getNumberParam,
  getPaginationParams,
  getStringParam,
  type RawSearchParams,
} from "@/lib/search-params";
import { getMatchCards, getMatchFilterMeta } from "@/server/queries/matches";
import type { MatchSort } from "@/server/queries/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "World Cup Matches",
  description: "Browse World Cup match records in the WORLDCUP Nexus archive.",
};

const SORTS: MatchSort[] = [
  "newest",
  "oldest",
  "highest-scoring",
  "biggest-margin",
];
const SORT_OPTIONS = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Highest scoring", value: "highest-scoring" },
  { label: "Biggest margin", value: "biggest-margin" },
];
const PENALTY_OPTIONS = [
  { label: "Decided on penalties", value: "true" },
  { label: "Not decided on penalties", value: "false" },
];

type Props = { searchParams: Promise<RawSearchParams> };

export default async function MatchesPage({ searchParams }: Props) {
  const params = await searchParams;
  const { page, pageSize } = getPaginationParams(params, {
    defaultPageSize: 30,
    maxPageSize: 100,
  });
  const filters = {
    q: getStringParam(params, "q"),
    tournamentYear: getNumberParam(params, "tournamentYear", {
      min: 1900,
      max: 2100,
    }),
    countrySlug: getStringParam(params, "countrySlug"),
    stage: getStringParam(params, "stage"),
    decidedByPenalties: getBooleanParam(params, "decidedByPenalties"),
    sort: getEnumParam(params, "sort", SORTS),
    page,
    pageSize,
  };

  const [index, meta] = await Promise.all([
    getMatchCards(filters),
    getMatchFilterMeta(),
  ]);

  const countryName =
    meta.options.countries.find(
      (option) => option.value === filters.countrySlug,
    )?.label ?? filters.countrySlug;

  const active = [
    filters.q !== undefined
      ? { param: "q", label: "Search", value: filters.q }
      : null,
    filters.tournamentYear !== undefined
      ? {
          param: "tournamentYear",
          label: "Tournament",
          value: String(filters.tournamentYear),
        }
      : null,
    filters.countrySlug !== undefined
      ? { param: "countrySlug", label: "Country", value: countryName ?? "" }
      : null,
    filters.stage !== undefined
      ? {
          param: "stage",
          label: "Stage",
          value: formatStage(filters.stage) ?? filters.stage,
        }
      : null,
    filters.decidedByPenalties !== undefined
      ? {
          param: "decidedByPenalties",
          label: "Penalties",
          value: filters.decidedByPenalties ? "Yes" : "No",
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  const rows = index.matches.map((match) => ({
    key: match.id,
    year: match.tournamentYear,
    homeName: match.homeTeam.name,
    awayName: match.awayTeam.name,
    score:
      match.penaltyScore !== null
        ? `${match.score} (${match.penaltyScore} pens)`
        : match.score,
    context: [formatStage(match.stage), match.stadiumName]
      .filter((part): part is string => part !== null && part !== undefined)
      .join(" · "),
    note: formatDate(match.matchDate),
    href: match.href,
  }));

  return (
    <Box>
      <VaultPageHeader
        title="World Cup Matches"
        lede="Browse match records from the imported WORLDCUP Nexus database."
        meta={`${formatNumber(index.totalCount)} matches match the current view`}
      />

      <PageContainer sx={{ py: { xs: 5, md: 7 } }}>
        <VaultFilterBar
          fields={[
            { kind: "search", placeholder: "Search matches…" },
            {
              kind: "select",
              param: "tournamentYear",
              label: "Tournament",
              options: meta.options.years,
              allLabel: "All tournaments",
            },
            {
              kind: "select",
              param: "countrySlug",
              label: "Country",
              options: meta.options.countries,
              allLabel: "All countries",
            },
            {
              kind: "select",
              param: "stage",
              label: "Stage",
              options: meta.options.stages.map((option) => ({
                ...option,
                label: formatStage(option.label) ?? option.label,
              })),
              allLabel: "All stages",
            },
            {
              kind: "select",
              param: "decidedByPenalties",
              label: "Shootouts",
              options: PENALTY_OPTIONS,
              allLabel: "All matches",
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
          resultCount={index.totalCount}
          resultNoun="matches"
        />

        <Box sx={{ mt: 4 }}>
          {rows.length > 0 ? (
            <>
              <MatchRowList rows={rows} />
              <VaultPager
                basePath="/matches"
                page={index.page}
                pageSize={index.pageSize}
                filteredTotal={index.totalCount}
                params={params}
              />
            </>
          ) : (
            <EmptyState
              title="No matches found"
              description="No match in the archive fits these filters. Try a different stage, tournament, or search."
            />
          )}
        </Box>
      </PageContainer>
    </Box>
  );
}
