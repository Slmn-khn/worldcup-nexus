// Desktop schedule table (MUI Table — Community only). Fixtures are grouped by
// day with a date subheader row. Neon styling: a highlighted gold/cyan header
// row, soft-bordered scannable rows, bold centered scores, and tabular numerics.
// Time/score/status never wrap; a horizontal scroll container keeps the table
// readable when the viewport is too narrow. Server component.

import { Fragment } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { atlas, tabularNums } from "@/theme/tokens";
import { nexusColors } from "@/theme/visualTokens";
import type { FixtureDto } from "@/server/fixtures/types";
import FixtureStatusChip from "./FixtureStatusChip";
import {
  fixtureContext,
  fixtureTimeLabel,
  fixtureVenue,
  scoreLine,
  teamLabel,
} from "./fixtureDisplay";

export type FixtureDayGroup = { dateLabel: string; fixtures: FixtureDto[] };

// Highlighted header row — dark elevated gradient with a cyan accent underline.
const HEADER_BG =
  "linear-gradient(180deg, rgba(16,32,51,0.98), rgba(8,20,34,0.98))";

// Reusable header cell: gold, uppercase, tracked, never wrapping.
const headerCellSx = {
  color: nexusColors.gold,
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  whiteSpace: "nowrap",
  py: 1.75,
  borderBottom: "1px solid rgba(0,217,255,0.28)",
} as const;

const cellSx = {
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  color: nexusColors.textSecondary,
  py: 1.75,
} as const;

export default function ScheduleTable({
  groups,
}: {
  groups: FixtureDayGroup[];
}) {
  return (
    <Box
      sx={{
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "16px",
        bgcolor: atlas.canvasSoft,
      }}
    >
      <Table
        sx={{
          minWidth: 900,
          "& td, & th": { borderColor: "rgba(255,255,255,0.08)" },
          "& tbody tr": {
            transition: "background-color 160ms ease, box-shadow 160ms ease",
          },
          "& tbody tr:hover": {
            backgroundColor: "rgba(0,217,255,0.045)",
          },
        }}
      >
        <TableHead sx={{ background: HEADER_BG }}>
          <TableRow>
            <TableCell sx={{ ...headerCellSx, minWidth: 120, width: 140 }}>
              Time
            </TableCell>
            <TableCell sx={{ ...headerCellSx, textAlign: "right" }}>
              Home
            </TableCell>
            <TableCell sx={{ ...headerCellSx, textAlign: "center", width: 96 }}>
              Score
            </TableCell>
            <TableCell sx={headerCellSx}>Away</TableCell>
            <TableCell sx={headerCellSx}>Group / Stage</TableCell>
            <TableCell sx={headerCellSx}>Venue</TableCell>
            <TableCell sx={{ ...headerCellSx, width: 120 }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {groups.map((group) => (
            <Fragment key={group.dateLabel}>
              <TableRow sx={{ backgroundColor: "rgba(244,201,93,0.06)" }}>
                <TableCell
                  colSpan={7}
                  sx={{
                    py: 1.25,
                    borderBottom: "1px solid rgba(244,201,93,0.16)",
                    borderLeft: "3px solid rgba(244,201,93,0.5)",
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      ...tabularNums,
                      fontSize: "0.72rem",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: nexusColors.gold,
                    }}
                  >
                    {group.dateLabel}
                  </Typography>
                </TableCell>
              </TableRow>
              {group.fixtures.map((fixture) => {
                const score = scoreLine(fixture);
                return (
                  <TableRow key={fixture.id}>
                    {/* Time — always one line (no break at the UTC-6 hyphen). */}
                    <TableCell
                      sx={{
                        ...cellSx,
                        ...tabularNums,
                        whiteSpace: "nowrap",
                        minWidth: 120,
                        width: 140,
                        color: nexusColors.textSecondary,
                      }}
                    >
                      {fixtureTimeLabel(fixture) ?? "—"}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...cellSx,
                        textAlign: "right",
                        color: atlas.bodyStrong,
                      }}
                    >
                      {teamLabel(fixture.homeTeamName, fixture.homeTeamCode)}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...cellSx,
                        ...tabularNums,
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        fontFamily: atlas.fontDisplay,
                        fontWeight: 900,
                        color:
                          score !== null
                            ? nexusColors.textPrimary
                            : nexusColors.textMuted,
                      }}
                    >
                      {score ?? "vs"}
                    </TableCell>
                    <TableCell sx={{ ...cellSx, color: atlas.bodyStrong }}>
                      {teamLabel(fixture.awayTeamName, fixture.awayTeamCode)}
                    </TableCell>
                    <TableCell sx={{ ...cellSx, color: nexusColors.textMuted }}>
                      {fixtureContext(fixture) ?? "—"}
                    </TableCell>
                    <TableCell sx={{ ...cellSx, color: nexusColors.textMuted }}>
                      {fixtureVenue(fixture) ?? "—"}
                    </TableCell>
                    <TableCell sx={{ ...cellSx, whiteSpace: "nowrap" }}>
                      <FixtureStatusChip status={fixture.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
