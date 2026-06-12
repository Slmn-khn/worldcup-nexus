// Players index page — database-backed via the query layer.

import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PageContainer from "@/components/layout/PageContainer";
import VaultPageHeader from "@/components/vault/VaultPageHeader";
import EmptyState from "@/components/ui/EmptyState";
import PlayerCard from "@/components/players/PlayerCard";
import { formatNumber } from "@/lib/format";
import { getPlayerCards, getPlayerCount } from "@/server/queries/players";
import { atlas } from "@/theme/tokens";

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
      <VaultPageHeader
        title="World Cup Players"
        lede="Explore players recorded across World Cup squads, goals, cards, penalties, and awards."
        meta={`${formatNumber(totalCount)} players in the archive`}
      />

      <PageContainer sx={{ py: { xs: 6, md: 10 } }}>
        {players.length > 0 ? (
          <>
            <Box
              sx={{
                display: "grid",
                gap: 3,
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
            </Box>
            {totalCount > players.length ? (
              <Typography
                variant="caption"
                sx={{ color: atlas.textMuted, display: "block", mt: 2.5 }}
              >
                Showing the first {formatNumber(players.length)} of{" "}
                {formatNumber(totalCount)} players alphabetically. Use global
                search or the Explorer to find a specific player.
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
