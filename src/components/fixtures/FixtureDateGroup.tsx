// A date heading over a responsive grid of fixture cards. Used for the
// homepage tab panels and the mobile schedule view.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { atlas, eyebrowSx, tabularNums } from "@/theme/tokens";
import type { FixtureDto } from "@/server/fixtures/types";
import FixtureCard from "./FixtureCard";

export default function FixtureDateGroup({
  dateLabel,
  fixtures,
  columns = { xs: "1fr", md: "1fr 1fr" },
}: {
  dateLabel: string;
  fixtures: FixtureDto[];
  columns?: Record<string, string>;
}) {
  if (fixtures.length === 0) return null;
  return (
    <Box component="section" sx={{ mb: 5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 2,
          pb: 1.5,
          mb: 2.5,
          borderBottom: `1px solid ${atlas.border}`,
        }}
      >
        <Typography
          component="h3"
          sx={{
            fontFamily: atlas.fontDisplay,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            fontSize: { xs: "1.1rem", md: "1.3rem" },
            color: atlas.textPrimary,
          }}
        >
          {dateLabel}
        </Typography>
        <Typography
          component="span"
          sx={{ ...eyebrowSx, ...tabularNums, fontSize: "0.6rem", color: atlas.textMuted }}
        >
          {fixtures.length} {fixtures.length === 1 ? "match" : "matches"}
        </Typography>
      </Box>
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: columns }}>
        {fixtures.map((fixture) => (
          <FixtureCard key={fixture.id} fixture={fixture} />
        ))}
      </Box>
    </Box>
  );
}
