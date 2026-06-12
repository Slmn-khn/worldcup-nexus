// Standard archive page header: eyebrow · display title · lede · meta line.
// Replaces the per-page copy-pasted header blocks so every index page shares
// one editorial pattern.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PageContainer from "@/components/layout/PageContainer";
import HeroSurface from "@/components/visual/HeroSurface";
import { atlas, eyebrowSx } from "@/theme/tokens";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  lede?: string;
  /** Small fact line under the lede, e.g. "1,248 matches in the archive". */
  meta?: React.ReactNode;
  /** Decorative background layer (e.g. FootballConstellation). */
  decoration?: React.ReactNode;
  /** Extra content below the text stack (chips, notes, search, …). */
  children?: React.ReactNode;
};

export default function PageHeader({
  eyebrow = "The Archive",
  title,
  lede,
  meta,
  decoration,
  children,
}: PageHeaderProps) {
  return (
    <HeroSurface>
      {decoration}
      <PageContainer sx={{ position: "relative", py: { xs: 6, md: 8.5 } }}>
        <Typography
          variant="overline"
          component="p"
          sx={{ ...eyebrowSx, color: "primary.main", mb: 1.5 }}
        >
          {eyebrow}
        </Typography>
        <Typography
          variant="h1"
          sx={{ fontSize: { xs: "2.2rem", md: "3.1rem" }, mb: 1.5 }}
        >
          {title}
        </Typography>
        {lede ? (
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              fontSize: { xs: "1rem", md: "1.1rem" },
              maxWidth: 620,
            }}
          >
            {lede}
          </Typography>
        ) : null}
        {meta ? (
          <Typography
            variant="body2"
            sx={{
              color: atlas.textMuted,
              mt: 2.5,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {meta}
          </Typography>
        ) : null}
        {children ? <Box sx={{ mt: 3 }}>{children}</Box> : null}
      </PageContainer>
    </HeroSurface>
  );
}
