"use client";

// Homepage "Latest Matches / 2026 Schedule & Scores" section. Tabs switch
// between pre-loaded server data (no client-side provider/API calls) — Latest,
// Live, Today, Results, Upcoming — over the black-canvas Vault system with the
// gold live accent. Empty states are honest and offer the next fixture.

import * as React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import VaultButton from "@/components/vault/VaultButton";
import { atlas, eyebrowSx } from "@/theme/tokens";
import type { FixtureDto, FixtureFreshness } from "@/server/fixtures/types";
import FixtureCard from "./FixtureCard";
import FixtureFreshnessNote from "./FixtureFreshnessNote";

export type HomeFixtureData = {
  latest: FixtureDto[];
  live: FixtureDto[];
  today: FixtureDto[];
  results: FixtureDto[];
  upcoming: FixtureDto[];
  nextUpcoming: FixtureDto | null;
  freshness: FixtureFreshness;
};

type TabKey = "latest" | "live" | "today" | "results" | "upcoming";

const CARD_GRID = {
  display: "grid",
  gap: 2,
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
};

export default function HomeLatestMatchesSection({
  data,
}: {
  data: HomeFixtureData;
}) {
  const [tab, setTab] = React.useState<TabKey>(
    data.live.length > 0 ? "live" : "latest",
  );

  const tabs: { key: TabKey; label: string; fixtures: FixtureDto[] }[] = [
    { key: "latest", label: "Latest", fixtures: data.latest },
    { key: "live", label: "Live", fixtures: data.live },
    { key: "today", label: "Today", fixtures: data.today },
    { key: "results", label: "Results", fixtures: data.results },
    { key: "upcoming", label: "Upcoming", fixtures: data.upcoming },
  ];

  const current = tabs.find((entry) => entry.key === tab) ?? tabs[0];
  const hasAnyData = tabs.some((entry) => entry.fixtures.length > 0);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <FixtureFreshnessNote freshness={data.freshness} />
      </Box>

      {!hasAnyData ? (
        <EmptyPanel
          title="No 2026 fixtures yet"
          description="The 2026 schedule appears here once a sync runs. Check back soon."
        />
      ) : (
        <>
          <Tabs
            value={current.key}
            onChange={(_event, value: TabKey) => setTab(value)}
            variant="scrollable"
            scrollButtons={false}
            allowScrollButtonsMobile
            aria-label="2026 fixtures view"
            sx={{
              minHeight: 0,
              mb: 3,
              borderBottom: `1px solid ${atlas.border}`,
              "& .MuiTabs-indicator": { backgroundColor: atlas.textPrimary, height: 2 },
              "& .MuiTab-root": {
                ...eyebrowSx,
                fontSize: "0.72rem",
                color: atlas.textMuted,
                minHeight: 44,
                minWidth: 0,
                px: 2,
                "&.Mui-selected": { color: atlas.textPrimary },
              },
            }}
          >
            {tabs.map((entry) => (
              <Tab
                key={entry.key}
                value={entry.key}
                label={
                  entry.key === "live" && entry.fixtures.length > 0
                    ? `Live · ${entry.fixtures.length}`
                    : entry.label
                }
              />
            ))}
          </Tabs>

          <Box role="tabpanel">
            {current.fixtures.length > 0 ? (
              <Box sx={CARD_GRID}>
                {current.fixtures.map((fixture) => (
                  <FixtureCard key={fixture.id} fixture={fixture} />
                ))}
              </Box>
            ) : (
              <PanelEmptyState tabKey={current.key} nextUpcoming={data.nextUpcoming} />
            )}
          </Box>
        </>
      )}

      <Box sx={{ mt: 4 }}>
        <VaultButton component={Link} href="/schedule/2026" variant="outline">
          View Full 2026 Schedule
        </VaultButton>
      </Box>
    </Box>
  );
}

function PanelEmptyState({
  tabKey,
  nextUpcoming,
}: {
  tabKey: TabKey;
  nextUpcoming: FixtureDto | null;
}) {
  if (tabKey === "live") {
    return <EmptyPanel title="No live matches right now." />;
  }
  if (tabKey === "today") {
    return (
      <Box>
        <EmptyPanel title="No World Cup matches scheduled today." />
        {nextUpcoming !== null ? (
          <Box sx={{ mt: 3 }}>
            <Typography
              component="p"
              sx={{ ...eyebrowSx, fontSize: "0.62rem", color: atlas.textMuted, mb: 1.5 }}
            >
              Next up
            </Typography>
            <Box sx={{ maxWidth: 420 }}>
              <FixtureCard fixture={nextUpcoming} />
            </Box>
          </Box>
        ) : null}
      </Box>
    );
  }
  if (tabKey === "results") {
    return <EmptyPanel title="No finished matches yet." />;
  }
  if (tabKey === "upcoming") {
    return <EmptyPanel title="No upcoming matches scheduled." />;
  }
  return <EmptyPanel title="No matches to show." />;
}

function EmptyPanel({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Box
      sx={{
        border: `1px solid ${atlas.border}`,
        bgcolor: atlas.surfaceSoft,
        px: 4,
        py: 5,
        textAlign: "center",
      }}
    >
      <Typography
        component="p"
        sx={{
          color: atlas.textSecondary,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontSize: "0.9rem",
        }}
      >
        {title}
      </Typography>
      {description !== undefined ? (
        <Typography variant="body2" sx={{ color: atlas.textMuted, mt: 1 }}>
          {description}
        </Typography>
      ) : null}
    </Box>
  );
}
