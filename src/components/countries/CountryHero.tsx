import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Link from "@/components/Link";
import PageContainer from "@/components/layout/PageContainer";
import HeroSurface from "@/components/visual/HeroSurface";
import { formatNumber } from "@/lib/format";
import { eyebrowSx, tabularNums } from "@/theme/tokens";
import type { CountryProfileDto } from "@/server/queries/types";

export default function CountryHero({
  country,
}: {
  country: CountryProfileDto;
}) {
  const { totals } = country;

  return (
    <HeroSurface>
      <PageContainer sx={{ py: { xs: 5, md: 7.5 } }}>
        <Breadcrumbs
          separator="/"
          sx={{
            mb: 3,
            "& .MuiBreadcrumbs-separator": { color: "text.secondary" },
          }}
        >
          <Typography
            component={Link}
            href="/"
            variant="body2"
            sx={{
              color: "text.secondary",
              "&:hover": { color: "primary.main" },
            }}
          >
            Home
          </Typography>
          <Typography
            component={Link}
            href="/countries"
            variant="body2"
            sx={{
              color: "text.secondary",
              "&:hover": { color: "primary.main" },
            }}
          >
            Countries
          </Typography>
          <Typography variant="body2" sx={{ color: "text.primary" }}>
            {country.name}
          </Typography>
        </Breadcrumbs>

        <Typography
          variant="overline"
          component="p"
          sx={{ ...eyebrowSx, color: "primary.main", mb: 1.5 }}
        >
          Nation Archive
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "baseline", mb: 1, flexWrap: "wrap" }}
        >
          <Typography
            variant="h1"
            sx={{ fontSize: { xs: "2.25rem", md: "3.25rem" } }}
          >
            {country.flagEmoji ? `${country.flagEmoji} ` : ""}
            {country.name}
          </Typography>
          {country.code !== null ? (
            <Typography
              variant="h6"
              component="span"
              sx={{ color: "text.secondary" }}
            >
              {country.code}
            </Typography>
          ) : null}
        </Stack>
        <Typography
          variant="body1"
          sx={{ ...tabularNums, color: "text.secondary", mb: 3 }}
        >
          {formatNumber(totals.tournamentsEntered)} tournaments ·{" "}
          {formatNumber(totals.matchesPlayed)} matches ·{" "}
          {formatNumber(totals.goalsFor)} goals scored
        </Typography>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ flexWrap: "wrap", rowGap: 1.5 }}
        >
          {totals.titles > 0 ? (
            <Chip
              icon={
                <EmojiEventsRoundedIcon sx={{ "&&": { color: "#06111F" } }} />
              }
              label={`${formatNumber(totals.titles)} ${totals.titles === 1 ? "title" : "titles"}`}
              sx={{
                bgcolor: "primary.main",
                color: "#06111F",
                fontWeight: 700,
              }}
            />
          ) : null}
          {totals.finalsPlayed > 0 ? (
            <Chip
              label={`${formatNumber(totals.finalsPlayed)} ${totals.finalsPlayed === 1 ? "final" : "finals"}`}
              variant="outlined"
              sx={{ color: "text.primary", borderColor: "divider" }}
            />
          ) : null}
          <Chip
            label={`${formatNumber(totals.wins)}W · ${formatNumber(totals.draws)}D · ${formatNumber(totals.losses)}L`}
            variant="outlined"
            sx={{ color: "text.secondary", borderColor: "divider" }}
          />
        </Stack>

        <Typography
          component={Link}
          href="/countries"
          variant="body2"
          sx={{
            mt: 3.5,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            color: "text.secondary",
            "&:hover": { color: "primary.main" },
          }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 16 }} /> All countries
        </Typography>
      </PageContainer>
    </HeroSurface>
  );
}
