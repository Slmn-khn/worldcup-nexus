// Data Explorer shell (Checkpoint 5G) — database-backed via the query layer.
// Server component fetches normalized rows; the Data Grid and filters are
// client components driven by URL query params. No RawSourceRecord exposure.

import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import PageContainer from "@/components/layout/PageContainer";
import EmptyState from "@/components/ui/EmptyState";
import ExplorerFilters from "@/components/explorer/ExplorerFilters";
import ExplorerTable from "@/components/explorer/ExplorerTable";
import ExplorerSummary from "@/components/explorer/ExplorerSummary";
import { getExplorerData } from "@/server/queries/explorer";
import {
  parseExplorerOptions,
  searchParamsGetter,
} from "@/server/queries/parseExplorerParams";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Data Explorer — WorldCup Atlas",
  description:
    "Browse imported World Cup records and events across tournaments, matches, players, and teams.",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ExplorerPage({ searchParams }: Props) {
  const params = await searchParams;
  const data = await getExplorerData(
    parseExplorerOptions(searchParamsGetter(params)),
  );

  return (
    <Box>
      <Box
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          background:
            "radial-gradient(ellipse 70% 70% at 80% -20%, rgba(244, 201, 93, 0.1), transparent), #06111F",
        }}
      >
        <PageContainer sx={{ py: { xs: 6, md: 8 } }}>
          <Typography
            variant="overline"
            sx={{
              color: "primary.main",
              letterSpacing: "0.2em",
              display: "block",
              mb: 1.5,
            }}
          >
            The Archive
          </Typography>
          <Typography
            variant="h2"
            component="h1"
            sx={{ fontSize: { xs: "2rem", md: "2.75rem" }, mb: 1.5 }}
          >
            Data Explorer
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{ color: "text.secondary", fontWeight: 400, maxWidth: 680 }}
          >
            Browse imported World Cup records and events across tournaments,
            matches, players, and teams.
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>
            This explorer uses normalized imported data. Raw source rows are not
            exposed.
          </Typography>
        </PageContainer>
      </Box>

      <PageContainer sx={{ py: { xs: 4, md: 5 } }}>
        <Stack spacing={2.5}>
          <ExplorerFilters
            filters={data.filters}
            active={data.activeFilters}
            currentPageSize={data.pageSize}
          />
          <ExplorerSummary
            total={data.total}
            page={data.page}
            pageSize={data.pageSize}
            active={data.activeFilters}
          />
          {data.rows.length > 0 ? (
            <ExplorerTable
              rows={data.rows}
              total={data.total}
              page={data.page}
              pageSize={data.pageSize}
            />
          ) : (
            <EmptyState
              title="No rows match these filters"
              description="Try a different event type or tournament, or clear the filters."
            />
          )}
        </Stack>
      </PageContainer>
    </Box>
  );
}
