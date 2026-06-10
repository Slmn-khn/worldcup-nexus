import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Link from "@/components/Link";
import PageContainer from "@/components/layout/PageContainer";
import SectionHeading from "@/components/ui/SectionHeading";
import StatCard from "@/components/ui/StatCard";
import GlobalSearch from "@/components/ui/GlobalSearch";
import TournamentCard from "@/components/tournaments/TournamentCard";
import MatchCard from "@/components/matches/MatchCard";
import CountryCard from "@/components/countries/CountryCard";
import PlayerCard from "@/components/players/PlayerCard";
import RecordCard from "@/components/records/RecordCard";
import {
  MOCK_ARCHIVE_STATS,
  MOCK_TOURNAMENTS,
  MOCK_MATCHES,
  MOCK_COUNTRIES,
  MOCK_PLAYERS,
  MOCK_RECORDS,
} from "@/lib/mock-data";

function ViewAllLink({ href, label }: { href: string; label: string }) {
  return (
    <Button
      component={Link}
      href={href}
      size="small"
      endIcon={<ArrowForwardRoundedIcon />}
      sx={{ color: "primary.main" }}
    >
      {label}
    </Button>
  );
}

export default function Home() {
  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          background:
            "radial-gradient(ellipse 80% 60% at 70% -10%, rgba(244, 201, 93, 0.12), transparent), " +
            "radial-gradient(ellipse 60% 50% at 20% 110%, rgba(31, 122, 77, 0.18), transparent), " +
            "#06111F",
        }}
      >
        <PageContainer sx={{ py: { xs: 8, md: 12 } }}>
          <Typography
            variant="overline"
            sx={{
              color: "primary.main",
              letterSpacing: "0.2em",
              display: "block",
              mb: 2,
            }}
          >
            The Football Archive
          </Typography>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2.25rem", sm: "3rem", md: "3.75rem" },
              maxWidth: 820,
              mb: 2.5,
            }}
          >
            Explore the Complete History of the World Cup
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{
              color: "text.secondary",
              fontWeight: 400,
              maxWidth: 640,
              mb: 4,
            }}
          >
            Every tournament, nation, player, match, goal, and penalty in one
            independent historical archive.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 7 }}
          >
            <Button
              component={Link}
              href="/tournaments"
              variant="contained"
              size="large"
            >
              Explore Tournaments
            </Button>
            <Button
              component={Link}
              href="/records"
              variant="outlined"
              size="large"
              sx={{
                color: "text.primary",
                borderColor: "divider",
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              View Records
            </Button>
          </Stack>
          <Box sx={{ maxWidth: 720 }}>
            <GlobalSearch />
          </Box>
        </PageContainer>
      </Box>

      {/* Archive at a Glance */}
      <PageContainer sx={{ py: { xs: 6, md: 8 } }}>
        <SectionHeading
          title="Archive at a Glance"
          subtitle="Placeholder figures shown while the data import pipeline is under construction."
        />
        <Box
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          }}
        >
          {MOCK_ARCHIVE_STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </Box>
      </PageContainer>

      {/* Featured Tournaments */}
      <PageContainer sx={{ py: { xs: 6, md: 8 } }}>
        <SectionHeading
          title="Featured Tournaments"
          subtitle="Landmark editions from nearly a century of World Cup football."
          action={<ViewAllLink href="/tournaments" label="All tournaments" />}
        />
        <Box
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(3, 1fr)",
            },
          }}
        >
          {MOCK_TOURNAMENTS.map((tournament) => (
            <TournamentCard key={tournament.year} {...tournament} />
          ))}
        </Box>
      </PageContainer>

      {/* Iconic Matches */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <PageContainer sx={{ py: { xs: 6, md: 8 } }}>
          <SectionHeading
            title="Iconic Matches"
            subtitle="The games that defined eras — replayed through data."
            action={<ViewAllLink href="/matches" label="All matches" />}
          />
          <Box
            sx={{
              display: "grid",
              gap: 2.5,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "repeat(3, 1fr)",
              },
            }}
          >
            {MOCK_MATCHES.map((match) => (
              <MatchCard key={match.title} {...match} />
            ))}
          </Box>
        </PageContainer>
      </Box>

      {/* Explore by Country */}
      <PageContainer sx={{ py: { xs: 6, md: 8 } }}>
        <SectionHeading
          title="Explore by Country"
          subtitle="Follow a nation through every qualification, squad, and final."
          action={<ViewAllLink href="/countries" label="All countries" />}
        />
        <Box
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(4, 1fr)",
            },
          }}
        >
          {MOCK_COUNTRIES.map((country) => (
            <CountryCard key={country.name} {...country} />
          ))}
        </Box>
      </PageContainer>

      {/* Legendary Players */}
      <PageContainer sx={{ py: { xs: 6, md: 8 } }}>
        <SectionHeading
          title="Legendary Players"
          subtitle="Careers measured in goals, minutes, and moments."
          action={<ViewAllLink href="/players" label="All players" />}
        />
        <Box
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(4, 1fr)",
            },
          }}
        >
          {MOCK_PLAYERS.map((player) => (
            <PlayerCard key={player.name} {...player} />
          ))}
        </Box>
      </PageContainer>

      {/* Records Preview */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <PageContainer sx={{ py: { xs: 6, md: 8 } }}>
          <SectionHeading
            title="Records"
            subtitle="The numbers behind the history — preview values shown until real data lands."
            action={<ViewAllLink href="/records" label="All records" />}
          />
          <Box
            sx={{
              display: "grid",
              gap: 2.5,
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            }}
          >
            {MOCK_RECORDS.map((record) => (
              <RecordCard key={record.title} {...record} />
            ))}
          </Box>
        </PageContainer>
      </Box>
    </Box>
  );
}
