// Page header band: eyebrow, huge condensed uppercase title, short intro,
// optional meta fact line and CTA. Pure black canvas with a bottom hairline.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PageContainer from "@/components/layout/PageContainer";
import VaultEyebrow from "./VaultEyebrow";
import { atlas, tabularNums } from "@/theme/tokens";

type VaultPageHeaderProps = {
  eyebrow?: string;
  title: string;
  lede?: string;
  /** Small fact line under the lede, e.g. "1,248 matches in the archive". */
  meta?: React.ReactNode;
  /** Extra content below the text stack (buttons, search, chips, …). */
  children?: React.ReactNode;
};

export default function VaultPageHeader({
  eyebrow = "The Archive",
  title,
  lede,
  meta,
  children,
}: VaultPageHeaderProps) {
  return (
    <Box sx={{ borderBottom: `1px solid ${atlas.border}`, bgcolor: atlas.black }}>
      <PageContainer sx={{ py: { xs: 7, md: 10 } }}>
        <VaultEyebrow label={eyebrow} sx={{ mb: 2.5 }} />
        <Typography
          variant="h1"
          sx={{ fontSize: { xs: "3rem", sm: "3.6rem", md: "4.6rem" }, mb: 2 }}
        >
          {title}
        </Typography>
        {lede ? (
          <Typography
            variant="body1"
            sx={{
              color: atlas.textSecondary,
              fontSize: { xs: "1rem", md: "1.08rem" },
              maxWidth: 640,
            }}
          >
            {lede}
          </Typography>
        ) : null}
        {meta ? (
          <Typography
            variant="body2"
            sx={{ ...tabularNums, color: atlas.textMuted, mt: 2.5 }}
          >
            {meta}
          </Typography>
        ) : null}
        {children ? <Box sx={{ mt: 4 }}>{children}</Box> : null}
      </PageContainer>
    </Box>
  );
}
