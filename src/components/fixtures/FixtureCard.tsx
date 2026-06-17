// A single fixture as a premium neon scoreboard card: a context eyebrow + status
// chip on top, then a vertical scoreboard (one row per team — flag, full team
// name, and that team's score in gold), then kick-off date/time, venue, and a
// small source line. The vertical layout gives full team names room so they
// never split mid-word.

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { atlas, eyebrowSx, tabularNums } from "@/theme/tokens";
import { atlasColors } from "@/theme/visualTokens";
import CountryFlag from "@/components/media/CountryFlag";
import type { FixtureDto } from "@/server/fixtures/types";
import FixtureStatusChip from "./FixtureStatusChip";
import {
  fixtureContext,
  fixtureDateLabel,
  fixtureTimeLabel,
  fixtureVenue,
  safeFlagGlyph,
  teamLabel,
} from "./fixtureDisplay";

function FixtureTeamRow({
  name,
  code,
  flag,
  score,
  hasScore,
  isWinner,
}: {
  name: string | null;
  code: string | null;
  flag: string | null;
  score: number | null;
  hasScore: boolean;
  isWinner: boolean;
}) {
  const glyph = safeFlagGlyph(flag);
  // Prefer a verified emoji glyph; otherwise a CSS flag resolved from the team
  // name/code (with its own neutral fallback). Flags only — no inline code chip.
  const flagNode =
    glyph !== null ? (
      <Box
        component="span"
        aria-hidden
        sx={{ fontSize: "1.5rem", lineHeight: 0 }}
      >
        {glyph}
      </Box>
    ) : name !== null || code !== null ? (
      <CountryFlag name={name} code={code} fifaCode={code} size="md" rounded />
    ) : null;
  const label = teamLabel(name, code);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <Stack
        direction="row"
        spacing={1.25}
        sx={{ alignItems: "center", minWidth: 0 }}
      >
        {flagNode !== null ? (
          <Box sx={{ flexShrink: 0, display: "inline-flex" }}>{flagNode}</Box>
        ) : null}
        <Typography
          component="span"
          title={label}
          sx={{
            // Wrap only at natural spaces (no mid-word splitting), clamp to two
            // lines, and keep the full name available via the title tooltip.
            minWidth: 0,
            fontWeight: 700,
            fontSize: { xs: 15, sm: 16, md: 17 },
            lineHeight: 1.15,
            color:
              hasScore && !isWinner ? atlas.textSecondary : atlas.textPrimary,
            whiteSpace: "normal",
            wordBreak: "normal",
            overflowWrap: "normal",
            hyphens: "none",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {label}
        </Typography>
      </Stack>

      {hasScore ? (
        <Typography
          component="span"
          sx={{
            ...tabularNums,
            fontFamily: atlas.fontDisplay,
            fontWeight: 800,
            fontSize: { xs: 24, sm: 28 },
            lineHeight: 1,
            minWidth: 28,
            textAlign: "right",
            color: atlasColors.gold,
            textShadow: "0 0 18px rgba(244,201,93,0.35)",
            opacity: isWinner ? 1 : 0.72,
          }}
        >
          {score ?? "–"}
        </Typography>
      ) : null}
    </Box>
  );
}

export default function FixtureCard({ fixture }: { fixture: FixtureDto }) {
  const context = fixtureContext(fixture);
  const dateLabel = fixtureDateLabel(fixture);
  const timeLabel = fixtureTimeLabel(fixture);
  const venue = fixtureVenue(fixture);

  const hasScore = fixture.homeScore !== null && fixture.awayScore !== null;
  const decidedByPens =
    fixture.homePenaltyScore !== null && fixture.awayPenaltyScore !== null;

  // Winner highlight (regulation, or the shootout result when applicable).
  let homeWin = false;
  let awayWin = false;
  if (hasScore) {
    if (decidedByPens) {
      homeWin = fixture.homePenaltyScore! > fixture.awayPenaltyScore!;
      awayWin = fixture.awayPenaltyScore! > fixture.homePenaltyScore!;
    } else {
      homeWin = fixture.homeScore! > fixture.awayScore!;
      awayWin = fixture.awayScore! > fixture.homeScore!;
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: 210,
        p: { xs: 2.25, sm: 2.75 },
        borderRadius: "20px",
        background:
          "linear-gradient(180deg, rgba(12,29,45,0.96), rgba(7,20,33,0.96))",
        border: "1px solid rgba(0,217,255,0.18)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.24)",
        transition:
          "border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: "rgba(0,217,255,0.38)",
          boxShadow: "0 0 28px rgba(0,217,255,0.12)",
        },
      }}
    >
      {/* Top row: context eyebrow (may wrap) + status chip (always visible). */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1.5,
          mb: 2.25,
        }}
      >
        <Typography
          component="p"
          sx={{
            ...eyebrowSx,
            fontSize: "0.62rem",
            color: atlas.textMuted,
            minWidth: 0,
          }}
        >
          {context ?? "World Cup 2026"}
        </Typography>
        <Box sx={{ flexShrink: 0 }}>
          <FixtureStatusChip status={fixture.status} />
        </Box>
      </Box>

      {/* Vertical scoreboard. */}
      <Stack spacing={1.5}>
        <FixtureTeamRow
          name={fixture.homeTeamName}
          code={fixture.homeTeamCode}
          flag={fixture.homeTeamFlag}
          score={fixture.homeScore}
          hasScore={hasScore}
          isWinner={homeWin}
        />
        {!hasScore ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ flex: 1, height: "1px", bgcolor: atlas.border }} />
            <Typography
              component="span"
              sx={{ ...eyebrowSx, fontSize: "0.6rem", color: atlas.textMuted }}
            >
              vs
            </Typography>
            <Box sx={{ flex: 1, height: "1px", bgcolor: atlas.border }} />
          </Box>
        ) : null}
        <FixtureTeamRow
          name={fixture.awayTeamName}
          code={fixture.awayTeamCode}
          flag={fixture.awayTeamFlag}
          score={fixture.awayScore}
          hasScore={hasScore}
          isWinner={awayWin}
        />
      </Stack>

      {decidedByPens ? (
        <Typography
          variant="caption"
          sx={{ ...tabularNums, color: atlasColors.gold, mt: 1.25 }}
        >
          Penalties {fixture.homePenaltyScore}–{fixture.awayPenaltyScore}
        </Typography>
      ) : null}

      {/* Metadata. */}
      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 2 }} />
      <Box
        sx={{
          mt: "auto",
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
          sx={{
            ...eyebrowSx,
            fontSize: "0.56rem",
            color: atlas.textMuted,
            mt: 0.5,
          }}
        >
          Source: {fixture.sourceLabel}
        </Typography>
      </Box>
    </Box>
  );
}
