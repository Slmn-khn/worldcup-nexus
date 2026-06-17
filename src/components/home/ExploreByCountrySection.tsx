// Explore by Country (Phase 4). A responsive grid of nation pills (flag + name +
// entries) for the nations with the most tournament entries. Data-backed; flags
// render via the CSS CountryFlag component with its own neutral fallback.

import Box from "@mui/material/Box";
import VaultSection from "@/components/vault/VaultSection";
import EmptyState from "@/components/ui/EmptyState";
import CountryPill from "./CountryPill";
import type { HomeCountryHighlight } from "@/server/home/queries";

const GRID = {
  display: "grid",
  gap: 2,
  gridTemplateColumns: {
    xs: "1fr",
    sm: "1fr 1fr",
    md: "repeat(3, 1fr)",
    lg: "repeat(4, 1fr)",
  },
};

export default function ExploreByCountrySection({
  countries,
}: {
  countries: HomeCountryHighlight[];
}) {
  return (
    <VaultSection
      eyebrow="The nations"
      title="Explore by Country"
      description="Nations with the most tournament entries."
      action={{ label: "All countries", href: "/countries" }}
    >
      {countries.length > 0 ? (
        <Box sx={GRID}>
          {countries.map((country) => (
            <CountryPill key={country.id} country={country} />
          ))}
        </Box>
      ) : (
        <EmptyState
          title="Countries coming soon"
          description="Country data has not been imported yet."
        />
      )}
    </VaultSection>
  );
}
