// Desktop schedule table (MUI Table — Community only). Fixtures are grouped by
// day with a date subheader row. Vault table styling: black rows, hairline
// dividers, uppercase tracked headers, tabular numerics. Server component.

import { Fragment } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { atlas, eyebrowSx, tabularNums } from "@/theme/tokens";
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

const headSx = {
  ...eyebrowSx,
  fontSize: "0.66rem",
  color: atlas.textMuted,
  borderBottom: `1px solid ${atlas.borderStrong}`,
  py: 1.5,
};

const cellSx = {
  borderBottom: `1px solid ${atlas.border}`,
  color: atlas.textSecondary,
  py: 1.75,
};

export default function ScheduleTable({
  groups,
}: {
  groups: FixtureDayGroup[];
}) {
  return (
    <Box sx={{ border: `1px solid ${atlas.border}`, bgcolor: atlas.canvasSoft }}>
      <Table sx={{ "& td, & th": { borderColor: atlas.border } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...headSx, width: 120 }}>Time</TableCell>
            <TableCell sx={{ ...headSx, textAlign: "right" }}>Home</TableCell>
            <TableCell sx={{ ...headSx, textAlign: "center", width: 90 }}>
              Score
            </TableCell>
            <TableCell sx={headSx}>Away</TableCell>
            <TableCell sx={headSx}>Group / Stage</TableCell>
            <TableCell sx={headSx}>Venue</TableCell>
            <TableCell sx={{ ...headSx, width: 110 }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {groups.map((group) => (
            <Fragment key={group.dateLabel}>
              <TableRow>
                <TableCell
                  colSpan={7}
                  sx={{
                    bgcolor: atlas.surfaceSoft,
                    borderBottom: `1px solid ${atlas.border}`,
                    py: 1.25,
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      ...eyebrowSx,
                      ...tabularNums,
                      fontSize: "0.7rem",
                      color: atlas.bodyStrong,
                    }}
                  >
                    {group.dateLabel}
                  </Typography>
                </TableCell>
              </TableRow>
              {group.fixtures.map((fixture) => {
                const score = scoreLine(fixture);
                return (
                  <TableRow
                    key={fixture.id}
                    sx={{ "&:hover": { bgcolor: atlas.surface1 } }}
                  >
                    <TableCell sx={{ ...cellSx, ...tabularNums, color: atlas.textMuted }}>
                      {fixtureTimeLabel(fixture) ?? "—"}
                    </TableCell>
                    <TableCell sx={{ ...cellSx, textAlign: "right", color: atlas.bodyStrong }}>
                      {teamLabel(fixture.homeTeamName, fixture.homeTeamCode)}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...cellSx,
                        ...tabularNums,
                        textAlign: "center",
                        fontFamily: atlas.fontDisplay,
                        fontWeight: 700,
                        color: score !== null ? atlas.textPrimary : atlas.textMuted,
                      }}
                    >
                      {score ?? "vs"}
                    </TableCell>
                    <TableCell sx={{ ...cellSx, color: atlas.bodyStrong }}>
                      {teamLabel(fixture.awayTeamName, fixture.awayTeamCode)}
                    </TableCell>
                    <TableCell sx={{ ...cellSx, color: atlas.textMuted }}>
                      {fixtureContext(fixture) ?? "—"}
                    </TableCell>
                    <TableCell sx={{ ...cellSx, color: atlas.textMuted }}>
                      {fixtureVenue(fixture) ?? "—"}
                    </TableCell>
                    <TableCell sx={cellSx}>
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
