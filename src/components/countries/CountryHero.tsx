import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Link from "@/components/Link";
import PageContainer from "@/components/layout/PageContainer";
import { formatNumber } from "@/lib/format";
import type { CountryProfileDto } from "@/server/queries/types";

export default function CountryHero({
  country,
}: {
  country: CountryProfileDto;
}) {
  const { totals } = country;

  return (
    <Box
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        background:
          "radial-gradient(ellipse 70% 70% at 75% -20%, rgba(244, 201, 93, 0.14), transparent), " +
          "radial-gradient(ellipse 50% 50% at 15% 110%, rgba(31, 122, 77, 0.14), transparent), #06111F",
      }}
    >
      <PageContainer sx={{ py: { xs: 5, md: 8 } }}>
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
          sx={{
            color: "primary.main",
            letterSpacing: "0.2em",
            display: "block",
            mb: 1,
          }}
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
        <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
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
    </Box>
  );
}
