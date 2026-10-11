// Tournament host maps: canonical host resolution, composition planning,
// geometry for all three variants (with the approved Featured output pinned),
// marker projection, the decorative SVG contract and each surface's
// placement. No database, no browser.

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { geoMercator } from "d3-geo";
import { describe, expect, it } from "vitest";

import { resolveHostCountries, splitHostNames } from "../../../src/server/queries/hostCountries";
import { getHostMapGeometry, planComposition } from "../../../src/server/maps/hostMapGeometry";
import { geographyForHost, tournamentMapTone } from "../../../src/components/maps/hostMap/config";
import { hostMapDefId, markerPosition, projectMercator } from "../../../src/components/maps/hostMap/model";
import TournamentHostMap from "../../../src/components/maps/hostMap/TournamentHostMap";
import HostMapHeroBackdrop from "../../../src/components/maps/hostMap/HostMapHeroBackdrop";
import FeaturedTournamentCard from "../../../src/components/home/FeaturedTournamentCard";
import TournamentCard from "../../../src/components/tournaments/TournamentCard";
import type { HomeFeaturedTournament } from "../../../src/server/home/queries";

const code = (...codes: string[]) => codes.map((c) => ({ slug: null, code: c }));
const METLIFE = { latitude: 40.8136, longitude: -74.0744 };

const DIRECTORY = [
  { name: "South Korea", slug: "south-korea", code: "KOR" },
  { name: "Japan", slug: "japan", code: "JPN" },
  { name: "Canada", slug: "canada", code: "CAN" },
  { name: "Mexico", slug: "mexico", code: "MEX" },
  { name: "United States", slug: "united-states", code: "USA" },
  { name: "England", slug: "england", code: "ENG" },
  { name: "West Germany", slug: "west-germany", code: "DEU" },
  { name: "Germany", slug: "germany", code: "DEU" },
];

describe("canonical host resolution", () => {
  it("prefers Tournament.hostCountries and otherwise splits the host label", () => {
    expect(splitHostNames("Korea, Japan")).toEqual(["Korea", "Japan"]);
    expect(splitHostNames("Ignored", ["Canada", "Mexico", "United States"])).toEqual(["Canada", "Mexico", "United States"]);
    expect(splitHostNames(null)).toEqual([]);
  });

  it("resolves names against the Country table, with the documented 'Korea' alias", () => {
    expect(resolveHostCountries("Korea, Japan", [], DIRECTORY)).toEqual([
      { name: "Korea", slug: "south-korea", code: "KOR" },
      { name: "Japan", slug: "japan", code: "JPN" },
    ]);
  });

  it("keeps unknown hosts as unresolved rather than guessing", () => {
    expect(resolveHostCountries("Atlantis", [], DIRECTORY)).toEqual([{ name: "Atlantis", slug: null, code: null }]);
  });
});

describe("composition planning", () => {
  it("highlights every 2026 host in one North American composition", () => {
    const plan = planComposition(code("USA", "CAN", "MEX"))!;
    expect(plan.isoA3).toEqual(["CAN", "MEX", "USA"]);
    expect(plan.focus).toEqual({ west: -128, south: 14, east: -62, north: 56 });
  });

  it("frames small hosts regionally at 1:50m (preset and automatic)", () => {
    expect(planComposition(code("QAT"))).toMatchObject({ detail: "50m" });
    // Portugal has no preset: the small-host rule applies.
    expect(planComposition(code("PRT"))).toMatchObject({ isoA3: ["PRT"], detail: "50m" });
  });

  it("never draws a misleading modern border for England or West Germany", () => {
    expect(geographyForHost({ slug: "england", code: "ENG" }).kind).toBe("context");
    expect(geographyForHost({ slug: "west-germany", code: "DEU" }).kind).toBe("context");
    expect(geographyForHost({ slug: "germany", code: "DEU" })).toEqual({ kind: "polygon", isoA3: "DEU" });
    const england = getHostMapGeometry([{ slug: "england", code: "ENG" }], "archive-card")!;
    expect(england.hosts).toEqual([]);
    expect(england.context.length).toBeGreaterThan(0);
  });

  it("returns null (gradient fallback) when no host geography resolves", () => {
    expect(planComposition([])).toBeNull();
    expect(planComposition([{ slug: null, code: null }])).toBeNull();
    expect(getHostMapGeometry([{ slug: "atlantis", code: "ATL" }], "featured-card")).toBeNull();
  });
});

