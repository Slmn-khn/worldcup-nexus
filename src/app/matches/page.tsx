// Matches index page (Checkpoint 5F.1) — database-backed via the query layer.
// Fixes the navbar /matches link, which previously had no route. Advanced
// filtering arrives with the data explorer.

import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import MatchCard from "@/components/matches/MatchCard";
import StaggerContainer from "@/components/motion/StaggerContainer";
import { formatDate, formatNumber } from "@/lib/format";
import { getMatchCards } from "@/server/queries/matches";
import type { MatchIndexItemDto } from "@/server/queries/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "World Cup Matches",
  description: "Browse World Cup match records in the WorldCup Atlas archive.",
};

function matchSummary(match: MatchIndexItemDto): string | undefined {
  const parts = [formatDate(match.matchDate), match.stadiumName].filter(
    (part): part is string => part !== null,
  );
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

export default async function MatchesPage() {
  const { matches, totalCount } = await getMatchCards();

  return (
    <Box>
      <PageHeader
        title="World Cup Matches"
        lede="Browse match records from the imported WorldCup Atlas database."
        meta={`${formatNumber(totalCount)} matches in the archive`}
      />

      <PageContainer sx={{ py: { xs: 5, md: 7 } }}>
        {matches.length > 0 ? (
          <>
            <StaggerContainer
              stagger={0.04}
              sx={{
                display: "grid",
                gap: 2.5,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "repeat(3, 1fr)",
                },
              }}
            >
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  title={`${match.homeTeam.name} v ${match.awayTeam.name}`}
                  tournament={match.tournamentName}
                  score={
                    match.penaltyScore !== null
                      ? `${match.score} (${match.penaltyScore} pens)`
                      : match.score
                  }
                  stage={match.stage}
                  summary={matchSummary(match)}
                  href={match.href}
                />
              ))}
            </StaggerContainer>
            {totalCount > matches.length ? (
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", display: "block", mt: 2.5 }}
              >
                Showing the {formatNumber(matches.length)} most recent of{" "}
                {formatNumber(totalCount)} matches. Browse a tournament for its
                full match list — filters and search arrive with the data
                explorer.
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
