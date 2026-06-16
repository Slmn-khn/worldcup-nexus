// A single fixture as a Vault card: context eyebrow + status, teams with a
// centred scoreline (or "vs"), kick-off date/time, venue, and a small source
// line. Zero radius, hairline, no shadow — composes the Vault card anatomy.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { atlas, eyebrowSx, interactiveCardSx, tabularNums } from "@/theme/tokens";
import type { FixtureDto } from "@/server/fixtures/types";
import FixtureStatusChip from "./FixtureStatusChip";
import {
  fixtureContext,
  fixtureDateLabel,
  fixtureTimeLabel,
  fixtureVenue,
  safeFlagGlyph,
  scoreLine,
  teamLabel,
} from "./fixtureDisplay";

function TeamLine({
  name,
  code,
  flag,
  align,
}: {
  name: string | null;
  code: string | null;
  flag: string | null;
  align: "right" | "left";
}) {
  const glyph = safeFlagGlyph(flag);
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: align === "right" ? "flex-end" : "flex-start",
        gap: 1,
        minWidth: 0,
      }}
    >
      {glyph !== null && align === "left" ? (
        <Box component="span" aria-hidden sx={{ fontSize: "1.1rem" }}>
          {glyph}
        </Box>
      ) : null}
      <Typography
        component="span"
        sx={{
          color: atlas.bodyStrong,
          fontWeight: 400,
          textAlign: align,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {teamLabel(name, code)}
      </Typography>
      {glyph !== null && align === "right" ? (
        <Box component="span" aria-hidden sx={{ fontSize: "1.1rem" }}>
          {glyph}
        </Box>
      ) : null}
    </Box>
  );
}

export default function FixtureCard({ fixture }: { fixture: FixtureDto }) {
  const score = scoreLine(fixture);
  const context = fixtureContext(fixture);
  const dateLabel = fixtureDateLabel(fixture);
  const timeLabel = fixtureTimeLabel(fixture);
  const venue = fixtureVenue(fixture);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: atlas.surface1,
        border: `1px solid ${atlas.border}`,
        p: { xs: 2.5, md: 3 },
        ...interactiveCardSx,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          mb: 2,
        }}
      >
        <Typography
          component="p"
          sx={{
            ...eyebrowSx,
            fontSize: "0.62rem",
            color: atlas.textMuted,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {context ?? "World Cup 2026"}
        </Typography>
        <FixtureStatusChip status={fixture.status} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          columnGap: { xs: 1.5, md: 2 },
        }}
      >
        <TeamLine
          name={fixture.homeTeamName}
          code={fixture.homeTeamCode}
          flag={fixture.homeTeamFlag}
          align="right"
        />
        <Typography
          component="span"
          sx={{
            ...tabularNums,
            fontFamily: atlas.fontDisplay,
            fontWeight: 700,
            fontSize: { xs: "1.4rem", md: "1.7rem" },
            color: score !== null ? atlas.textPrimary : atlas.textMuted,
            whiteSpace: "nowrap",
            px: { xs: 1, md: 1.5 },
          }}
        >
          {score ?? "vs"}
        </Typography>
        <TeamLine
          name={fixture.awayTeamName}
          code={fixture.awayTeamCode}
          flag={fixture.awayTeamFlag}
          align="left"
        />
      </Box>

      <Box
        sx={{
          mt: 2,
          pt: 2,
          borderTop: `1px solid ${atlas.border}`,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        {dateLabel !== null ? (
          <Typography
            variant="caption"
            sx={{ ...tabularNums, color: atlas.textSecondary }}
          >
            {dateLabel}
            {timeLabel !== null ? ` · ${timeLabel}` : ""}
          </Typography>
        ) : (
          <Typography variant="caption" sx={{ color: atlas.textMuted }}>
            Date to be confirmed
          </Typography>
        )}
        {venue !== null ? (
          <Typography variant="caption" sx={{ color: atlas.textMuted }}>
            {venue}
          </Typography>
        ) : null}
        <Typography
          component="p"
          sx={{ ...eyebrowSx, fontSize: "0.56rem", color: atlas.textMuted, mt: 0.5 }}
        >
          Source: {fixture.sourceLabel}
        </Typography>
      </Box>
    </Box>
  );
}
