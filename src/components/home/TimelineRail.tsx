"use client";

// Horizontal timeline rail (client). Glowing year-cards separated by chevrons,
// with hold-and-drag mouse scrolling (native touch scroll preserved). Generous
// vertical padding keeps the hover lift + glow from being clipped by the scroll
// container; the hover effect is a safe translateY (no aggressive scale).

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import Link from "@/components/Link";
import GlowCard from "@/components/ui/GlowCard";
import CountryFlag from "@/components/media/CountryFlag";
import { useDragScroll } from "@/hooks/useDragScroll";
import { atlas } from "@/theme/tokens";
import {
  atlasColors,
  atlasGlow,
  accentTextSx,
  type AtlasAccent,
} from "@/theme/visualTokens";
import type { HomeTimelineEntry } from "@/server/home/queries";

const CARD_WIDTH = { xs: 160, sm: 176, md: 190 };

export default function TimelineRail({
  entries,
}: {
  entries: HomeTimelineEntry[];
}) {
  const { ref, isDragging, dragProps } = useDragScroll();
  const latestYear = entries.length > 0 ? entries[0]!.year : null;

  return (
    <Box
      ref={ref}
      {...dragProps}
      tabIndex={0}
      role="region"
      aria-label="Tournament timeline"
      sx={{
        display: "flex",
        alignItems: "stretch",
        gap: 1,
        overflowX: "auto",
        // Room so the hover lift + glow are not clipped by the scroll box.
        px: 1,
        pt: 2,
        pb: 2.5,
        scrollSnapType: "x proximity",
        WebkitOverflowScrolling: "touch",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: isDragging ? "none" : "auto",
        ...(isDragging ? { "& *": { cursor: "grabbing" } } : null),
        "&::-webkit-scrollbar": { height: 6 },
        "&::-webkit-scrollbar-thumb": {
          background: atlasGlow.cyanSoft,
          borderRadius: 999,
        },
      }}
    >
      {entries.map((entry, index) => {
        const accent: AtlasAccent =
          entry.year >= 2026 || entry.year === latestYear ? "gold" : "cyan";
        return (
          <Box
            key={entry.year}
            sx={{
              display: "flex",
              alignItems: "center",
              scrollSnapAlign: "start",
            }}
          >
            <GlowCard
              variant={accent}
              clickable
              component={Link}
              href={`/tournaments/${entry.year}`}
              aria-label={`View ${entry.year} World Cup details`}
              // Native link-drag is suppressed by the rail's onDragStart handler
              // (see useDragScroll), so a mouse drag scrolls instead of dragging.
              sx={{
                flex: "0 0 auto",
                width: CARD_WIDTH,
                px: 2.5,
                py: 2.5,
                "&:focus-visible": {
                  outline: `2px solid ${atlasColors.cyan}`,
                  outlineOffset: 4,
                },
              }}
            >
              <Typography
                component="p"
                sx={{
                  fontFamily: atlas.fontDisplay,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  fontSize: "2.2rem",
                  lineHeight: 1,
                  mb: 1,
                  ...accentTextSx(accent),
                }}
              >
                {entry.year}
              </Typography>
              <Typography
                component="p"
                sx={{
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: atlasColors.textMuted,
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
                  <CountryFlag name={entry.winner} size="sm" rounded />
                ) : (
                  <Box
                    aria-hidden
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: atlasColors.textMuted,
                    }}
                  />
                )}
                <Typography
                  component="span"
                  sx={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color:
                      entry.winner !== null
                        ? atlasColors.textPrimary
                        : atlasColors.textMuted,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {entry.winner ?? "—"}
                </Typography>
              </Stack>
            </GlowCard>
            {index < entries.length - 1 ? (
              <ChevronRightRoundedIcon
                aria-hidden
                sx={{
                  flexShrink: 0,
                  mx: 0.25,
                  color: atlasColors.textMuted,
                  opacity: 0.6,
                }}
              />
            ) : null}
          </Box>
        );
      })}
    </Box>
  );
}
