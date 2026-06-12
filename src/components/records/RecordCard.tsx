// Record card (PDF page 6): uppercase eyebrow with gold square, huge gold
// condensed value, context line, muted body. Hairline border, zero radius.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { atlas, eyebrowSx, glowPanelSx, tabularNums } from "@/theme/tokens";

type RecordCardProps = {
  title: string;
  value: string;
  description: string;
};

export default function RecordCard({
  title,
  value,
  description,
}: RecordCardProps) {
  return (
    <Box
      sx={{
        bgcolor: atlas.surface1,
        border: `1px solid ${atlas.border}`,
        p: 3,
        ...glowPanelSx,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, mb: 1.5 }}>
        <Box
          aria-hidden
          sx={{ width: 6, height: 6, bgcolor: atlas.gold, mt: 0.5, flexShrink: 0 }}
        />
        <Typography component="p" sx={{ ...eyebrowSx, color: atlas.textMuted }}>
          {title}
        </Typography>
      </Box>
      <Typography
        component="p"
        sx={{
          ...tabularNums,
          fontFamily: atlas.fontDisplay,
          fontWeight: 700,
          fontSize: { xs: "1.8rem", md: "2.1rem" },
          textTransform: "uppercase",
          lineHeight: 1.05,
          color: atlas.gold,
          mb: 1.5,
        }}
      >
        {value}
      </Typography>
      <Typography variant="body2" sx={{ color: atlas.textSecondary }}>
        {description}
      </Typography>
    </Box>
  );
}
