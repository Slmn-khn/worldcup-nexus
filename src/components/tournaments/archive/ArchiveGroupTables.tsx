// Computed group tables for the archive hub. Qualification is shown with a
// text label + icon (never colour alone) and is taken from who actually
// played the first knockout round. Server component.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Link from "@/components/Link";
import CountryFlag from "@/components/media/CountryFlag";
import { atlas, eyebrowSx, tabularNums } from "@/theme/tokens";
import type { ArchiveGroup } from "@/server/queries/tournamentArchiveModel";

function GroupTable({ group }: { group: ArchiveGroup }) {
  const captionId = `group-${group.letter}-caption`;
  return (
    <Box sx={{ border: `1px solid ${atlas.border}`, bgcolor: atlas.surfaceSoft, minWidth: 0 }}>
      <Box
        component="table"
        aria-labelledby={captionId}
        sx={{
          width: "100%",
          borderCollapse: "collapse",
          "& th, & td": { fontSize: "0.78rem", px: 1, py: 0.75, textAlign: "right", borderTop: `1px solid ${atlas.border}` },
          "& th": { ...eyebrowSx, fontSize: "0.55rem", color: atlas.textMuted, pb: 0.75 },
        }}
      >
        <Box component="caption" id={captionId} sx={{ ...eyebrowSx, fontSize: "0.66rem", color: atlas.gold, px: 2, pt: 1.75, pb: 1.25, textAlign: "left", captionSide: "top" }}>
          Group {group.letter}
        </Box>
        <Box component="thead">
          <Box component="tr">
            <Box component="th" scope="col" sx={{ textAlign: "left", pl: 2 }}>Team</Box>
            <Box component="th" scope="col"><abbr title="Played">P</abbr></Box>
            <Box component="th" scope="col"><abbr title="Won">W</abbr></Box>
            <Box component="th" scope="col"><abbr title="Drawn">D</abbr></Box>
            <Box component="th" scope="col"><abbr title="Lost">L</abbr></Box>
            <Box component="th" scope="col" sx={{ display: { xs: "none", md: "table-cell" } }}><abbr title="Goals for">GF</abbr></Box>
            <Box component="th" scope="col" sx={{ display: { xs: "none", md: "table-cell" } }}><abbr title="Goals against">GA</abbr></Box>
            <Box component="th" scope="col"><abbr title="Goal difference">GD</abbr></Box>
            <Box component="th" scope="col" sx={{ pr: 2 }}><abbr title="Points">Pts</abbr></Box>
          </Box>
        </Box>
        <Box component="tbody">
          {group.rows.map((row) => {
            const gd = row.goalsFor - row.goalsAgainst;
            return (
              <Box component="tr" key={row.teamSlug} sx={{ backgroundColor: row.advanced ? "rgba(0,217,255,0.05)" : "transparent" }}>
                <Box component="th" scope="row" sx={{ textAlign: "left !important", pl: 2, color: atlas.bodyStrong, textTransform: "none !important", letterSpacing: "normal !important", fontSize: "0.82rem !important", fontWeight: "inherit" }}>
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                    <CountryFlag code={row.teamCode} name={row.teamName} slug={row.countrySlug} size="xs" />
                    {row.countrySlug !== null ? (
                      <Box component={Link} href={`/countries/${row.countrySlug}`} sx={{ color: "inherit", fontWeight: row.advanced ? 700 : 400, textDecoration: "none", "&:hover": { color: atlas.goldStrong } }}>
                        {row.teamName}
                      </Box>
                    ) : (
                      <span>{row.teamName}</span>
                    )}
                    {row.advanced ? (
                      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", color: atlas.textSecondary }} title="Advanced to the knockout stage">
                        <ArrowForwardIcon sx={{ fontSize: 12 }} aria-hidden />
                        <Box component="span" sx={{ position: "absolute", width: "1px", height: "1px", m: "-1px", p: 0, border: 0, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
                          advanced
                        </Box>
                      </Box>
                    ) : null}
                  </Box>
                </Box>
                <Box component="td" sx={{ ...tabularNums }}>{row.played}</Box>
                <Box component="td" sx={{ ...tabularNums }}>{row.wins}</Box>
                <Box component="td" sx={{ ...tabularNums }}>{row.draws}</Box>
                <Box component="td" sx={{ ...tabularNums }}>{row.losses}</Box>
                <Box component="td" sx={{ ...tabularNums, display: { xs: "none", md: "table-cell" } }}>{row.goalsFor}</Box>
                <Box component="td" sx={{ ...tabularNums, display: { xs: "none", md: "table-cell" } }}>{row.goalsAgainst}</Box>
                <Box component="td" sx={{ ...tabularNums }}>{gd > 0 ? `+${gd}` : gd}</Box>
                <Box component="td" sx={{ ...tabularNums, pr: 2, fontWeight: 800, color: atlas.textPrimary }}>{row.points}</Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

export default function ArchiveGroupTables({ groups }: { groups: ArchiveGroup[] }) {
  return (
    <>
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "repeat(2, minmax(0,1fr))", lg: "repeat(3, minmax(0,1fr))" } }}>
        {groups.map((group) => (
          <GroupTable key={group.letter} group={group} />
        ))}
      </Box>
      <Typography component="p" sx={{ fontSize: "0.75rem", color: atlas.textMuted, mt: 2, display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
        <ArrowForwardIcon sx={{ fontSize: 12 }} aria-hidden /> Advanced to the knockout stage (from the knockout results).
        Tables are computed from match results — points, goal difference, goals
        scored — and are not FIFA&apos;s official ranking: head-to-head and
        fair-play tie-breakers are not applied.
      </Typography>
    </>
  );
}
