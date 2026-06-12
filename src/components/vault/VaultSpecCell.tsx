// Spec cell (PDF page 2): a large condensed number over an uppercase
// label, on a surface-card panel with a 1px hairline. Optional sublabel
// ("1958–2002") and gold value emphasis.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { atlas, eyebrowSx, tabularNums } from "@/theme/tokens";

type VaultSpecCellProps = {
  value: string;
  label: string;
  sublabel?: string;
  /** Gold value for trophy/record emphasis. */
  emphasis?: boolean;
};

export default function VaultSpecCell({
  value,
  label,
  sublabel,
  emphasis = false,
}: VaultSpecCellProps) {
  return (
    <Box
      sx={{
        height: "100%",
        bgcolor: atlas.surface1,
        border: `1px solid ${atlas.border}`,
        p: 3,
        transition: "border-color 150ms ease",
        "&:hover": { borderColor: atlas.borderStrong },
      }}
    >
      <Typography
        component="p"
        sx={{
          ...tabularNums,
          fontFamily: atlas.fontDisplay,
          fontWeight: 700,
          fontSize: { xs: "2rem", md: "2.5rem" },
          lineHeight: 1,
          color: emphasis ? atlas.gold : atlas.textPrimary,
          mb: 1.25,
        }}
      >
        {value}
      </Typography>
      <Typography component="p" sx={{ ...eyebrowSx, color: atlas.textMuted }}>
        {label}
      </Typography>
      {sublabel ? (
        <Typography
          component="p"
          variant="caption"
          sx={{ color: atlas.textMuted, mt: 0.75 }}
        >
          {sublabel}
        </Typography>
      ) : null}
    </Box>
  );
}
