import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import CountryFlag from "@/components/media/CountryFlag";
import EmptyState from "@/components/ui/EmptyState";
import { formatNumber } from "@/lib/format";
import type { TopScorerDto } from "@/server/queries/types";

export default function TournamentTopScorers({
  scorers,
}: {
  scorers: TopScorerDto[];
}) {
  if (scorers.length === 0) {
    return (
      <EmptyState
        title="No goal data"
        description="Goal events for this tournament have not been imported yet."
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
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              component={Link}
              href={`/players/${scorer.slug}`}
              variant="body2"
              sx={{
                color: "text.primary",
                fontWeight: 600,
                display: "block",
                "&:hover": { color: "primary.main" },
              }}
            >
              {scorer.name}
            </Typography>
            {scorer.countryName !== null ? (
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ alignItems: "center", minWidth: 0, mt: 0.25 }}
              >
                <CountryFlag name={scorer.countryName} size="xs" />
                <Typography
                  noWrap
                  variant="caption"
                  sx={{ color: "text.secondary" }}
                >
                  {scorer.countryName}
                </Typography>
              </Stack>
            ) : null}
          </Box>
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
