// Career dossier hero: huge uppercase player name, nation/position
// metadata, archive totals as an uppercase fact line. Squad selections are
// labeled as squads — never as appearances.

import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Link from "@/components/Link";
import PageContainer from "@/components/layout/PageContainer";
import VaultEyebrow from "@/components/vault/VaultEyebrow";
import PlayerPortrait from "@/components/media/PlayerPortrait";
import { formatDate, formatNumber } from "@/lib/format";
import { atlas, eyebrowSx, tabularNums, textLinkSx } from "@/theme/tokens";
import type { PlayerProfileDto } from "@/server/queries/types";

export default function PlayerHero({
  player,
  portraitUrl,
}: {
  player: PlayerProfileDto;
  /** Approved portrait URL; the portrait falls back to initials when absent. */
  portraitUrl?: string | null;
}) {
  const { totals } = player;
  const born = formatDate(player.dateOfBirth);

  const factLine = [
    `${formatNumber(totals.selectedTournaments)} World Cup ${totals.selectedTournaments === 1 ? "squad" : "squads"}`,
    `${formatNumber(totals.goals)} ${totals.goals === 1 ? "goal" : "goals"}`,
    `${formatNumber(totals.bookings)} ${totals.bookings === 1 ? "card" : "cards"}`,
    totals.penaltyKicksTotal > 0
      ? `${formatNumber(totals.penaltyKicksConverted)}/${formatNumber(totals.penaltyKicksTotal)} shootout penalties`
      : null,
  ].filter((part): part is string => part !== null);

  return (
    <Box
      sx={{ borderBottom: `1px solid ${atlas.border}`, bgcolor: atlas.black }}
    >
      <PageContainer sx={{ py: { xs: 6, md: 9 } }}>
        <Breadcrumbs separator="/" sx={{ mb: 4 }}>
          <Typography
            component={Link}
            href="/"
            variant="body2"
            sx={{
              color: atlas.textMuted,
              "&:hover": { color: atlas.textPrimary },
            }}
          >
            Home
          </Typography>
          <Typography
            component={Link}
            href="/players"
            variant="body2"
            sx={{
              color: atlas.textMuted,
              "&:hover": { color: atlas.textPrimary },
            }}
          >
            Players
          </Typography>
          <Typography variant="body2" sx={{ color: atlas.textSecondary }}>
            {player.name}
          </Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 3, md: 5 },
            alignItems: { md: "flex-start" },
          }}
        >
          {/* Fallback-first: shows the approved portrait when one exists,
              otherwise the initials crest — never a broken image. */}
          <PlayerPortrait
            name={player.name}
            imageUrl={portraitUrl}
            countryName={player.country?.name ?? null}
            size="xl"
            alt={`${player.name} portrait`}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <VaultEyebrow label="Player Archive" sx={{ mb: 2 }} />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "3rem", sm: "3.8rem", md: "5rem" },
                mb: 1.5,
              }}
            >
              {player.name}
            </Typography>
            <Typography
              component="p"
              sx={{ ...eyebrowSx, color: atlas.textSecondary, mb: 2 }}
            >
              {player.country !== null
                ? `${player.country.flagEmoji ? `${player.country.flagEmoji} ` : ""}${player.country.name}`
                : "Nation unknown"}
              {player.position !== null ? (
                <Box component="span" sx={{ color: atlas.gold, ml: 1.25 }}>
                  {player.position}
                </Box>
              ) : null}
              {born !== null ? (
                <Box component="span" sx={{ color: atlas.textMuted, ml: 1.25 }}>
                  Born {born}
                </Box>
              ) : null}
            </Typography>
            <Typography
              variant="body1"
              sx={{ ...tabularNums, color: atlas.textSecondary }}
            >
              {factLine.join(" · ")}
            </Typography>
            {totals.awards > 0 ? (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.25, mt: 2 }}
              >
                <Box
                  aria-hidden
                  sx={{ width: 6, height: 6, bgcolor: atlas.gold }}
                />
                <Typography sx={{ ...eyebrowSx, color: atlas.gold }}>
                  {formatNumber(totals.awards)}{" "}
                  {totals.awards === 1
                    ? "tournament award"
                    : "tournament awards"}
                </Typography>
              </Box>
            ) : null}

            <Box sx={{ display: "flex", gap: 4, mt: 4, flexWrap: "wrap" }}>
              <Typography
                component={Link}
                href="/players"
                sx={{ ...textLinkSx, color: atlas.textMuted }}
              >
                <ArrowBackRoundedIcon sx={{ fontSize: 14 }} /> All players
              </Typography>
              {player.country !== null ? (
                <Typography
                  component={Link}
                  href={`/countries/${player.country.slug}`}
                  sx={{ ...textLinkSx, color: atlas.textMuted }}
                >
                  {player.country.name} profile →
                </Typography>
              ) : null}
            </Box>
          </Box>
        </Box>
      </PageContainer>
    </Box>
  );
}
