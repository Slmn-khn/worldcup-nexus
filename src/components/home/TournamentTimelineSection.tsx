// Tournament Timeline (Phase 4). Horizontally scrolling strip of every edition,
// latest-to-oldest, each showing year, host, and champion with a small CSS flag
// indicator. Data-backed (getHomeViewModel → tournament cards) — never
// hardcoded. Pure CSS overflow scroll, server-safe.

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import VaultSection from "@/components/vault/VaultSection";
import EmptyState from "@/components/ui/EmptyState";
import CountryFlag from "@/components/media/CountryFlag";
import { atlas, eyebrowSx, tabularNums } from "@/theme/tokens";
import type { HomeTimelineEntry } from "@/server/home/queries";

export default function TournamentTimelineSection({
  entries,
}: {
  entries: HomeTimelineEntry[];
}) {
  return (
    <VaultSection
      band
      eyebrow="The editions"
      title="Tournament Timeline"
      action={{ label: "All World Cups", href: "/tournaments" }}
    >
      {entries.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            overflowX: "auto",
            border: `1px solid ${atlas.border}`,
            bgcolor: atlas.surfaceSoft,
          }}
          tabIndex={0}
          role="region"
          aria-label="Tournament timeline"
        >
          {entries.map((entry) => (
            <Box
              key={entry.year}
              component={Link}
              href={`/tournaments/${entry.year}`}
              sx={{
                flexShrink: 0,
                minWidth: 168,
                px: 3,
                py: 3,
                borderRight: `1px solid ${atlas.border}`,
                "&:last-of-type": { borderRight: "none" },
                transition: "background-color 150ms ease",
                "&:hover": { bgcolor: atlas.surface1 },
                "&:hover .Timeline-year": { color: atlas.goldStrong },
              }}
            >
              <Typography
                component="p"
                className="Timeline-year"
                sx={{
                  ...tabularNums,
                  fontFamily: atlas.fontDisplay,
                  fontWeight: 700,
                  fontSize: "1.9rem",
                  lineHeight: 1,
                  color: atlas.textPrimary,
                  transition: "color 150ms ease",
                  mb: 1,
                }}
              >
                {entry.year}
              </Typography>
              <Typography
                component="p"
                sx={{
                  ...eyebrowSx,
                  fontSize: "0.62rem",
                  color: atlas.textMuted,
                  whiteSpace: "nowrap",
                  mb: 1.5,
                }}
              >
                {entry.host ?? "Host —"}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", minWidth: 0 }}
              >
                {entry.winner !== null ? (
                  <CountryFlag name={entry.winner} size="xs" />
                ) : (
                  <Box
                    aria-hidden
                    sx={{ width: 5, height: 5, bgcolor: atlas.border }}
                  />
                )}
                <Typography
                  component="span"
                  sx={{
                    fontSize: "0.85rem",
                    color: entry.winner !== null ? atlas.gold : atlas.textMuted,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {entry.winner ?? "—"}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Box>
      ) : (
        <EmptyState
          title="Timeline coming soon"
          description="Tournament data has not been imported yet."
        />
      )}
    </VaultSection>
  );
}