describe("geometry", () => {
  // SHA-256 (16 hex) of the approved Featured output generated on 2026-10-11
  // (hosts, context, grid, focus, projection). Any change to the approved
  // look must update these deliberately.
  const APPROVED: Record<number, [string[], string]> = {
    2026: [["CAN", "MEX", "USA"], "4a0e4014df2f4d24"],
    2022: [["QAT"], "7d4a85738aee1036"],
    2019: [["FRA"], "8f366fc6c9b82b0c"],
    2018: [["RUS"], "b902822baad38a76"],
    2015: [["CAN"], "c3910da9b2c8b9d2"],
    2014: [["BRA"], "72a850900664d8c4"],
  };
  for (const [year, [hosts, hash]] of Object.entries(APPROVED)) {
    it(`keeps the approved Featured ${year} map byte-identical`, () => {
      const g = getHostMapGeometry(code(...hosts), "featured-card")!;
      const digest = createHash("sha256")
        .update(JSON.stringify([g.hosts, g.context, g.graticule, g.focus, g.projection.scale, g.projection.translate]))
        .digest("hex")
        .slice(0, 16);
      expect(digest).toBe(hash);
    });
  }

  it("builds every variant at its own size", () => {
    expect(getHostMapGeometry(code("BRA"), "archive-card")).toMatchObject({ width: 400, height: 100 });
    expect(getHostMapGeometry(code("BRA"), "detail-hero")).toMatchObject({ width: 1200, height: 520 });
  });

  it("memoises compositions (same object for the same hosts + variant)", () => {
    expect(getHostMapGeometry(code("ITA"), "archive-card")).toBe(getHostMapGeometry(code("ITA"), "archive-card"));
  });

  it("marker projection matches d3 and is never invented", () => {
    const g = getHostMapGeometry(code("CAN", "MEX", "USA"), "featured-card")!;
    const d3 = geoMercator().scale(g.projection.scale).translate([...g.projection.translate]);
    const expected = d3([METLIFE.longitude, METLIFE.latitude])!;
    const actual = projectMercator(g, METLIFE);
    expect(actual[0]).toBeCloseTo(expected[0], 6);
    expect(actual[1]).toBeCloseTo(expected[1], 6);
    expect(markerPosition(g, null)).toBeNull();
    expect(markerPosition(g, { latitude: 35.68, longitude: 139.77 })).toBeNull();
  });

  it("uses collision-safe, deterministic SVG ids", () => {
    const ids = new Set([
      hostMapDefId("archive-card", 2026, "CAN-MEX-USA"),
      hostMapDefId("archive-card", 1994, "USA"),
      hostMapDefId("featured-card", 2026, "CAN-MEX-USA"),
      hostMapDefId("detail-hero", 2026, "CAN-MEX-USA"),
    ]);
    expect(ids.size).toBe(4);
    expect(hostMapDefId("archive-card", 2026, "CAN-MEX-USA")).toBe(hostMapDefId("archive-card", 2026, "CAN-MEX-USA"));
  });

  it("selects the per-edition tone", () => {
    expect([tournamentMapTone(2022), tournamentMapTone(2014), tournamentMapTone(1930)]).toEqual(["gold", "green", "cyan"]);
  });
});

