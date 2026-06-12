// Matches index page — database-backed via the query layer. Vault archive
// rows (year — teams — score — venue) instead of a generic card grid.

import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PageContainer from "@/components/layout/PageContainer";
import VaultPageHeader from "@/components/vault/VaultPageHeader";
import EmptyState from "@/components/ui/EmptyState";
import MatchRowList from "@/components/matches/MatchRowList";
import { formatDate, formatNumber, formatStage } from "@/lib/format";
import { getMatchCards } from "@/server/queries/matches";
import { atlas } from "@/theme/tokens";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "World Cup Matches",
  description: "Browse World Cup match records in the WorldCup Atlas archive.",
};

export default async function MatchesPage() {
  const { matches, totalCount } = await getMatchCards();

  const rows = matches.map((match) => ({
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
        lede="Browse match records from the imported WorldCup Atlas database."
        meta={`${formatNumber(totalCount)} matches in the archive`}
      />

      <PageContainer sx={{ py: { xs: 6, md: 10 } }}>
        {rows.length > 0 ? (
          <>
            <MatchRowList rows={rows} />
            {totalCount > matches.length ? (
              <Typography
                variant="caption"
                sx={{ color: atlas.textMuted, display: "block", mt: 2.5 }}
              >
                Showing the {formatNumber(matches.length)} most recent of{" "}
                {formatNumber(totalCount)} matches. Browse a tournament for its
                full match list, or use the Explorer for filters and search.
              </Typography>
            ) : null}
          </>
        ) : (
          <EmptyState
            title="No matches yet"
            description="Match data has not been imported. Run the data import pipeline and refresh."
          />
        )}
      </PageContainer>
    </Box>
  );
}
