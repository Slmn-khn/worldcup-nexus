import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Link from "@/components/Link";
import PageContainer from "@/components/layout/PageContainer";
import { formatDate, formatNumber } from "@/lib/format";
import type { PlayerProfileDto } from "@/server/queries/types";

export default function PlayerHero({ player }: { player: PlayerProfileDto }) {
  const { totals } = player;
  const born = formatDate(player.dateOfBirth);

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
            href="/players"
            variant="body2"
            sx={{
              color: "text.secondary",
              "&:hover": { color: "primary.main" },
            }}
          >
            Players
          </Typography>
          <Typography variant="body2" sx={{ color: "text.primary" }}>
            {player.name}
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
          Player Archive
        </Typography>
        <Typography
          variant="h1"
          sx={{ fontSize: { xs: "2.25rem", md: "3.25rem" }, mb: 1 }}
        >
          {player.name}
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
          {[
            player.country !== null
              ? `${player.country.flagEmoji ? `${player.country.flagEmoji} ` : ""}${player.country.name}`
              : null,
            player.position !== null ? `Position: ${player.position}` : null,
            born !== null ? `Born ${born}` : null,
          ]
            .filter((part): part is string => part !== null)
            .join(" · ")}
        </Typography>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ flexWrap: "wrap", rowGap: 1.5 }}
        >
          <Chip
            label={`${formatNumber(totals.selectedTournaments)} World Cup ${totals.selectedTournaments === 1 ? "squad" : "squads"}`}
            sx={{
              bgcolor: "rgba(244, 201, 93, 0.12)",
              color: "primary.main",
              fontWeight: 700,
            }}
          />
          <Chip
            label={`${formatNumber(totals.goals)} ${totals.goals === 1 ? "goal" : "goals"}`}
            variant="outlined"
            sx={{ color: "text.primary", borderColor: "divider" }}
          />
          <Chip
            label={`${formatNumber(totals.bookings)} ${totals.bookings === 1 ? "card" : "cards"}`}
            variant="outlined"
            sx={{ color: "text.secondary", borderColor: "divider" }}
          />
          {totals.penaltyKicksTotal > 0 ? (
            <Chip
              label={`${formatNumber(totals.penaltyKicksConverted)}/${formatNumber(totals.penaltyKicksTotal)} shootout penalties`}
              variant="outlined"
              sx={{ color: "text.secondary", borderColor: "divider" }}
            />
          ) : null}
          {totals.awards > 0 ? (
            <Chip
              icon={
                <EmojiEventsRoundedIcon sx={{ "&&": { color: "#06111F" } }} />
              }
              label={`${formatNumber(totals.awards)} ${totals.awards === 1 ? "award" : "awards"}`}
              sx={{
                bgcolor: "primary.main",
                color: "#06111F",
                fontWeight: 700,
              }}
            />
          ) : null}
        </Stack>

        <Stack direction="row" spacing={3} sx={{ mt: 3.5 }}>
          <Typography
            component={Link}
            href="/players"
            variant="body2"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              color: "text.secondary",
              "&:hover": { color: "primary.main" },
            }}
          >
            <ArrowBackRoundedIcon sx={{ fontSize: 16 }} /> All players
          </Typography>
          {player.country !== null ? (
            <Typography
              component={Link}
              href={`/countries/${player.country.slug}`}
              variant="body2"
              sx={{
                color: "text.secondary",
                "&:hover": { color: "primary.main" },
              }}
            >
              {player.country.name} profile →
            </Typography>
          ) : null}
        </Stack>
      </PageContainer>
    </Box>
  );
}
