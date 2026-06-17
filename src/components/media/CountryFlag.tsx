// CSS-based country flag (flag-icons). Renders a flag glyph when a code
// resolves, otherwise a neutral badge with the country code or a globe icon.
// Never loads an external image and never crashes on a missing country.

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import PublicIcon from "@mui/icons-material/Public";
import {
  getCountryDisplayCode,
  getFlagCodeForCountry,
  type CountryFlagInput,
} from "@/lib/media/flags";
import { atlas } from "@/theme/tokens";

export type CountryFlagSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_PX: Record<CountryFlagSize, number> = {
  xs: 18,
  sm: 22,
  md: 28,
  lg: 34,
  xl: 42,
};

type CountryFlagProps = CountryFlagInput & {
  size?: CountryFlagSize;
  /** Circular crop instead of the default 4:3 rectangle. */
  rounded?: boolean;
  /** Accessible label override; defaults to the country name/code. */
  label?: string | null;
  /** Extra styles merged onto the flag box (e.g. a per-usage border/glow). */
  sx?: SxProps<Theme>;
};

export default function CountryFlag({
  size = "sm",
  rounded = false,
  label,
  sx,
  ...country
}: CountryFlagProps) {
  const code = getFlagCodeForCountry(country);
  const displayCode = getCountryDisplayCode(country);
  const accessibleLabel =
    label ?? country.name ?? (displayCode !== "—" ? displayCode : "Country");

  const height = SIZE_PX[size];
  // flag-icons default aspect is 4:3; squared variant for circular crops.
  const width = rounded ? height : Math.round(height * (4 / 3));
  const radius = rounded ? "50%" : "4px";
  // Lock both axes so the flag can never be squeezed into an oval by a flex
  // parent: explicit width/height + minWidth + a fixed aspect ratio.
  const sizingSx = {
    width,
    height,
    minWidth: width,
    aspectRatio: rounded ? "1 / 1" : "4 / 3",
    boxSizing: "border-box",
    flexShrink: 0,
  } as const;

  if (code !== null) {
    return (
      <Box
        component="span"
        role="img"
        aria-label={accessibleLabel}
        title={accessibleLabel}
        data-flag-code={code}
        data-country-name={country.name ?? undefined}
        className={`fi fi-${code}${rounded ? " fis" : ""}`}
        sx={[
          {
            display: "inline-block",
            ...sizingSx,
            borderRadius: radius,
            border: `1px solid ${atlas.border}`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            verticalAlign: "middle",
            lineHeight: 0,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
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
      data-flag-code={code ?? undefined}
      data-country-name={country.name ?? undefined}
      sx={[
        {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          ...sizingSx,
          borderRadius: radius,
          border: `1px solid ${atlas.border}`,
          bgcolor: atlas.surface2,
          color: atlas.textMuted,
          fontSize: Math.max(8, Math.round(height * 0.42)),
          fontWeight: 700,
          letterSpacing: "0.02em",
          verticalAlign: "middle",
          overflow: "hidden",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {displayCode !== "—" ? (
        displayCode.slice(0, 3)
      ) : (
        <PublicIcon sx={{ fontSize: Math.round(height * 0.7) }} aria-hidden />
      )}
    </Box>
  );
}
