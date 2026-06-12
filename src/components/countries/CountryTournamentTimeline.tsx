import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import EmptyState from "@/components/ui/EmptyState";
import FadeIn from "@/components/motion/FadeIn";
import type { CountryParticipationDto } from "@/server/queries/types";

/**
 * One row per tournament entered. Result chips come only from tournament
 * winner/runner-up fields — finishes are never invented; other entries just
 * read "Participated".
 */
export default function CountryTournamentTimeline({
  participations,
}: {
  participations: CountryParticipationDto[];
}) {
  if (participations.length === 0) {
    return (
      <EmptyState
        title="No tournament entries"
        description="This nation has no tournament participations in the imported dataset."
      />
    );
  }

  return (
    <FadeIn>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        {participations.map((entry) => (
          <Box
            key={`${entry.tournamentYear}-${entry.teamId}`}
            component={Link}
            href={`/tournaments/${entry.tournamentYear}`}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "64px 1fr auto", md: "80px 1fr auto" },
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
              {entry.tournamentYear}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.primary" }}>
              {entry.tournamentName}
            </Typography>
            {entry.result !== null ? (
              <Chip
                label={entry.result}
                size="small"
                sx={
                  entry.result === "Champions"
                    ? {
                        bgcolor: "primary.main",
                        color: "#06111F",
                        fontWeight: 700,
                      }
                    : {
                        color: "text.primary",
                        borderColor: "divider",
                        fontWeight: 600,
                      }
                }
                variant={entry.result === "Champions" ? "filled" : "outlined"}
              />
            ) : (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Participated
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </FadeIn>
  );
}
