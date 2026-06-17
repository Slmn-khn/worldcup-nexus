// Homepage hero (Phase 4). Cinematic black band with the brand banner as a
// right-weighted backdrop behind a dark gradient — the real <h1>/subtitle carry
// the title, the image is decorative support (UI_STYLE_GUIDE brand rules). Gold
// micro-accent via the eyebrow. No FIFA marks, no copyrighted photography.

import Image from "next/image";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import PageContainer from "@/components/layout/PageContainer";
import VaultEyebrow from "@/components/vault/VaultEyebrow";
import VaultButton from "@/components/vault/VaultButton";
import GlobalSearch from "@/components/ui/GlobalSearch";
import { atlas } from "@/theme/tokens";

type HomeHeroProps = {
  /** e.g. "1930–2022" — derived from the archive, never hardcoded. */
  span?: string | null;
};

export default function HomeHero({ span }: HomeHeroProps) {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderBottom: `1px solid ${atlas.border}`,
        bgcolor: atlas.black,
      }}
    >
      <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Image
          src="/brand/worldcup-nexus-banner.png"
          alt="WORLDCUP Nexus — independent World Cup archive"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center right" }}
        />
        {/* Dark gradient keeps the headline and copy readable; on wide screens
            it fades to the right so the artwork still reads. */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background: {
              xs: "linear-gradient(180deg, rgba(0,0,0,0.74) 0%, rgba(0,0,0,0.9) 100%)",
              md: `linear-gradient(90deg, ${atlas.black} 0%, rgba(0,0,0,0.92) 36%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.32) 100%)`,
            },
          }}
        />
      </Box>

      <PageContainer
        sx={{ position: "relative", zIndex: 1, py: { xs: 9, md: 14 } }}
      >
        <VaultEyebrow
          label={span != null ? `The Archive · ${span}` : "The Archive"}
          sx={{ mb: 3 }}
        />
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "3rem", sm: "4rem", md: "5.2rem" },
            maxWidth: 1000,
            mb: 3,
          }}
        >
          Explore the World Cup like never before
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: atlas.textSecondary,
            fontSize: { xs: "1rem", md: "1.1rem" },
            maxWidth: 640,
            mb: 5,
          }}
        >
          Every tournament, nation, player, match, goal, record, and 2026
          fixture in one independent football archive.
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 7 }}
        >
          <VaultButton component={Link} href="/tournaments" variant="primary">
            Explore Tournaments
          </VaultButton>
          <VaultButton component={Link} href="/schedule/2026" variant="outline">
            View 2026 Schedule
          </VaultButton>
        </Stack>
        <Box sx={{ maxWidth: 680 }}>
          <GlobalSearch />
        </Box>
      </PageContainer>
    </Box>
  );
}
