import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import EmptyState from "@/components/ui/EmptyState";
import type { AwardDto } from "@/server/queries/types";

export default function TournamentAwards({ awards }: { awards: AwardDto[] }) {
  if (awards.length === 0) {
    return (
      <EmptyState
        title="No awards in the archive"
        description="Award data for this tournament has not been imported yet."
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
          key={`${award.name}-${index}`}
          sx={{ bgcolor: "background.paper" }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Typography
              variant="overline"
              sx={{
                color: "primary.main",
                letterSpacing: "0.12em",
                display: "block",
                mb: 0.75,
              }}
            >
              {award.name}
            </Typography>
            {award.playerName !== null && award.playerSlug !== null ? (
              <Typography
                component={Link}
                href={`/players/${award.playerSlug}`}
                variant="body2"
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  display: "block",
                  "&:hover": { color: "primary.main" },
                }}
              >
                {award.playerName}
              </Typography>
            ) : award.playerName !== null ? (
              <Typography
                variant="body2"
                sx={{ color: "text.primary", fontWeight: 600 }}
              >
                {award.playerName}
              </Typography>
            ) : null}
            {award.teamName !== null ? (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {award.teamName}
              </Typography>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
