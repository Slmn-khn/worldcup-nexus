// CSS-based country flag (flag-icons). Renders a flag glyph when a code
// resolves, otherwise a neutral badge with the country code or a globe icon.
// Never loads an external image and never crashes on a missing country.

import Box from "@mui/material/Box";
import PublicIcon from "@mui/icons-material/Public";
import {
  getCountryDisplayCode,
  getFlagCodeForCountry,
  type CountryFlagInput,
} from "@/lib/media/flags";
import { atlas } from "@/theme/tokens";

export type CountryFlagSize = "xs" | "sm" | "md" | "lg";

const SIZE_PX: Record<CountryFlagSize, number> = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 36,
};

type CountryFlagProps = CountryFlagInput & {
  size?: CountryFlagSize;
  /** Circular crop instead of the default 4:3 rectangle. */
  rounded?: boolean;
  /** Accessible label override; defaults to the country name/code. */
  label?: string | null;
};

export default function CountryFlag({
  size = "sm",
  rounded = false,
  label,
  ...country
}: CountryFlagProps) {
  const code = getFlagCodeForCountry(country);
  const displayCode = getCountryDisplayCode(country);
  const accessibleLabel =
    label ?? country.name ?? (displayCode !== "—" ? displayCode : "Country");

  const height = SIZE_PX[size];
  // flag-icons default aspect is 4:3; squared variant for circular crops.
  const width = rounded ? height : Math.round(height * (4 / 3));
  const radius = rounded ? "50%" : 0;

  if (code !== null) {
    return (
      <Box
        component="span"
        role="img"
        aria-label={accessibleLabel}
        title={accessibleLabel}
        className={`fi fi-${code}${rounded ? " fis" : ""}`}
        sx={{
          display: "inline-block",
          width: rounded ? height : width,
          height,
          borderRadius: radius,
          border: `1px solid ${atlas.border}`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          flexShrink: 0,
          verticalAlign: "middle",
          lineHeight: 0,
        }}
      />
    );
  }

  // Neutral fallback badge — code when we have one, else a globe icon.
  return (
    <Box
      component="span"
      role="img"
      aria-label={accessibleLabel}
      title={accessibleLabel}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: rounded ? height : width,
        height,
        borderRadius: radius,
        border: `1px solid ${atlas.border}`,
        bgcolor: atlas.surface2,
        color: atlas.textMuted,
        fontSize: Math.max(8, Math.round(height * 0.42)),
        fontWeight: 700,
        letterSpacing: "0.02em",
        flexShrink: 0,
        verticalAlign: "middle",
        overflow: "hidden",
      }}
    >
      {displayCode !== "—" ? (
        displayCode.slice(0, 3)
      ) : (
        <PublicIcon sx={{ fontSize: Math.round(height * 0.7) }} aria-hidden />
      )}
    </Box>
  );
}
