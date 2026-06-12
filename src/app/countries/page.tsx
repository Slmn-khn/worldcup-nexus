// Countries index page — database-backed via the query layer.

import type { Metadata } from "next";
import Box from "@mui/material/Box";
import PageContainer from "@/components/layout/PageContainer";
import VaultPageHeader from "@/components/vault/VaultPageHeader";
import EmptyState from "@/components/ui/EmptyState";
import CountryCard from "@/components/countries/CountryCard";
import { formatNumber } from "@/lib/format";
import { getCountryCards } from "@/server/queries/countries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "World Cup Nations",
  description: "Explore every World Cup nation in the WorldCup Atlas archive.",
};

export default async function CountriesPage() {
  const countries = await getCountryCards();

  return (
    <Box>
      <VaultPageHeader
        title="World Cup Nations"
        lede="Explore every nation and team history recorded in the WorldCup Atlas database."
        meta={`${formatNumber(countries.length)} nations in the archive`}
      />

      <PageContainer sx={{ py: { xs: 6, md: 10 } }}>
        {countries.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              },
            }}
          >
            {countries.map((country) => (
              <CountryCard
                key={country.id}
                name={country.name}
                flagEmoji={country.flagEmoji}
                code={country.code}
                tournamentsCount={country.tournamentsEntered}
                matchesCount={country.matchesCount}
                goalsCount={country.goalsFor}
                titlesCount={country.titlesCount}
                href={`/countries/${country.slug}`}
              />
            ))}
          </Box>
        ) : (
          <EmptyState
            title="No countries yet"
            description="Country data has not been imported. Run the data import pipeline and refresh."
          />
        )}
      </PageContainer>
    </Box>
  );
}