describe("TournamentHostMap", () => {
  const render = (props: Parameters<typeof TournamentHostMap>[0]) => renderToStaticMarkup(createElement(TournamentHostMap, props));

  it("is decorative: hidden from assistive tech, unfocusable, pointer-transparent, static", () => {
    for (const variant of ["featured-card", "archive-card", "detail-hero"] as const) {
      const html = render({ year: 2026, hosts: code("CAN", "MEX", "USA"), variant, finalVenue: METLIFE });
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain('focusable="false"');
      expect(html).toContain("pointer-events:none");
      expect(html).not.toMatch(/<title|<text|tabindex|<a |<animate|animation|transition/);
      for (const iso of ["CAN", "MEX", "USA"]) expect(html).toContain(`data-host="${iso}"`);
    }
  });

  it("shows the venue marker only on variants that allow it and only with coordinates", () => {
    expect(render({ year: 2026, hosts: code("CAN", "MEX", "USA"), variant: "featured-card", finalVenue: METLIFE })).toContain("data-host-map-marker");
    expect(render({ year: 2026, hosts: code("CAN", "MEX", "USA"), variant: "archive-card", finalVenue: METLIFE })).not.toContain("data-host-map-marker");
    expect(render({ year: 2014, hosts: code("BRA"), variant: "featured-card" })).not.toContain("data-host-map-marker");
  });

  it("renders nothing for unresolved hosts", () => {
    expect(render({ year: 1930, hosts: [], variant: "archive-card" })).toBe("");
  });
});

describe("surfaces", () => {
  const featured: HomeFeaturedTournament = {
    id: "t2014", year: 2014, name: "2014 FIFA Men's World Cup", slug: "2014", hostName: "Brazil",
    hostCountries: [{ name: "Brazil", slug: "brazil", code: "BRA" }],
    teamsCount: 32, matchesCount: 64, goalsCount: 171, winner: "Germany", winnerSlug: "germany", winnerCode: "DEU",
    runnerUp: "Argentina", runnerUpSlug: "argentina", runnerUpCode: "ARG", finalScore: "1–0", heroMedia: null, finalVenue: null,
  };

  it("Featured card keeps its link, facts and CTA and draws the featured variant", () => {
    const html = renderToStaticMarkup(createElement(FeaturedTournamentCard, { tournament: featured }));
    expect(html).toContain('href="/tournaments/2014"');
    for (const text of ["2014", "Brazil", "Germany", "1–0", "Argentina", "32 teams · 64 matches · 171 goals", "View tournament"]) expect(html).toContain(text);
    expect(html).toContain('data-host-map-variant="featured-card"');
  });

  it("archive card draws the map only in its header band, before the body", () => {
    const html = renderToStaticMarkup(
      createElement(TournamentCard, { year: 2022, host: "Qatar", hostCountries: code("QAT"), winner: "Argentina", finalScore: "3–3 (4–2 pens)", runnerUp: "France", teamsCount: 32 }),
    );
    expect(html).toContain('href="/tournaments/2022"');
    const map = html.indexOf('data-host-map-variant="archive-card"');
    expect(map).toBeGreaterThan(-1);
    expect(map).toBeLessThan(html.indexOf(">2022<"));
    expect(map).toBeLessThan(html.indexOf("Winner"));
    for (const text of ["Qatar", "Argentina", "3–3 (4–2 pens)", "France", "View tournament"]) expect(html).toContain(text);
  });

  it("archive card without resolvable hosts keeps the plain band", () => {
    const html = renderToStaticMarkup(createElement(TournamentCard, { year: 1930, host: "Uruguay" }));
    expect(html).not.toContain("data-host-map");
    expect(html).toContain("Uruguay");
  });

  it("hero backdrop renders the detail variant, or nothing when hosts don't resolve", () => {
    expect(renderToStaticMarkup(createElement(HostMapHeroBackdrop, { year: 2026, hosts: code("CAN", "MEX", "USA") }))).toContain('data-host-map-variant="detail-hero"');
    expect(renderToStaticMarkup(createElement(HostMapHeroBackdrop, { year: 1930, hosts: [] }))).toBe("");
  });
});

describe("rendering boundary", () => {
  it("no client component imports the geometry engine (d3/TopoJSON stay server-side)", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const file = path.join(dir, name);
        if (statSync(file).isDirectory()) walk(file);
        else if (/\.tsx?$/.test(name)) {
          const text = readFileSync(file, "utf8");
          if (/^\s*["']use client["']/.test(text) && /server\/maps|components\/maps\/hostMap\/TournamentHostMap|d3-geo|topojson|world-atlas/.test(text)) offenders.push(file);
        }
      }
    };
    walk("src");
    expect(offenders).toEqual([]);
  });
});
