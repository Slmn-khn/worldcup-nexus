import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate, formatNumber, formatResult } from "@/lib/format";
import type { CountryMatchDto } from "@/server/queries/types";

const PREVIEW_LIMIT = 30;

const RESULT_STYLES: Record<
  CountryMatchDto["result"],
  { color: string; background: string }
> = {
  W: { color: "#22C55E", background: "rgba(34, 197, 94, 0.14)" },
  D: { color: "#CBD5E1", background: "rgba(203, 213, 225, 0.12)" },
  L: { color: "#EF4444", background: "rgba(239, 68, 68, 0.14)" },
};

export default function CountryMatchList({
  matches,
}: {
  matches: CountryMatchDto[];
}) {
  if (matches.length === 0) {
    return (
      <EmptyState
        title="No matches in the archive"
        description="No matches involving this nation are in the imported dataset."
      />
    );
  }

  const visible = matches.slice(0, PREVIEW_LIMIT);

  return (
    <Box>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        {visible.map((match) => (
          <Box
            key={match.id}
            component={Link}
            href={`/matches/${match.slug}`}
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "44px 1fr auto 36px",
                md: "64px 170px 1fr auto 44px",
              },
              alignItems: "center",
              gap: { xs: 1, md: 2 },
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
              sx={{ color: "primary.main", fontWeight: 700 }}
            >
              {match.tournamentYear}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: { xs: "none", md: "block" },
              }}
            >
              {formatDate(match.matchDate) ?? match.stage}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.primary" }}>
              vs {match.opponent}
              <Box
                component="span"
                sx={{
                  color: "text.secondary",
                  display: { xs: "none", md: "inline" },
                }}
              >
                {" "}
                · {match.stage}
              </Box>
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "primary.main",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {match.score}
              {match.penaltyScore !== null
                ? ` (${match.penaltyScore} pens)`
                : ""}
            </Typography>
            <Chip
              label={match.result}
              aria-label={formatResult(match.result)}
              size="small"
              sx={{
                bgcolor: RESULT_STYLES[match.result].background,
                color: RESULT_STYLES[match.result].color,
                fontWeight: 700,
                width: 32,
              }}
            />
          </Box>
        ))}
      </Box>
      {matches.length > PREVIEW_LIMIT ? (
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", display: "block", mt: 1.5 }}
        >
          Showing the {PREVIEW_LIMIT} most recent of{" "}
          {formatNumber(matches.length)} matches. A full match explorer arrives
          in a later checkpoint.
        </Typography>
      ) : null}
    </Box>
  );
}
