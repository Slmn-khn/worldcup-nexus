// Compact canonical match rows for the archive hub — flags, teams, score with
// a.e.t./pens/"outcome not recorded" tag, venue line; each row links to the
// canonical match centre (/matches/<slug>). Server component.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import CountryFlag from "@/components/media/CountryFlag";
import { formatStage } from "@/lib/format";
import { atlas, eyebrowSx, tabularNums } from "@/theme/tokens";
import { describeArchiveMatch, formatArchiveScore } from "@/server/queries/tournamentArchiveModel";
import type { ArchiveMatchDto, ArchiveTeamRef } from "@/server/queries/tournamentArchiveTypes";

function TeamSide({ team, align, winner }: { team: ArchiveTeamRef; align: "left" | "right"; winner: boolean }) {
  const flag = <CountryFlag code={team.code} name={team.name} slug={team.countrySlug} size="xs" />;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, justifyContent: align === "right" ? "flex-end" : "flex-start" }}>
      {align === "left" ? flag : null}
      <Typography
        component="span"
        sx={{ color: atlas.bodyStrong, fontWeight: winner ? 700 : 400, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
      >
        {team.name}
      </Typography>
      {align === "right" ? flag : null}
    </Box>
  );
}

export default function ArchiveMatchRows({ matches, showStage = false }: { matches: ArchiveMatchDto[]; showStage?: boolean }) {
  return (
    <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, border: `1px solid ${atlas.border}` }}>
      {matches.map((match, index) => {
        const stageLabel = match.groupName ?? formatStage(match.stage) ?? match.stage;
        return (
          <Box component="li" key={match.id} sx={{ borderTop: index > 0 ? `1px solid ${atlas.border}` : "none" }}>
            <Box
              component={Link}
              href={`/matches/${match.slug}`}
              aria-label={describeArchiveMatch(match, stageLabel)}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "minmax(0,1fr) auto minmax(0,1fr)", md: "110px minmax(0,1fr) 150px minmax(0,1fr) minmax(0,220px)" },
                alignItems: "center",
                gap: { xs: 1, md: 2 },
                px: { xs: 1.5, md: 2.5 },
                py: 1.5,
                textDecoration: "none",
                transition: "background-color 150ms ease",
                "&:hover": { backgroundColor: "rgba(0,217,255,0.05)" },
              }}
            >
              <Typography component="span" sx={{ ...eyebrowSx, ...tabularNums, fontSize: "0.6rem", color: atlas.textMuted, display: { xs: "none", md: "block" } }}>
                {showStage ? stageLabel : (match.date ?? "—")}
              </Typography>
              <TeamSide team={match.homeTeam} align="right" winner={match.winnerSide === "home"} />
              <Typography
                component="span"
                sx={{
                  ...tabularNums,
                  fontFamily: atlas.fontDisplay,
                  fontWeight: 900,
                  fontSize: "0.95rem",
                  color: match.outcomeIncomplete ? atlas.textSecondary : atlas.textPrimary,
                  textAlign: "center",
                  whiteSpace: { xs: "normal", md: "nowrap" },
                  px: 1,
                }}
              >
                {formatArchiveScore(match)}
              </Typography>
              <TeamSide team={match.awayTeam} align="left" winner={match.winnerSide === "away"} />
              <Typography
                component="span"
                sx={{ fontSize: "0.72rem", color: atlas.textMuted, display: { xs: "none", md: "block" }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}
              >
                {!showStage && match.groupName !== null ? `${match.groupName} · ` : ""}
                {match.venueName ?? "—"}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
