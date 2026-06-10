import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import EmptyState from "@/components/ui/EmptyState";
import type { CountryMatchDto } from "@/server/queries/types";

/**
 * Finals derived from "final" stage matches only. Titles without a single
 * final match (1950's final round) appear in the timeline/stats instead —
 * nothing here is inferred.
 */
export default function CountryFinals({
  finals,
}: {
  finals: CountryMatchDto[];
}) {
  if (finals.length === 0) {
    return (
      <EmptyState
        title="No finals in the archive"
        description="This nation has no 'final' stage matches in the imported dataset."
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
      {finals.map((final) => (
        <Box
          key={final.id}
          component={Link}
          href={`/matches/${final.slug}`}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "56px 1fr auto auto",
              md: "80px 1fr auto 120px",
            },
            alignItems: "center",
            gap: 2,
            px: 2,
            py: 1.5,
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
            {final.tournamentYear}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.primary" }}>
            vs {final.opponent}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "primary.main",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {final.score}
            {final.penaltyScore !== null ? ` (${final.penaltyScore} pens)` : ""}
          </Typography>
          <Chip
            label={
              final.result === "W"
                ? "Won"
                : final.result === "D"
                  ? "Drawn"
                  : "Lost"
            }
            size="small"
            sx={
              final.result === "W"
                ? {
                    bgcolor: "primary.main",
                    color: "#06111F",
                    fontWeight: 700,
                    justifySelf: "end",
                  }
                : {
                    bgcolor: "rgba(239, 68, 68, 0.14)",
                    color: "#EF4444",
                    fontWeight: 700,
                    justifySelf: "end",
                  }
            }
          />
        </Box>
      ))}
    </Box>
  );
}
