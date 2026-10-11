// Featured Tournament host maps: config ↔ generated geometry, marker
// projection (checked against d3 itself), the decorative SVG contract and the
// card's unchanged content/link. No database, no browser.

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { geoMercator } from "d3-geo";
import { describe, expect, it } from "vitest";

import { TOURNAMENT_MAP_VISUALS } from "../../../src/components/home/hostMaps/hostMapConfig";
import { HOST_MAP_GEOMETRY } from "../../../src/components/home/hostMaps/hostMapGeometry.generated";
import {
  getHostMapGeometry,
  markerPosition,
  projectMercator,
} from "../../../src/components/home/hostMaps/hostMapModel";
import TournamentHostMap from "../../../src/components/home/hostMaps/TournamentHostMap";
import FeaturedTournamentCard from "../../../src/components/home/FeaturedTournamentCard";
import type { HomeFeaturedTournament } from "../../../src/server/home/queries";

const METLIFE = { latitude: 40.8136, longitude: -74.0744 };

describe("generated geometry", () => {
  it("covers exactly the configured tournaments and hosts (regenerate with pnpm assets:host-maps)", () => {
    expect(Object.keys(HOST_MAP_GEOMETRY).sort()).toEqual(Object.keys(TOURNAMENT_MAP_VISUALS).sort());
    for (const [year, visual] of Object.entries(TOURNAMENT_MAP_VISUALS)) {
      const geometry = HOST_MAP_GEOMETRY[Number(year)]!;
      expect(geometry.hosts.map((h) => h.isoA3)).toEqual([...visual.hostIsoA3]);
      expect(geometry.tone).toBe(visual.tone);
      for (const host of geometry.hosts) expect(host.d).toMatch(/^M/);
    }
  });

  it("2026 includes Canada, Mexico and the United States", () => {
    expect(getHostMapGeometry(2026)?.hosts.map((h) => h.isoA3)).toEqual(["CAN", "MEX", "USA"]);
  });

  it("single-host tournaments render their own host", () => {
    expect(getHostMapGeometry(2022)?.hosts.map((h) => h.isoA3)).toEqual(["QAT"]);
    expect(getHostMapGeometry(2014)?.hosts.map((h) => h.isoA3)).toEqual(["BRA"]);
  });

  it("returns null for tournaments without configuration", () => {
    expect(getHostMapGeometry(1930)).toBeNull();
  });
});

describe("marker projection", () => {
  it("matches d3.geoMercator for the generated parameters", () => {
    const geometry = getHostMapGeometry(2026)!;
    const d3 = geoMercator().scale(geometry.projection.scale).translate([...geometry.projection.translate]);
    const expected = d3([METLIFE.longitude, METLIFE.latitude])!;
    const actual = projectMercator(geometry, METLIFE);
    expect(actual[0]).toBeCloseTo(expected[0], 6);
    expect(actual[1]).toBeCloseTo(expected[1], 6);
  });

  it("places the 2026 final venue inside the card and never invents one", () => {
    const geometry = getHostMapGeometry(2026)!;
    expect(markerPosition(geometry, METLIFE)).not.toBeNull();
    expect(markerPosition(geometry, null)).toBeNull();
    expect(markerPosition(geometry, { latitude: 35.68, longitude: 139.77 })).toBeNull(); // outside the frame
    expect(markerPosition(geometry, { latitude: Number.NaN, longitude: 0 })).toBeNull();
  });
});

describe("TournamentHostMap", () => {
  const render = (year: number, finalVenue: typeof METLIFE | null = null) =>
    renderToStaticMarkup(createElement(TournamentHostMap, { year, finalVenue }));

  it("is decorative: hidden from assistive tech, unfocusable, pointer-transparent", () => {
    const html = render(2026, METLIFE);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('focusable="false"');
    expect(html).toContain("pointer-events:none");
    expect(html).not.toMatch(/<title|<text|tabindex|<a /);
  });

  it("draws every host and the venue marker only when coordinates exist", () => {
    const html = render(2026, METLIFE);
    for (const iso of ["CAN", "MEX", "USA"]) expect(html).toContain(`data-host="${iso}"`);
    expect(html).toContain("data-host-map-marker");
    expect(render(2014)).not.toContain("data-host-map-marker");
  });

  it("is static — nothing to disable for reduced motion", () => {
    const html = render(2026, METLIFE);
    expect(html).not.toMatch(/<animate|animation|transition/);
  });

  it("renders nothing (gradient fallback) for an unconfigured tournament", () => {
    expect(render(1930)).toBe("");
  });
});

describe("FeaturedTournamentCard", () => {
  const tournament: HomeFeaturedTournament = {
    id: "t2014",
    year: 2014,
    name: "2014 FIFA Men's World Cup",
    slug: "2014",
    hostName: "Brazil",
    teamsCount: 32,
    matchesCount: 64,
    goalsCount: 171,
    winner: "Germany",
    winnerSlug: "germany",
    winnerCode: "DEU",
    runnerUp: "Argentina",
    runnerUpSlug: "argentina",
    runnerUpCode: "ARG",
    finalScore: "1–0",
    heroMedia: null,
    finalVenue: null,
  };

  it("keeps the link, facts and CTA while adding the map to the media band", () => {
    const html = renderToStaticMarkup(createElement(FeaturedTournamentCard, { tournament }));
    expect(html).toContain('href="/tournaments/2014"');
    for (const text of ["2014", "Brazil", "Germany", "1–0", "Argentina", "32 teams · 64 matches · 171 goals", "View tournament"]) {
      expect(html).toContain(text);
    }
    expect(html).toContain('data-host-map="2014"');
  });

  it("keeps the plain gradient for tournaments without a map", () => {
    const html = renderToStaticMarkup(createElement(FeaturedTournamentCard, { tournament: { ...tournament, year: 1930, slug: "1930" } }));
    expect(html).toContain('href="/tournaments/1930"');
    expect(html).not.toContain("data-host-map");
  });
});
