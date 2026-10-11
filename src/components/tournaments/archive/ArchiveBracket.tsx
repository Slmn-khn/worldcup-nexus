// Knockout bracket for the archive hub. Desktop (md+): one column per round,
// feeder matches aligned beside the match they feed. Narrow screens: one
// accordion per round. Shootouts are shown as a separate "(pens)" figure and
// never added to the match score. Server component (MUI Accordion handles
// its own client state).

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Link from "@/components/Link";
import CountryFlag from "@/components/media/CountryFlag";
import { atlas, eyebrowSx, tabularNums } from "@/theme/tokens";
import { describeArchiveMatch, type ArchiveBracket as Bracket } from "@/server/queries/tournamentArchiveModel";
import type { ArchiveMatchDto, ArchiveTeamRef } from "@/server/queries/tournamentArchiveTypes";

const CARD_HEIGHT = 76;

function TeamLine({ team, score, pens, winner }: { team: ArchiveTeamRef; score: number; pens: number | null; winner: boolean }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
      <CountryFlag code={team.code} name={team.name} slug={team.countrySlug} size="xs" />
      <Typography component="span" sx={{ flexGrow: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.82rem", color: winner ? atlas.textPrimary : atlas.textSecondary, fontWeight: winner ? 700 : 400 }}>
        {team.name}
      </Typography>
      <Typography component="span" sx={{ ...tabularNums, fontFamily: atlas.fontDisplay, fontWeight: 900, fontSize: "0.85rem", color: winner ? atlas.textPrimary : atlas.textSecondary }}>
        {score}
        {pens !== null ? (
          <Typography component="span" sx={{ fontSize: "0.68rem", color: atlas.textMuted, ml: 0.5, fontWeight: 600 }}>
            ({pens})
          </Typography>
        ) : null}
      </Typography>
    </Box>
  );
}

function BracketCard({ match, label }: { match: ArchiveMatchDto; label: string }) {
  const tag = match.decidedByPenalties ? "pens" : match.extraTime === true ? "a.e.t." : match.outcomeIncomplete ? "outcome not recorded" : null;
  return (
    <Box
      component={Link}
      href={`/matches/${match.slug}`}
      aria-label={describeArchiveMatch(match, label)}
      sx={{
        display: "grid",
        gap: 0.5,
        minHeight: CARD_HEIGHT,
        px: 1.5,
        py: 1,
        border: `1px solid ${match.stage === "final" ? atlas.goldBorder : atlas.border}`,
        bgcolor: atlas.surfaceSoft,
        textDecoration: "none",
        transition: "border-color 150ms ease",
        "&:hover, &:focus-visible": { borderColor: atlas.goldBorder },
      }}
    >
      <TeamLine team={match.homeTeam} score={match.homeScore} pens={match.decidedByPenalties ? match.homeScorePenalties : null} winner={match.winnerSide === "home"} />
      <TeamLine team={match.awayTeam} score={match.awayScore} pens={match.decidedByPenalties ? match.awayScorePenalties : null} winner={match.winnerSide === "away"} />
      {tag !== null ? (
        <Typography component="span" sx={{ ...eyebrowSx, fontSize: "0.52rem", color: match.outcomeIncomplete ? atlas.yellow : atlas.textMuted }}>
          {tag}
        </Typography>
      ) : null}
    </Box>
  );
}

export default function ArchiveBracket({ bracket }: { bracket: Bracket }) {
  const firstRoundSize = bracket.rounds[0]?.matches.length ?? 0;
  const columnHeight = Math.max(firstRoundSize, 1) * (CARD_HEIGHT + 16);
  return (
    <>
      {/* Desktop tree */}
      <Box
        role="region"
        aria-label="Knockout bracket"
        tabIndex={0}
        sx={{ display: { xs: "none", md: "block" }, overflowX: "auto", pb: 1, "&:focus-visible": { outline: `2px solid ${atlas.gold}`, outlineOffset: 4 } }}
      >
        <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${bracket.rounds.length}, minmax(200px, 1fr))`, gap: 2, minWidth: bracket.rounds.length * 216 }}>
          {bracket.rounds.map((round) => (
            <Box key={round.stage} component="section" aria-labelledby={`bracket-${round.stage.replace(/\s+/g, "-")}`}>
              <Typography id={`bracket-${round.stage.replace(/\s+/g, "-")}`} component="h3" sx={{ ...eyebrowSx, fontSize: "0.62rem", color: atlas.gold, mb: 1.5 }}>
                {round.label}
              </Typography>
              <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", justifyContent: "space-around", height: columnHeight }}>
                {round.matches.map((match) => (
                  <Box component="li" key={match.id}>
                    <BracketCard match={match} label={round.label} />
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Narrow screens: round-by-round accordions */}
      <Box sx={{ display: { xs: "grid", md: "none" }, gap: 1 }}>
        {bracket.rounds.map((round, index) => (
          <Accordion
            key={round.stage}
            defaultExpanded={index === bracket.rounds.length - 1}
            disableGutters
            sx={{ bgcolor: atlas.surfaceSoft, border: `1px solid ${atlas.border}`, boxShadow: "none", "&::before": { display: "none" } }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: atlas.textSecondary }} />} aria-controls={`round-${index}-content`} id={`round-${index}-header`}>
              {/* AccordionSummary already sits inside an <h3> (MUI heading slot). */}
              <Typography component="span" sx={{ ...eyebrowSx, fontSize: "0.66rem", color: atlas.gold }}>
                {round.label} · {round.matches.length} {round.matches.length === 1 ? "match" : "matches"}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ display: "grid", gap: 1 }}>
              {round.matches.map((match) => (
                <BracketCard key={match.id} match={match} label={round.label} />
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {bracket.thirdPlace !== null ? (
        <Box sx={{ mt: 3, maxWidth: 360 }}>
          <Typography component="h3" sx={{ ...eyebrowSx, fontSize: "0.62rem", color: atlas.gold, mb: 1.5 }}>
            Third-place match
          </Typography>
          <BracketCard match={bracket.thirdPlace} label="Third-place match" />
        </Box>
      ) : null}
    </>
  );
}
