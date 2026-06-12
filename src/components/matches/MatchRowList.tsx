// Finals/match archive rows (PDF page 4): hairline-divided rows with
// year — team A — center score — team B — venue/context. The Vault's
// signature list treatment for deciding matches.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import { atlas, eyebrowSx, tabularNums } from "@/theme/tokens";

export type MatchRow = {
  key: string;
  year: number | string;
  homeName: string;
  awayName: string;
  score: string;
  /** Uppercase right column, e.g. venue ("ESTADIO AZTECA, MEXICO CITY"). */
  context?: string | null;
  /** Small note under the context, e.g. "Decided on penalties". */
  note?: string | null;
  href?: string | null;
};

function RowContent({ row }: { row: MatchRow }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "auto 1fr auto",
          md: "72px 1fr auto 1fr minmax(180px, 0.9fr)",
        },
        alignItems: "center",
        columnGap: { xs: 2, md: 3 },
        rowGap: 0.5,
        px: { xs: 2, md: 3 },
        py: 2,
      }}
    >
      <Typography
        component="span"
        sx={{
          ...tabularNums,
          fontFamily: atlas.fontDisplay,
          fontWeight: 700,
          fontSize: { xs: "1.1rem", md: "1.35rem" },
          color: atlas.textPrimary,
        }}
      >
        {row.year}
      </Typography>
      <Typography
        component="span"
        sx={{
          color: atlas.textSecondary,
          fontWeight: 400,
          textAlign: { md: "right" },
          minWidth: 0,
        }}
      >
        {row.homeName}
      </Typography>
      <Typography
        component="span"
        sx={{
          ...tabularNums,
          fontFamily: atlas.fontDisplay,
          fontWeight: 700,
          fontSize: { xs: "1.05rem", md: "1.3rem" },
          color: atlas.textPrimary,
          whiteSpace: "nowrap",
          px: { md: 1 },
        }}
      >
        {row.score}
      </Typography>
      <Typography
        component="span"
        sx={{
          color: atlas.textSecondary,
          fontWeight: 400,
          gridColumn: { xs: "2 / 4", md: "auto" },
          minWidth: 0,
        }}
      >
        {row.awayName}
      </Typography>
      {row.context || row.note ? (
        <Box
          sx={{
            gridColumn: { xs: "1 / -1", md: "auto" },
            textAlign: { md: "right" },
            minWidth: 0,
          }}
        >
          {row.context ? (
            <Typography
              component="p"
              sx={{
                ...eyebrowSx,
                fontSize: "0.68rem",
                color: atlas.textMuted,
              }}
            >
              {row.context}
            </Typography>
          ) : null}
          {row.note ? (
            <Typography
              component="p"
              variant="caption"
              sx={{ color: atlas.textMuted }}
            >
              {row.note}
            </Typography>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}

export default function MatchRowList({ rows }: { rows: MatchRow[] }) {
  return (
    <Box sx={{ border: `1px solid ${atlas.border}`, bgcolor: atlas.canvasSoft }}>
      {rows.map((row) => {
        const rowSx = {
          display: "block",
          borderBottom: `1px solid ${atlas.border}`,
          "&:last-of-type": { borderBottom: "none" },
          transition: "background-color 150ms ease",
        };
        return row.href ? (
          <Box
            key={row.key}
            component={Link}
            href={row.href}
            sx={{ ...rowSx, "&:hover": { bgcolor: atlas.surface1 } }}
          >
            <RowContent row={row} />
          </Box>
        ) : (
          <Box key={row.key} sx={rowSx}>
            <RowContent row={row} />
          </Box>
        );
      })}
    </Box>
  );
}
