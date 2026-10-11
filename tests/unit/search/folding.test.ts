// Accent folding + provenance for search rows (no database).

import { describe, expect, it } from "vitest";

import { foldDiacritics, foldedKeyword, toSearchDocumentRow } from "../../../src/server/search/indexing";
import type { SearchDocument } from "../../../src/server/search/types";

const doc = (overrides: Partial<SearchDocument>): SearchDocument => ({
  id: "player-1",
  type: "player",
  title: "Kylian Mbappé",
  subtitle: null,
  description: null,
  href: "/players/kylian-mbappe",
  keywords: [],
  ...overrides,
});

describe("foldDiacritics", () => {
  it("folds accented names and leaves plain ones alone", () => {
    expect(foldDiacritics("Mbappé")).toBe("Mbappe");
    expect(foldDiacritics("Cubarsí")).toBe("Cubarsi");
    expect(foldDiacritics("Türkiye")).toBe("Turkiye");
    expect(foldDiacritics("Ødegaard")).toBe("Odegaard");
    expect(foldDiacritics("Messi")).toBeNull();
  });
});

describe("foldedKeyword", () => {
  it("adds each folded word once, however many fields repeat the name", () => {
    expect(foldedKeyword(doc({ title: "Kylian Mbappé goal", playerName: "Kylian Mbappé", keywords: ["Kylian Mbappé"] }))).toEqual(["Mbappe"]);
    expect(foldedKeyword(doc({ title: "Lionel Messi" }))).toEqual([]);
  });

  it("puts the folded form into the stored keywords", () => {
    expect(toSearchDocumentRow(doc({})).keywords).toContain("Mbappe");
  });
});

describe("row provenance", () => {
  it("labels canonical 2026 rows with the bundle source, older rows with Fjelstul", () => {
    expect(toSearchDocumentRow(doc({ type: "match", tournamentYear: 2026 })).source).toBe("wcn-2026-bundle");
    expect(toSearchDocumentRow(doc({ type: "match", tournamentYear: 2022 })).source).toBe("fjelstul");
    expect(toSearchDocumentRow(doc({ source: "wcn-2026-bundle" })).source).toBe("wcn-2026-bundle");
    expect(toSearchDocumentRow(doc({ id: "wc2026-match-1", type: "match" })).source).toBe("mominul_2026_dataset");
  });
});
