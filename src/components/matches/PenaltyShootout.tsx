import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import type {
  MatchDetailDto,
  MatchPenaltyKickDto,
} from "@/server/queries/types";

function KickRow({
  kick,
  index,
}: {
  kick: MatchPenaltyKickDto;
  index: number;
}) {
  const outcome = kick.converted
    ? "converted"
    : kick.isSaved
      ? "saved"
      : kick.isMissed
        ? "missed"
        : "not converted";
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1,
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:last-of-type": { borderBottom: "none" },
      }}
    >
      <Typography
        component="span"
        aria-label={outcome}
        sx={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.8rem",
          fontWeight: 700,
          flexShrink: 0,
          bgcolor: kick.converted
            ? "rgba(163, 230, 53, 0.16)"
            : "rgba(239, 68, 68, 0.16)",
          color: kick.converted ? "#A3E635" : "#EF4444",
        }}
      >
        {kick.converted ? "✓" : "✕"}
      </Typography>
      {/* Kick order is not in the source (ISSUE-008) — rows follow source file order. */}
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", width: 20, flexShrink: 0 }}
      >
        {kick.order ?? index + 1}
      </Typography>
      {kick.playerName !== null && kick.playerSlug !== null ? (
        <Typography
          component={Link}
          href={`/players/${kick.playerSlug}`}
          variant="body2"
          sx={{
            color: "text.primary",
            fontWeight: 600,
            "&:hover": { color: "primary.main" },
          }}
        >
          {kick.playerName}
        </Typography>
      ) : (
        <Typography
          variant="body2"
          sx={{ color: "text.primary", fontWeight: 600 }}
        >
          {kick.playerName ?? "Unknown taker"}
        </Typography>
      )}
    </Box>
  );
}

/**
 * Shootout kicks grouped by team. Rendered only when the match was decided
 * by penalties or shootout kicks exist — never invents data.
 */
export default function PenaltyShootout({ match }: { match: MatchDetailDto }) {
  const shootoutKicks = match.penaltyKicks.filter(
    (kick) => kick.type === "SHOOTOUT",
  );

  if (shootoutKicks.length === 0) {
    if (!match.decidedByPenalties) return null;
    return (
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        Penalty shootout details are not available in the imported dataset for
        this match.
      </Typography>
    );
  }

  const teams = [match.homeTeam.name, match.awayTeam.name];
  const tallies: Record<string, number | null> = {
    [match.homeTeam.name]: match.homeScorePenalties,
    [match.awayTeam.name]: match.awayScorePenalties,
  };

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2.5,
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
      }}
    >
      {teams.map((teamName) => {
        const kicks = shootoutKicks.filter(
          (kick) => kick.teamName === teamName,
        );
        return (
          <Box key={teamName}>
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "baseline",
                mb: 1,
              }}
            >
              <Typography
                variant="overline"
                sx={{ color: "primary.main", letterSpacing: "0.14em" }}
              >
                {teamName}
              </Typography>
              {tallies[teamName] !== null ? (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {tallies[teamName]} converted
                </Typography>
              ) : null}
            </Stack>
            {kicks.length > 0 ? (
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  overflow: "hidden",
                }}
              >
                {kicks.map((kick, index) => (
                  <KickRow key={index} kick={kick} index={index} />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                No kicks recorded for this team.
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
