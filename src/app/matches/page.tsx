// Matches index page (Checkpoint 5F.1) — database-backed via the query layer.
// Fixes the navbar /matches link, which previously had no route. Advanced
// filtering arrives with the data explorer.

import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PageContainer from "@/components/layout/PageContainer";
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
      <Box
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          background:
            "radial-gradient(ellipse 70% 70% at 80% -20%, rgba(244, 201, 93, 0.1), transparent), #06111F",
        }}
      >
        <PageContainer sx={{ py: { xs: 6, md: 9 } }}>
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
            World Cup Matches
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{ color: "text.secondary", fontWeight: 400, maxWidth: 640 }}
          >
            Browse match records from the imported WorldCup Atlas database.
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 2.5 }}>
            {formatNumber(totalCount)} matches in the archive
          </Typography>
        </PageContainer>
      </Box>

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
