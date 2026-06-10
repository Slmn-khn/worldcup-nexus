import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/format";
import type { MatchCardDto } from "@/server/queries/types";

/** Groups matches by stage, preserving first-appearance (chronological) order. */
function groupByStage(
  matches: MatchCardDto[],
): { stage: string; matches: MatchCardDto[] }[] {
  const groups = new Map<string, MatchCardDto[]>();
  for (const match of matches) {
    const group = groups.get(match.stage) ?? [];
    group.push(match);
    groups.set(match.stage, group);
  }
  return [...groups.entries()].map(([stage, stageMatches]) => ({
    stage,
    matches: stageMatches,
  }));
}

function MatchRow({ match }: { match: MatchCardDto }) {
  const date = formatDate(match.matchDate);
  return (
    <Box
      component={Link}
      href={`/matches/${match.slug}`}
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr auto", md: "150px 1fr auto 220px" },
        gap: { xs: 1, md: 2 },
        alignItems: "center",
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
        variant="caption"
        sx={{ color: "text.secondary", display: { xs: "none", md: "block" } }}
      >
        {date ?? "Date unknown"}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.primary" }}>
        {match.homeTeam.name}{" "}
        <Box component="span" sx={{ color: "text.secondary" }}>
          v
        </Box>{" "}
        {match.awayTeam.name}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "primary.main", fontWeight: 700, whiteSpace: "nowrap" }}
      >
        {match.score}
        {match.penaltyScore !== null ? ` (${match.penaltyScore} pens)` : ""}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          display: { xs: "none", md: "block" },
          textAlign: "right",
        }}
      >
        {match.stadiumName ?? ""}
      </Typography>
    </Box>
  );
}

export default function TournamentMatchList({
  matches,
}: {
  matches: MatchCardDto[];
}) {
  if (matches.length === 0) {
    return (
      <EmptyState
        title="No matches in the archive"
        description="Match data for this tournament has not been imported yet."
      />
    );
  }

  return (
    <Stack spacing={3}>
      {groupByStage(matches).map(({ stage, matches: stageMatches }) => (
        <Box key={stage}>
          <Typography
            variant="overline"
            sx={{
              color: "primary.main",
              letterSpacing: "0.14em",
              display: "block",
              mb: 1,
            }}
          >
            {stage} · {stageMatches.length}{" "}
            {stageMatches.length === 1 ? "match" : "matches"}
          </Typography>
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "background.paper",
              overflow: "hidden",
            }}
          >
            {stageMatches.map((match) => (
              <MatchRow key={match.id} match={match} />
            ))}
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
