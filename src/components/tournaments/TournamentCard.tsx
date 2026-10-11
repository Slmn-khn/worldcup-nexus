// Tournament card (PDF page 3): top band with huge condensed year + host
// over a faint decorative host map, winner/final/runner-up blocks,
// "VIEW TOURNAMENT →" text link. Zero radius, hairline borders, no shadow.

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import TournamentHostMap from "@/components/maps/hostMap/TournamentHostMap";
import type { HostIdentity } from "@/components/maps/hostMap/config";
import { formatNumber } from "@/lib/format";
import {
  atlas,
  eyebrowSx,
  interactiveCardSx,
  tabularNums,
  textLinkSx,
} from "@/theme/tokens";

type TournamentCardProps = {
  year: number;
  name?: string | null;
  host?: string | null;
  /** Canonical host countries — drive the decorative header map. */
  hostCountries?: readonly HostIdentity[];
  winner?: string | null;
  runnerUp?: string | null;
  finalScore?: string | null;
  teamsCount?: number | null;
  matchesCount?: number | null;
  goalsCount?: number | null;
  summary?: string | null;
  href?: string;
};

export default function TournamentCard({
  year,
  name,
  host,
  hostCountries = [],
  winner,
  runnerUp,
  finalScore,
  teamsCount,
  matchesCount,
  goalsCount,
  summary,
  href,
}: TournamentCardProps) {
  const counts = [
    teamsCount != null ? `${formatNumber(teamsCount)} teams` : null,
    matchesCount != null ? `${formatNumber(matchesCount)} matches` : null,
    goalsCount != null ? `${formatNumber(goalsCount)} goals` : null,
  ].filter((part): part is string => part !== null);

  return (
    <Box
      component={Link}
      href={href ?? `/tournaments/${year}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: atlas.surface1,
        border: `1px solid ${atlas.border}`,
        ...interactiveCardSx,
      }}
    >
      {/* Top band: year + host over the decorative host map */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          bgcolor: atlas.canvasSoft,
          borderBottom: `1px solid ${atlas.border}`,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 2,
          // Map layers stay inside this band and never bleed into the body.
          position: "relative",
          overflow: "hidden",
          isolation: "isolate",
          "& > p": { position: "relative", zIndex: 1 },
        }}
      >
        <TournamentHostMap year={year} hosts={hostCountries} variant="archive-card" />
        {/* Readability layer: clears the map behind the year (left) and host (right). */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(90deg, rgba(3,16,28,0.92) 0%, rgba(3,16,28,0.55) 26%, rgba(3,16,28,0) 44%, rgba(3,16,28,0) 62%, rgba(3,16,28,0.6) 84%, rgba(3,16,28,0.85) 100%), linear-gradient(0deg, rgba(3,16,28,0.7) 0%, rgba(3,16,28,0) 55%)",
          }}
        />
        <Typography
          component="p"
          sx={{
            ...tabularNums,
            fontFamily: atlas.fontDisplay,
            fontWeight: 700,
            fontSize: "2.6rem",
            lineHeight: 1,
            color: atlas.textPrimary,
          }}
        >
          {year}
        </Typography>
        {host ? (
          <Typography
            component="p"
            sx={{ ...eyebrowSx, color: atlas.textSecondary }}
          >
            {host}
          </Typography>
        ) : null}
      </Box>

      <Box sx={{ p: 3, display: "flex", flexDirection: "column", flexGrow: 1 }}>
        {winner ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              columnGap: 2,
              rowGap: 1.5,
            }}
          >
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Box
                  aria-hidden
                  sx={{ width: 5, height: 5, bgcolor: atlas.gold }}
                />
                <Typography sx={{ ...eyebrowSx, color: atlas.textMuted }}>
                  Winner
                </Typography>
              </Stack>
              <Typography
                sx={{ color: atlas.textPrimary, fontWeight: 600, mt: 0.5 }}
              >
                {winner}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ ...eyebrowSx, color: atlas.textMuted }}>
                Final
              </Typography>
              <Typography
                sx={{
                  ...tabularNums,
                  fontFamily: atlas.fontDisplay,
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  lineHeight: 1.1,
                  color: atlas.textPrimary,
                  mt: 0.25,
                }}
              >
                {finalScore ?? "—"}
              </Typography>
            </Box>
            {runnerUp ? (
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Typography sx={{ ...eyebrowSx, color: atlas.textMuted }}>
                  Runner-up
                </Typography>
                <Typography
                  sx={{ color: atlas.textSecondary, fontWeight: 300, mt: 0.5 }}
                >
                  {runnerUp}
                </Typography>
              </Box>
            ) : null}
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: atlas.textMuted }}>
            Result not yet in the archive
          </Typography>
        )}

        {name ? (
          <Typography
            variant="caption"
            sx={{ color: atlas.textMuted, display: "block", mt: 2 }}
          >
            {name}
          </Typography>
        ) : null}
        {counts.length > 0 ? (
          <Typography
            variant="caption"
            sx={{ ...tabularNums, color: atlas.textMuted, display: "block", mt: 0.5 }}
          >
            {counts.join(" · ")}
          </Typography>
        ) : null}
        {summary ? (
          <Typography variant="body2" sx={{ color: atlas.textSecondary, mt: 1.5 }}>
            {summary}
          </Typography>
        ) : null}

        <Box
          sx={{
            ...textLinkSx,
            mt: "auto",
            pt: 2.5,
            borderTop: `1px solid ${atlas.border}`,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box component="span">View tournament</Box>
          <Box component="span" aria-hidden>
            →
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
