// National history dossier hero: huge uppercase country name, archive
// totals as uppercase metadata, gold title marker.

import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Link from "@/components/Link";
import PageContainer from "@/components/layout/PageContainer";
import VaultEyebrow from "@/components/vault/VaultEyebrow";
import { formatNumber } from "@/lib/format";
import { atlas, eyebrowSx, tabularNums, textLinkSx } from "@/theme/tokens";
import type { CountryProfileDto } from "@/server/queries/types";

export default function CountryHero({
  country,
}: {
  country: CountryProfileDto;
}) {
  const { totals } = country;

  return (
    <Box sx={{ borderBottom: `1px solid ${atlas.border}`, bgcolor: atlas.black }}>
      <PageContainer sx={{ py: { xs: 6, md: 9 } }}>
        <Breadcrumbs separator="/" sx={{ mb: 4 }}>
          <Typography
            component={Link}
            href="/"
            variant="body2"
            sx={{ color: atlas.textMuted, "&:hover": { color: atlas.textPrimary } }}
          >
            Home
          </Typography>
          <Typography
            component={Link}
            href="/countries"
            variant="body2"
            sx={{ color: atlas.textMuted, "&:hover": { color: atlas.textPrimary } }}
          >
            Countries
          </Typography>
          <Typography variant="body2" sx={{ color: atlas.textSecondary }}>
            {country.name}
          </Typography>
        </Breadcrumbs>

        <VaultEyebrow label="Nation Archive" sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, flexWrap: "wrap" }}>
          <Typography
            variant="h1"
            sx={{ fontSize: { xs: "3rem", sm: "3.8rem", md: "5rem" } }}
          >
            {country.flagEmoji ? `${country.flagEmoji} ` : ""}
            {country.name}
          </Typography>
          {country.code !== null ? (
            <Typography sx={{ ...eyebrowSx, color: atlas.textMuted }}>
              {country.code}
            </Typography>
          ) : null}
        </Box>
        <Typography
          variant="body1"
          sx={{ ...tabularNums, color: atlas.textSecondary, mt: 2 }}
        >
          {formatNumber(totals.tournamentsEntered)} tournaments ·{" "}
          {formatNumber(totals.matchesPlayed)} matches ·{" "}
          {formatNumber(totals.goalsFor)} goals scored ·{" "}
          {formatNumber(totals.wins)}W {formatNumber(totals.draws)}D{" "}
          {formatNumber(totals.losses)}L
        </Typography>
        {totals.titles > 0 ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mt: 2 }}>
            <Box aria-hidden sx={{ width: 6, height: 6, bgcolor: atlas.gold }} />
            <Typography sx={{ ...eyebrowSx, color: atlas.gold }}>
              {formatNumber(totals.titles)}{" "}
              {totals.titles === 1 ? "World title" : "World titles"}
              {totals.finalsPlayed > 0
                ? ` · ${formatNumber(totals.finalsPlayed)} ${totals.finalsPlayed === 1 ? "final" : "finals"}`
                : ""}
            </Typography>
          </Box>
        ) : null}

        <Typography
          component={Link}
          href="/countries"
          sx={{ ...textLinkSx, color: atlas.textMuted, mt: 4 }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 14 }} /> All countries
        </Typography>
      </PageContainer>
    </Box>
  );
}
