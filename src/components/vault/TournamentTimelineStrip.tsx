// The Tournament Timeline (PDF page 2): a horizontally scrolling strip of
// every edition — condensed year over an uppercase champion label, divided
// by hairlines. Pure CSS overflow scroll, server-safe, data-backed.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import { atlas, eyebrowSx, tabularNums } from "@/theme/tokens";

export type TimelineEntry = {
  year: number;
  /** Champion name, when the archive records one. */
  winner: string | null;
};

export default function TournamentTimelineStrip({
  entries,
}: {
  entries: TimelineEntry[];
}) {
  return (
    <Box
      sx={{
        display: "flex",
        overflowX: "auto",
        border: `1px solid ${atlas.border}`,
        bgcolor: atlas.canvasSoft,
        // Keep the scrollbar visible — it signals the strip scrolls.
        pb: 0,
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
            minWidth: 132,
            px: 3,
            py: 2.5,
            borderRight: `1px solid ${atlas.border}`,
            "&:last-of-type": { borderRight: "none" },
            transition: "background-color 150ms ease",
            "&:hover": { bgcolor: atlas.surface1 },
            "&:hover .TimelineStrip-year": { color: atlas.goldStrong },
          }}
        >
          <Typography
            component="p"
            className="TimelineStrip-year"
            sx={{
              ...tabularNums,
              fontFamily: atlas.fontDisplay,
              fontWeight: 700,
              fontSize: "1.6rem",
              lineHeight: 1,
              color: atlas.textPrimary,
              transition: "color 150ms ease",
              mb: 1,
            }}
          >
            {entry.year}
          </Typography>
          <Box aria-hidden sx={{ width: 5, height: 5, bgcolor: atlas.border, mb: 1 }} />
          <Typography
            component="p"
            sx={{
              ...eyebrowSx,
              fontSize: "0.66rem",
              color: atlas.textMuted,
              whiteSpace: "nowrap",
            }}
          >
            {entry.winner ?? "—"}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
