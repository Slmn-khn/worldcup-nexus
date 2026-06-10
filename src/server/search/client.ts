// Meilisearch client helper. Server-only — never import from client
// components (the search UI talks to /api/search instead).

import { Meilisearch } from "meilisearch";

export const SEARCH_INDEX_UID = "worldcup_atlas_search";

export function getSearchClient(): Meilisearch {
  const host = process.env.MEILISEARCH_HOST;
  const apiKey = process.env.MEILISEARCH_API_KEY;
  if (!host || !apiKey) {
    throw new Error(
      "MEILISEARCH_HOST and MEILISEARCH_API_KEY must be set. Copy .env.example to .env and start Meilisearch (docker compose up -d).",
    );
  }
  return new Meilisearch({ host, apiKey });
}

/** Index settings applied by `pnpm search:index`. */
export const SEARCH_INDEX_SETTINGS = {
  searchableAttributes: [
    "title",
    "keywords",
    "subtitle",
    "description",
    "countryName",
    "playerName",
    "stage",
  ],
  filterableAttributes: [
    "type",
    "tournamentYear",
    "countryName",
    "playerName",
    "stage",
  ],
  sortableAttributes: ["sortYear"],
};
