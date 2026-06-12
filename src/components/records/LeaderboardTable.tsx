import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import { formatNumber } from "@/lib/format";
import { atlas, eyebrowSx, tabularNums } from "@/theme/tokens";
import type { RecordLeaderboardDto } from "@/server/queries/types";

/**
 * Leaderboard panel: title strip, then ranked rows with a proportional bar
 * under each entry (scaled to the #1 value). Rank numbers carry the meaning;
 * bars and gold top-3 are reinforcement, never the only indicator.
 */
export default function LeaderboardTable({
  leaderboard,
}: {
  leaderboard: RecordLeaderboardDto;
}) {
  const maxValue = Math.max(
    1,
    ...leaderboard.items.map((item) => item.value),
  );

  return (
    <Box
      sx={{
        border: `1px solid ${atlas.border}`,
        borderRadius: 3,
        background: atlas.cardGradient,
        boxShadow: atlas.shadowSm,
        overflow: "hidden",
        transition: "border-color 180ms ease, box-shadow 180ms ease",
        "&:hover": {
          borderColor: atlas.borderStrong,
          boxShadow: atlas.shadowMd,
        },
      }}
    >
      <Box
        sx={{
          px: 2.5,
          pt: 2,
          pb: 1.5,
          bgcolor: atlas.surface2,
          borderBottom: `1px solid ${atlas.border}`,
        }}
      >
        <Typography
          variant="overline"
          component="p"
          sx={{ ...eyebrowSx, color: "primary.main" }}
        >
          {leaderboard.title}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {leaderboard.description}
        </Typography>
      </Box>

      <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0 }}>
        {leaderboard.items.map((item) => {
          const topThree = item.rank <= 3;
          const barWidth = Math.max(4, (item.value / maxValue) * 100);
          return (
            <Box
              component="li"
              key={`${item.rank}-${item.label}`}
              sx={{
                display: "grid",
                gridTemplateColumns: "34px 1fr auto",
                alignItems: "center",
                columnGap: 1.5,
                px: 2.5,
                py: 1.25,
                borderBottom: `1px solid ${atlas.border}`,
                "&:last-of-type": { borderBottom: "none" },
                transition: "background-color 150ms ease",
                "&:hover": { bgcolor: "rgba(56, 189, 248, 0.04)" },
              }}
            >
              <Typography
                component="span"
                variant="body2"
                sx={{
                  ...tabularNums,
                  color: topThree ? "primary.main" : atlas.textMuted,
                  fontWeight: 700,
                }}
              >
                {item.rank}
              </Typography>
              <Box sx={{ minWidth: 0 }}>
                {item.href !== null ? (
                  <Typography
                    component={Link}
                    href={item.href}
                    variant="body2"
                    sx={{
                      color: "text.primary",
                      fontWeight: 600,
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    {item.label}
                  </Typography>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: "text.primary", fontWeight: 600 }}
                  >
                    {item.label}
                  </Typography>
                )}
                {item.detail !== null ? (
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", display: "block" }}
                  >
                    {item.detail}
                  </Typography>
                ) : null}
                {/* Proportional bar, scaled to the leaderboard's #1 value. */}
                <Box
                  aria-hidden
                  sx={{
                    mt: 0.75,
                    height: 3,
                    borderRadius: 1,
                    bgcolor: atlas.surface2,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${barWidth}%`,
                      height: "100%",
                      borderRadius: 1,
                      bgcolor: topThree ? atlas.gold : atlas.textMuted,
                      opacity: topThree ? 0.85 : 0.4,
                    }}
                  />
                </Box>
              </Box>
              <Typography
                component="span"
                variant="body2"
                sx={{
                  ...tabularNums,
                  color: "primary.main",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  alignSelf: "start",
                  pt: 0.25,
                }}
              >
                {formatNumber(item.value)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
