// Archive at a Glance (neon pass). Five bright stat cards alternating gold and
// cyan, with large glowing numbers and uppercase labels. Values are real
// (getHomeViewModel → getArchiveStats); champions + span are derived from
// tournament data, never hardcoded. Honest empty state when the archive is bare.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import SportsSoccerRoundedIcon from "@mui/icons-material/SportsSoccerRounded";
import StadiumRoundedIcon from "@mui/icons-material/StadiumRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import MilitaryTechRoundedIcon from "@mui/icons-material/MilitaryTechRounded";
import type { SvgIconComponent } from "@mui/icons-material";
import HomeSection from "./HomeSection";
import SectionHeader from "@/components/ui/SectionHeader";
import GlowCard from "@/components/ui/GlowCard";
import EmptyState from "@/components/ui/EmptyState";
import { atlas } from "@/theme/tokens";
import { formatNumber } from "@/lib/format";
import {
  atlasColors,
  atlasGlow,
  accentTextSx,
  type AtlasAccent,
} from "@/theme/visualTokens";
import type { HomeArchiveStats } from "@/server/home/queries";

const GRID = {
  display: "grid",
  gap: { xs: 2, md: 2.5 },
  gridTemplateColumns: {
    xs: "1fr 1fr",
    sm: "repeat(3, 1fr)",
    md: "repeat(5, 1fr)",
  },
};

function StatCard({
  value,
  label,
  accent,
  Icon,
}: {
  value: string;
  label: string;
  accent: AtlasAccent;
  Icon: SvgIconComponent;
}) {
  const accentColor = accent === "gold" ? atlasColors.gold : atlasColors.cyan;
  const glow = accent === "gold" ? atlasGlow.gold : atlasGlow.cyan;
  return (
    <GlowCard variant={accent} sx={{ p: { xs: 2, md: 2.75 } }}>
      <Box
        aria-hidden
        sx={{
          display: "inline-flex",
          mb: 1.5,
          color: accentColor,
          filter: `drop-shadow(0 0 10px ${glow})`,
        }}
      >
        <Icon sx={{ fontSize: 26 }} />
      </Box>
      <Typography
        component="p"
        sx={{
          fontFamily: atlas.fontDisplay,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          fontSize: { xs: "1.9rem", md: "2.5rem" },
          lineHeight: 1,
          mb: 0.75,
          ...accentTextSx(accent),
        }}
      >
        {value}
      </Typography>
      <Typography
        component="p"
        sx={{
          fontSize: "0.66rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: atlasColors.textSecondary,
        }}
      >
        {label}
      </Typography>
    </GlowCard>
  );
}

export default function ArchiveStatsSection({
  stats,
}: {
  stats: HomeArchiveStats;
}) {
  const span =
    stats.spanStart !== null && stats.spanEnd !== null
      ? `${stats.spanStart}–${stats.spanEnd}`
      : null;
  const isEmpty =
    stats.tournaments === 0 && stats.matches === 0 && stats.goals === 0;

  return (
    <HomeSection divider>
      <SectionHeader
        eyebrow="The numbers"
        title="Archive at a Glance"
        accent="cyan"
        subtitle={span !== null ? `An archive spanning ${span}.` : undefined}
      />
      {isEmpty ? (
        <EmptyState
          title="Archive coming soon"
          description="Tournament, match, and goal data appears here once the historical import is connected."
        />
      ) : (
        <Box sx={GRID}>
          <StatCard
            value={formatNumber(stats.tournaments)}
            label="Tournaments"
            accent="gold"
            Icon={EmojiEventsRoundedIcon}
          />
          <StatCard
            value={formatNumber(stats.matches)}
            label="Matches"
            accent="cyan"
            Icon={StadiumRoundedIcon}
          />
          <StatCard
            value={formatNumber(stats.goals)}
            label="Goals"
            accent="gold"
            Icon={SportsSoccerRoundedIcon}
          />
          <StatCard
            value={formatNumber(stats.nations)}
            label="Nations"
            accent="cyan"
            Icon={PublicRoundedIcon}
          />
          <StatCard
            value={formatNumber(stats.champions)}
            label="Champions"
            accent="gold"
            Icon={MilitaryTechRoundedIcon}
          />
        </Box>
      )}
    </HomeSection>
  );
}
