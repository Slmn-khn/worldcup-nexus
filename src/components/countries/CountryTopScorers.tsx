import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import EmptyState from "@/components/ui/EmptyState";
import { formatNumber } from "@/lib/format";
import type { TopScorerDto } from "@/server/queries/types";

export default function CountryTopScorers({
  scorers,
}: {
  scorers: TopScorerDto[];
}) {
  if (scorers.length === 0) {
    return (
      <EmptyState
        title="No goal data"
        description="No goals for this nation are in the imported dataset."
      />
    );
  }

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 0,
        bgcolor: "background.paper",
        overflow: "hidden",
        maxWidth: 560,
      }}
    >
      {scorers.map((scorer, index) => (
        <Box
          key={scorer.playerId}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: 2.5,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            "&:last-of-type": { borderBottom: "none" },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "primary.main",
              fontWeight: 700,
              width: 24,
              flexShrink: 0,
            }}
          >
            {index + 1}
          </Typography>
          <Typography
            component={Link}
            href={`/players/${scorer.slug}`}
            variant="body2"
            sx={{
              color: "text.primary",
              fontWeight: 600,
              flexGrow: 1,
              "&:hover": { color: "primary.main" },
            }}
          >
            {scorer.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "primary.main", fontWeight: 700 }}
          >
            {formatNumber(scorer.goals)} {scorer.goals === 1 ? "goal" : "goals"}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
