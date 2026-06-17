// SectionHeader — the homepage section title block: a small glowing accent dot
// + uppercase eyebrow, a large condensed uppercase heading, an optional
// subtitle, and an optional right-aligned action link with a → glyph.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import Link from "@/components/Link";
import { atlas } from "@/theme/tokens";
import { atlasColors, atlasGlow, type AtlasAccent } from "@/theme/visualTokens";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
  /** Accent color for the dot + action link. */
  accent?: AtlasAccent;
  sx?: SxProps<Theme>;
};

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
  accent = "gold",
  sx,
}: SectionHeaderProps) {
  const accentColor = accent === "gold" ? atlasColors.gold : atlasColors.cyan;
  const accentGlow = accent === "gold" ? atlasGlow.gold : atlasGlow.cyan;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 3,
        mb: { xs: 3, md: 4 },
        ...sx,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {eyebrow ? (
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.5 }}
          >
            <Box
              aria-hidden
              sx={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                bgcolor: accentColor,
                boxShadow: `0 0 12px 1px ${accentGlow}`,
                flexShrink: 0,
              }}
            />
            <Typography
              component="span"
              sx={{
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: atlasColors.textSecondary,
              }}
            >
              {eyebrow}
            </Typography>
          </Box>
        ) : null}
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: "2.1rem", sm: "2.8rem", md: "3.4rem" },
            color: atlasColors.textPrimary,
            lineHeight: 1.02,
          }}
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography
            variant="body1"
            sx={{ color: atlasColors.textSecondary, mt: 1.5, maxWidth: 640 }}
          >
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {action ? (
        <Typography
          component={Link}
          href={action.href}
          sx={{
            flexShrink: 0,
            pb: 0.75,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: accentColor,
            whiteSpace: "nowrap",
            transition: "text-shadow 150ms ease, color 150ms ease",
            "&:hover": {
              color:
                accent === "gold" ? atlas.goldStrong : atlasColors.cyanStrong,
              textShadow: `0 0 16px ${accentGlow}`,
            },
          }}
        >
          {action.label} →
        </Typography>
      ) : null}
    </Box>
  );
}
