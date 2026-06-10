import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import EmptyState from "@/components/ui/EmptyState";
import type { PlayerAwardDto } from "@/server/queries/types";

export default function PlayerAwards({ awards }: { awards: PlayerAwardDto[] }) {
  if (awards.length === 0) {
    return (
      <EmptyState
        title="No awards"
        description="No tournament awards for this player are in the imported dataset."
      />
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr 1fr",
          sm: "repeat(3, 1fr)",
          md: "repeat(4, 1fr)",
        },
      }}
    >
      {awards.map((award, index) => (
        <Card
          key={`${award.tournamentYear}-${award.name}-${index}`}
          sx={{ bgcolor: "background.paper" }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Typography
              variant="overline"
              sx={{
                color: "primary.main",
                letterSpacing: "0.12em",
                display: "block",
                mb: 0.5,
              }}
            >
              {award.name}
            </Typography>
            <Typography
              component={Link}
              href={`/tournaments/${award.tournamentYear}`}
              variant="body2"
              sx={{
                color: "text.primary",
                fontWeight: 600,
                display: "block",
                "&:hover": { color: "primary.main" },
              }}
            >
              {award.tournamentYear}
            </Typography>
            {award.teamName !== null ? (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {award.teamName}
              </Typography>
            ) : null}
            {award.description !== null ? (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 0.5 }}
              >
                {award.description}
              </Typography>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
