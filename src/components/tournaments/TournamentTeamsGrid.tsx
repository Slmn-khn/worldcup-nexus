import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import EmptyState from "@/components/ui/EmptyState";
import type { TournamentTeamDto } from "@/server/queries/types";

export default function TournamentTeamsGrid({
  teams,
}: {
  teams: TournamentTeamDto[];
}) {
  if (teams.length === 0) {
    return (
      <EmptyState
        title="No teams in the archive"
        description="Team data for this tournament has not been imported yet."
      />
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.5,
        gridTemplateColumns: {
          xs: "1fr 1fr",
          sm: "repeat(3, 1fr)",
          md: "repeat(4, 1fr)",
        },
      }}
    >
      {teams.map((team) => (
        <Box
          key={team.id}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            px: 2,
            py: 1.25,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1.5,
            bgcolor: "background.paper",
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "text.primary", fontWeight: 600 }}
          >
            {team.name}
          </Typography>
          {team.code !== null ? (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {team.code}
            </Typography>
          ) : null}
        </Box>
      ))}
    </Box>
  );
}
