// Country pill (neon pass). A glowing pill-shaped button: a large circular CSS
// flag + uppercase nation name + honest appearance count, in a gold or cyan glow
// variant. Hover lifts and brightens the glow. The flag has its own neutral
// fallback, so an unknown country never breaks.

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import CountryFlag from "@/components/media/CountryFlag";
import { formatNumber } from "@/lib/format";
import {
  atlasColors,
  atlasBorders,
  atlasGlow,
  atlasShadows,
  type AtlasAccent,
} from "@/theme/visualTokens";
import type { HomeCountryHighlight } from "@/server/home/queries";

export default function CountryPill({
  country,
  accent = "cyan",
}: {
  country: HomeCountryHighlight;
  accent?: AtlasAccent;
}) {
  const border = accent === "gold" ? atlasBorders.gold : atlasBorders.cyan;
  const borderStrong =
    accent === "gold" ? atlasBorders.goldStrong : atlasBorders.cyanStrong;
  const glow =
    accent === "gold" ? atlasShadows.goldGlow : atlasShadows.cyanGlow;
  const tint = accent === "gold" ? atlasGlow.goldSoft : atlasGlow.cyanSoft;
  const flagGlow = accent === "gold" ? atlasGlow.goldSoft : atlasGlow.cyanSoft;

  return (
    <Box
      component={Link}
      href={`/countries/${country.slug}`}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.25,
        minWidth: 0,
        minHeight: { xs: 56, sm: 60 },
        borderRadius: "999px",
        border: `1px solid ${border}`,
        background: `linear-gradient(120deg, ${tint} 0%, rgba(8,18,28,0.6) 60%)`,
        transition:
          "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
        "&:hover, &:focus-visible": {
          transform: "translateY(-2px)",
          borderColor: borderStrong,
          boxShadow: glow,
        },
      }}
    >
      <CountryFlag
        name={country.name}
        slug={country.slug}
        code={country.code}
        fifaCode={country.code}
        size="lg"
        rounded
        sx={{
          border: `1px solid ${atlasBorders.softStrong}`,
          boxShadow: `0 0 12px ${flagGlow}`,
        }}
      />
      <Stack sx={{ minWidth: 0 }}>
        <Typography
          component="span"
          sx={{
            fontFamily: "var(--font-display), system-ui, sans-serif",
            fontWeight: 700,
            fontSize: "0.95rem",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            color: atlasColors.textPrimary,
            lineHeight: 1.15,
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
            sx={{
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: atlasColors.textMuted,
              mt: 0.25,
            }}
          >
            {formatNumber(country.appearances)}{" "}
            {country.appearances === 1 ? "entry" : "entries"}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}
