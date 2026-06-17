// Explore by Country (neon pass). A responsive grid of glowing country pills
// (flag + name + entries), alternating gold/cyan, for the nations with the most
// tournament entries. Data-backed; flags render via the CSS CountryFlag with its
// own neutral fallback.

import Box from "@mui/material/Box";
import HomeSection from "./HomeSection";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";
import CountryPill from "./CountryPill";
import type { HomeCountryHighlight } from "@/server/home/queries";

const GRID = {
  display: "grid",
  gap: { xs: 1.5, sm: 2, md: 2.5 },
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
    md: "repeat(3, minmax(0, 1fr))",
  },
};

export default function ExploreByCountrySection({
  countries,
}: {
  countries: HomeCountryHighlight[];
}) {
  return (
    <HomeSection divider>
      <SectionHeader
        eyebrow="The nations"
        title="Explore by Country"
        accent="cyan"
        subtitle="Nations with the most tournament entries."
        action={{ label: "All countries", href: "/countries" }}
      />
      {countries.length > 0 ? (
        <Box sx={GRID}>
          {countries.map((country, index) => (
            <CountryPill
              key={country.id}
              country={country}
              accent={index % 2 === 0 ? "cyan" : "gold"}
            />
          ))}
        </Box>
      ) : (
        <EmptyState
          title="Countries coming soon"
          description="Country data has not been imported yet."
        />
      )}
    </HomeSection>
  );
}
