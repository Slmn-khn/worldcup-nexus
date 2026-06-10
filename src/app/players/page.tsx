// Players index page (Checkpoint 5E) — database-backed via the query layer.
// Advanced search/filtering arrives with global search and the data explorer.

import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PageContainer from "@/components/layout/PageContainer";
import EmptyState from "@/components/ui/EmptyState";
import PlayerCard from "@/components/players/PlayerCard";
import StaggerContainer from "@/components/motion/StaggerContainer";
import { formatNumber } from "@/lib/format";
import { getPlayerCards, getPlayerCount } from "@/server/queries/players";

export const dynamic = "force-dynamic";

const PREVIEW_LIMIT = 60;

export const metadata: Metadata = {
  title: "World Cup Players",
  description: "Explore World Cup players in the WorldCup Atlas archive.",
};

export default async function PlayersPage() {
  const [players, totalCount] = await Promise.all([
    getPlayerCards({ take: PREVIEW_LIMIT }),
    getPlayerCount(),
  ]);

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
            World Cup Players
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{ color: "text.secondary", fontWeight: 400, maxWidth: 640 }}
          >
            Explore players recorded across World Cup squads, goals, cards,
            penalties, and awards.
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 2.5 }}>
            {formatNumber(totalCount)} players in the archive
          </Typography>
        </PageContainer>
      </Box>

      <PageContainer sx={{ py: { xs: 5, md: 7 } }}>
        {players.length > 0 ? (
          <>
            <StaggerContainer
              stagger={0.03}
              sx={{
                display: "grid",
                gap: 2.5,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
              }}
            >
              {players.map((player) => (
                <PlayerCard
                  key={player.id}
                  name={player.name}
                  country={player.countryName ?? "Nation unknown"}
                  flagEmoji={player.countryFlagEmoji}
                  position={player.position}
                  selectedTournamentsCount={player.selectedTournamentsCount}
                  goalsCount={player.goalsCount}
                  awardsCount={player.awardsCount}
                  href={`/players/${player.slug}`}
                />
              ))}
            </StaggerContainer>
            {totalCount > players.length ? (
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", display: "block", mt: 2.5 }}
              >
                Showing the first {formatNumber(players.length)} of{" "}
                {formatNumber(totalCount)} players alphabetically. Search and
                filters arrive with the global search checkpoint.
              </Typography>
            ) : null}
          </>
        ) : (
          <EmptyState
            title="No players yet"
            description="Player data has not been imported. Run the data import pipeline and refresh."
          />
        )}
      </PageContainer>
    </Box>
  );
}
