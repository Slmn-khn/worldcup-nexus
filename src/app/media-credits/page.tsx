// Media Credits (Phase 3) — public attribution surface generated entirely from
// APPROVED MediaAsset rows. Honors the license policy: every public image must
// carry source, creator, and license. rawMetadata is never exposed.

import type { Metadata } from "next";
import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import PageContainer from "@/components/layout/PageContainer";
import VaultPageHeader from "@/components/vault/VaultPageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { getApprovedMediaCredits } from "@/server/media/queries";
import { atlas, eyebrowSx } from "@/theme/tokens";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Media Credits",
  description:
    "Image credits and licenses for approved media used in WORLDCUP Nexus.",
};

const LABEL_SX = {
  ...eyebrowSx,
  fontSize: "0.65rem",
  color: atlas.textMuted,
} as const;

function CreditField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography component="p" sx={LABEL_SX}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        component="div"
        sx={{ color: atlas.textSecondary, mt: 0.25 }}
      >
        {children}
      </Typography>
    </Box>
  );
}

export default async function MediaCreditsPage() {
  const credits = await getApprovedMediaCredits();

  return (
    <Box>
      <VaultPageHeader
        eyebrow="Attribution"
        title="Media Credits"
        lede="Image credits and licenses for approved media used in WORLDCUP Nexus."
        meta={
          credits.length > 0
            ? `${credits.length} approved ${credits.length === 1 ? "image" : "images"} credited`
            : undefined
        }
      />

      <PageContainer component="section" sx={{ py: { xs: 5, md: 7 } }}>
        {credits.length > 0 ? (
          <Stack spacing={2.5} sx={{ maxWidth: 880 }}>
            {credits.map((credit) => {
              const heading =
                credit.title ?? credit.altText ?? "Untitled image";
              return (
                <Box
                  key={credit.id}
                  sx={{
                    border: `1px solid ${atlas.border}`,
                    bgcolor: atlas.surface1,
                    p: { xs: 2.5, md: 3 },
                  }}
                >
                  <Typography
                    component="h2"
                    sx={{
                      fontFamily: atlas.fontDisplay,
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      color: atlas.textPrimary,
                      mb: 2,
                    }}
                  >
                    {heading}
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gap: 2,
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    }}
                  >
                    {credit.creatorName ? (
                      <CreditField label="Creator">
                        {credit.creatorName}
                      </CreditField>
                    ) : null}
                    <CreditField label="License">
                      {credit.licenseUrl ? (
                        <MuiLink
                          href={credit.licenseUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          sx={{ color: atlas.gold }}
                        >
                          {credit.licenseName ?? credit.licenseType}
                        </MuiLink>
                      ) : (
                        (credit.licenseName ?? credit.licenseType)
                      )}
                    </CreditField>
                    <CreditField label="Provider">
                      {credit.provider.replaceAll("_", " ")}
                    </CreditField>
                    {credit.sourcePageUrl ? (
                      <CreditField label="Source">
                        <MuiLink
                          href={credit.sourcePageUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          sx={{
                            color: atlas.textSecondary,
                            "&:hover": { color: atlas.textPrimary },
                            wordBreak: "break-all",
                          }}
                        >
                          {credit.sourcePageUrl}
                        </MuiLink>
                      </CreditField>
                    ) : null}
                  </Box>
                  {credit.creditText ? (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        color: atlas.textMuted,
                        mt: 2,
                        pt: 2,
                        borderTop: `1px solid ${atlas.border}`,
                      }}
                    >
                      {credit.creditText}
                    </Typography>
                  ) : null}
                </Box>
              );
            })}
          </Stack>
        ) : (
          <EmptyState
            title="No credited media yet"
            description="Approved, license-cleared images will be credited here as they are added. The archive renders fully without them."
          />
        )}
      </PageContainer>
    </Box>
  );
}
