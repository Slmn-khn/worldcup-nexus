import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import EmptyState from "@/components/ui/EmptyState";
import type { PlayerSquadTournamentDto } from "@/server/queries/types";

/**
 * Squad selections per tournament — deliberately NOT labeled "appearances":
 * being in a squad does not imply playing a match.
 */
export default function PlayerTournamentHistory({
  squads,
}: {
  squads: PlayerSquadTournamentDto[];
}) {
  if (squads.length === 0) {
    return (
      <EmptyState
        title="No squad selections"
        description="This player has no tournament squad entries in the imported dataset."
      />
    );
  }

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      {squads.map((squad) => (
        <Box
          key={`${squad.tournamentYear}-${squad.teamName}`}
          component={Link}
          href={`/tournaments/${squad.tournamentYear}`}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "56px 1fr auto",
              md: "72px 1fr auto auto",
            },
            alignItems: "center",
            gap: 2,
            px: 2,
            py: 1.25,
            borderBottom: "1px solid",
            borderColor: "divider",
            transition: "background-color 120ms ease",
            "&:hover": { bgcolor: "rgba(248, 250, 252, 0.04)" },
            "&:last-of-type": { borderBottom: "none" },
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "primary.main", fontWeight: 700 }}
          >
            {squad.tournamentYear}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.primary" }}>
            {squad.teamName}
            {squad.position !== null ? (
              <Box component="span" sx={{ color: "text.secondary" }}>
                {" "}
                · {squad.position}
              </Box>
            ) : null}
          </Typography>
          {squad.isCaptain ? (
            <Chip
              label="Captain"
              size="small"
              sx={{
                bgcolor: "primary.main",
                color: "#06111F",
                fontWeight: 700,
              }}
            />
          ) : (
            <Box sx={{ display: { xs: "none", md: "block" } }} />
          )}
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", textAlign: "right", minWidth: 48 }}
          >
            {squad.shirtNumber !== null ? `#${squad.shirtNumber}` : ""}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
