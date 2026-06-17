// Country pill (Phase 4). CSS flag + uppercase nation name + honest appearance
// count (tournament entries), linking to the country page. Rectangular hairline
// card — never a rounded "pill" in the SaaS sense (UI_STYLE_GUIDE). The flag has
// its own neutral fallback, so an unknown country never breaks.

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import CountryFlag from "@/components/media/CountryFlag";
import { formatNumber } from "@/lib/format";
import { atlas, eyebrowSx, interactiveCardSx } from "@/theme/tokens";
import type { HomeCountryHighlight } from "@/server/home/queries";

export default function CountryPill({
  country,
}: {
  country: HomeCountryHighlight;
}) {
  return (
    <Box
      component={Link}
      href={`/countries/${country.slug}`}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        bgcolor: atlas.surface1,
        border: `1px solid ${atlas.border}`,
        px: 2,
        py: 1.5,
        minWidth: 0,
        ...interactiveCardSx,
      }}
    >
      <CountryFlag name={country.name} code={country.code} size="md" />
      <Stack sx={{ minWidth: 0 }}>
        <Typography
          component="span"
          sx={{
            fontFamily: atlas.fontDisplay,
            fontWeight: 700,
            fontSize: "1rem",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            color: atlas.textPrimary,
            lineHeight: 1.1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {country.name}
        </Typography>
        {country.appearances > 0 ? (
          <Typography
            component="span"
            sx={{ ...eyebrowSx, fontSize: "0.6rem", color: atlas.textMuted }}
          >
            {formatNumber(country.appearances)}{" "}
            {country.appearances === 1 ? "entry" : "entries"}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}
