// PageHero — consistent page title band: a glowing eyebrow chip, a large
// condensed uppercase title, an optional subtitle, an optional stat row, and an
// optional CTA slot, over a deep-blue glow gradient. Server-safe, responsive.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import PageContainer from "@/components/layout/PageContainer";
import NeonChip from "@/components/ui/NeonChip";
import {
  nexusColors,
  nexusBorders,
  accentTextSx,
  pageHeroBackground,
  type AtlasAccent,
  type PageHeroBackgroundVariant,
} from "@/theme/visualTokens";

export type PageHeroStat = {
  label: string;
  value: string;
  accent?: AtlasAccent;
};

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: React.ReactNode;
  accent?: AtlasAccent;
  /** Optional small stat cards below the copy. */
  stats?: PageHeroStat[];
  /** Optional CTA / controls slot (buttons, search…). */
  action?: React.ReactNode;
  /** Optional leading element (e.g. a flag or portrait). */
  leading?: React.ReactNode;
  /**
   * Decorative hero background. "default"/"stadium" use the stadium-glow brand
   * image, "banner" uses the hero banner, "none" is gradient-only. Always under
   * a strong dark overlay, so it never hurts readability.
   */
  backgroundVariant?: PageHeroBackgroundVariant;
  /** Explicit decorative image URL (local/owned only); overrides the variant. */
  backgroundImage?: string;
  sx?: SxProps<Theme>;
};

export default function PageHero({
  eyebrow = "The Archive",
  title,
  subtitle,
  accent = "gold",
  stats,
  action,
  leading,
  backgroundVariant = "default",
  backgroundImage,
  sx,
}: PageHeroProps) {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        // Decorative image under a strong dark overlay; gradient-only fallback
        // keeps the band readable when the image is absent.
        backgroundColor: nexusColors.background,
        backgroundImage: pageHeroBackground(backgroundVariant, backgroundImage),
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        borderBottom: `1px solid ${nexusColors.surfaceElevated}`,
        ...sx,
      }}
    >
      <PageContainer sx={{ position: "relative", py: { xs: 6, md: 9 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 3, md: 5 },
            alignItems: { md: "flex-start" },
          }}
        >
          {leading ? <Box sx={{ flexShrink: 0 }}>{leading}</Box> : null}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ mb: 2.5 }}>
              <NeonChip accent={accent} dot label={eyebrow} />
            </Box>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.6rem", sm: "3.4rem", md: "4.4rem" },
                color: nexusColors.textPrimary,
                mb: subtitle ? 2 : 0,
              }}
            >
              {title}
            </Typography>
            {subtitle ? (
              <Typography
                variant="body1"
                sx={{
                  color: nexusColors.textSecondary,
                  fontSize: { xs: "1rem", md: "1.08rem" },
                  maxWidth: 680,
                }}
              >
                {subtitle}
              </Typography>
            ) : null}

            {stats && stats.length > 0 ? (
              <Box
                sx={{
                  mt: 4,
                  display: "grid",
                  gap: { xs: 1.5, md: 2 },
                  gridTemplateColumns: {
                    xs: "1fr 1fr",
                    sm: `repeat(${Math.min(stats.length, 4)}, minmax(0, 1fr))`,
                  },
                }}
              >
                {stats.map((stat) => (
                  <Box
                    key={stat.label}
                    sx={{
                      border: nexusBorders.soft,
                      borderRadius: "12px",
                      bgcolor: nexusColors.surface,
                      px: 2,
                      py: 1.5,
                    }}
                  >
                    <Typography
                      component="p"
                      sx={{
                        fontFamily:
                          "var(--font-display), system-ui, sans-serif",
                        fontWeight: 700,
                        fontVariantNumeric: "tabular-nums",
                        fontSize: { xs: "1.5rem", md: "1.9rem" },
                        lineHeight: 1,
                        ...accentTextSx(stat.accent ?? accent),
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      component="p"
                      sx={{
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        letterSpacing: "0.13em",
                        textTransform: "uppercase",
                        color: nexusColors.textMuted,
                        mt: 0.75,
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : null}

            {action ? <Box sx={{ mt: 4 }}>{action}</Box> : null}
          </Box>
        </Box>
      </PageContainer>
    </Box>
  );
}
