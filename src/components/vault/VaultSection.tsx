// Editorial section band: generous vertical rhythm, optional eyebrow,
// uppercase display heading, optional description, optional right-aligned
// uppercase text link ("ALL TOURNAMENTS →").

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import PageContainer from "@/components/layout/PageContainer";
import VaultEyebrow from "./VaultEyebrow";
import { atlas, textLinkSx } from "@/theme/tokens";
import Link from "@/components/Link";

type VaultSectionProps = {
  children?: React.ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Right-aligned uppercase text link. */
  action?: { label: string; href: string };
  id?: string;
  /** Slightly elevated band background for rhythm between sections. */
  band?: boolean;
  sx?: SxProps<Theme>;
};

export default function VaultSection({
  children,
  eyebrow,
  title,
  description,
  action,
  id,
  band = false,
  sx,
}: VaultSectionProps) {
  return (
    <Box
      component="section"
      id={id}
      sx={{
        py: { xs: 6, sm: 8, md: 12 },
        scrollMarginTop: 96,
        ...(band
          ? {
              bgcolor: atlas.canvasSoft,
              borderTop: `1px solid ${atlas.border}`,
              borderBottom: `1px solid ${atlas.border}`,
            }
          : null),
        ...sx,
      }}
    >
      <PageContainer>
        {eyebrow || title || action ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 3,
              mb: title ? 5 : 3,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              {eyebrow ? <VaultEyebrow label={eyebrow} sx={{ mb: 1.5 }} /> : null}
              {title ? (
                <Typography
                  variant="h2"
                  sx={{ fontSize: { xs: "2rem", sm: "2.6rem", md: "3.4rem" } }}
                >
                  {title}
                </Typography>
              ) : null}
              {description ? (
                <Typography
                  variant="body1"
                  sx={{ color: atlas.textSecondary, mt: 1.5, maxWidth: 620 }}
                >
                  {description}
                </Typography>
              ) : null}
            </Box>
            {action ? (
              <Typography
                component={Link}
                href={action.href}
                sx={{ ...textLinkSx, flexShrink: 0, pb: 0.75 }}
              >
                {action.label} →
              </Typography>
            ) : null}
          </Box>
        ) : null}
        {children}
      </PageContainer>
    </Box>
  );
}
