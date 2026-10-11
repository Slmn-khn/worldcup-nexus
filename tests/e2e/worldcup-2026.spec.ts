// 2026 canonical archive: hub, groups, round-of-32 bracket, match states,
// awards, legacy URL redirects, search and /matches regressions. Requires the
// local database with the canonical 2026 import (pnpm data:2026:canonical:write)
// and the search index (pnpm search:index).

import { test, expect, type Page } from "@playwright/test";

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe("2026 tournament hub", () => {
  test("overview shows the champion, verified numbers and sources", async ({ page }) => {
    const response = await page.goto("/tournaments/2026");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "2026 World Cup" })).toBeVisible();
    await expect(page.getByText("Spain 1–0 a.e.t. Argentina").first()).toBeVisible();
    const numbers = page.getByRole("region", { name: "Tournament in numbers" });
    for (const value of ["48", "104", "308", "16", "1,248", "6,810,966"]) {
      await expect(numbers.getByText(value, { exact: true })).toBeVisible();
    }
    await expect(page.getByRole("link", { name: "FIFA official records" })).toBeVisible();
    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(JSON.parse(jsonLd ?? "{}")).toMatchObject({ "@type": "SportsEvent", winner: { name: "Spain" } });
  });

  test("renders twelve computed group tables A–L with 32 qualifiers", async ({ page }) => {
    await page.goto("/tournaments/2026#groups");
    const groups = page.locator("#groups table");
    await expect(groups).toHaveCount(12);
    for (const letter of "ABCDEFGHIJKL") {
      await expect(page.locator("#groups caption", { hasText: `Group ${letter}` })).toHaveCount(1);
    }
    await expect(page.locator("#groups tbody tr", { hasText: "advanced" })).toHaveCount(32);
    await expect(page.getByText("not FIFA's official ranking", { exact: false })).toBeVisible();
  });

  test("bracket starts at the round of 32 and keeps shootouts out of the score", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/tournaments/2026#bracket");
    const bracket = page.getByRole("region", { name: "Knockout bracket" });
    await expect(bracket.getByRole("heading", { name: "Round of 32" })).toBeVisible();
    await expect(bracket.locator("li")).toHaveCount(16 + 8 + 4 + 2 + 1);
    await expect(bracket.getByRole("link", { name: /Germany 1 to 1 \(3 to 4 on penalties\) Paraguay, Paraguay won/ })).toBeVisible();
    await expect(bracket.getByRole("link", { name: /Switzerland 0 to 0 · outcome not recorded Colombia/ })).toBeVisible();
    await expect(bracket.getByRole("link", { name: /^Final: Spain 1 to 0 after extra time Argentina, Spain won$/ })).toBeVisible();
    // Keyboard: the scrollable bracket region takes focus.
    await bracket.focus();
    await expect(bracket).toBeFocused();
  });

  for (const width of [375, 390]) {
    test(`narrow screens (${width}px) get round accordions and no horizontal scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/tournaments/2026");
      await expect(page.getByRole("region", { name: "Knockout bracket" })).toBeHidden();
      const finalRound = page.getByRole("button", { name: /Final · 1 match/ });
      await expect(finalRound).toHaveAttribute("aria-expanded", "true");
      const r32 = page.getByRole("button", { name: /Round of 32 · 16 matches/ });
      await r32.click();
      await expect(r32).toHaveAttribute("aria-expanded", "true");
      await expectNoHorizontalScroll(page);
    });
  }

  for (const width of [768, 1280, 1440]) {
    test(`no horizontal page scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/tournaments/2026");
      await expectNoHorizontalScroll(page);
    });
  }

  test("awards: nine official awards with text tiers and profile links", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/tournaments/2026#awards");
    const awards = page.locator("#awards article");
    await expect(awards).toHaveCount(9);
    const goldenBoot = page.getByRole("article", { name: "Golden Boot: Kylian Mbappé" });
    await expect(goldenBoot.getByText("Gold", { exact: true })).toBeVisible();
    await expect(goldenBoot.getByText("10 goals · 4 assists · 769 min")).toBeVisible();
    await expect(page.getByRole("article", { name: "Best Young Player: Pau Cubarsí" }).getByText("Officially: Young Player Award")).toBeVisible();
    await expect(page.getByRole("article", { name: "FIFA Fair Play Trophy: Netherlands" })).toBeVisible();
    // Wait for hydration: a click replayed by React mid-hydration can be
    // dropped by the client router (framework race, not an app bug).
    await page.waitForLoadState("networkidle");
    await page.getByRole("article", { name: "Golden Ball: Rodri" }).getByRole("link", { name: "Rodri" }).click();
    await expect(page).toHaveURL(/\/players\/rodri$/);
    await expect(page.getByText("Golden Ball").first()).toBeVisible();
  });

  test("states missing data instead of showing zeros", async ({ page }) => {
    await page.goto("/tournaments/2026#stats");
    await expect(page.getByRole("note")).toContainText("Not recorded for 2026 yet: substitutions, yellow/red cards");
  });

  test("squad search is accent-insensitive", async ({ page }) => {
    await page.goto("/tournaments/2026?pq=Cubarsi#players");
    await expect(page.locator("#players").getByRole("link", { name: /Pau Cubarsí/ })).toBeVisible();
  });
});

test.describe("2026 matches", () => {
  test("final after extra time", async ({ page }) => {
    await page.goto("/matches/m-2026-104-spain-vs-argentina");
    await expect(page.getByText("After extra time")).toBeVisible();
    await expect(page.getByText("Winner · Spain")).toBeVisible();
    await expect(page.getByText(/Cards and substitutions are not recorded for the 2026 tournament yet/)).toBeVisible();
  });

  test("penalty shootout is shown separately from the score", async ({ page }) => {
    await page.goto("/matches/m-2026-75-germany-vs-paraguay");
    await expect(page.getByText("1–1", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("3–4 on penalties")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Penalty Shootout" })).toBeVisible();
  });

  test("knockout draw without a recorded outcome is labelled, not guessed", async ({ page }) => {
    await page.goto("/matches/m-2026-96-switzerland-vs-colombia");
    await expect(page.getByText("Outcome not recorded")).toBeVisible();
    await expect(page.getByText("Winner ·")).toHaveCount(0);
  });

  test("legacy 2026 URLs redirect to canonical pages", async ({ page }) => {
    await page.goto("/matches/2026/104");
    await expect(page).toHaveURL(/\/matches\/m-2026-104-spain-vs-argentina$/);
    await page.goto("/tournaments/2026/players/842");
    await expect(page).toHaveURL(/\/players\/kylian-mbappe$/);
  });

  test("/matches lists 2026 and tolerates bad params (no HTTP 400 regression)", async ({ page }) => {
    for (const query of ["", "?tournamentYear=2026", "?tournamentYear=abc&page=-4&pageSize=99999", "?stage=round%20of%2032&sort=nope", "?decidedByPenalties=maybe&tournamentYear=1800"]) {
      const response = await page.goto(`/matches${query}`);
      expect(response?.status(), `/matches${query}`).toBe(200);
    }
    await page.goto("/matches?tournamentYear=2026&stage=final");
    await expect(page.getByText("Spain").first()).toBeVisible();
  });
});

test.describe("search and regressions", () => {
  test("search API finds accent-free and alias spellings", async ({ request }) => {
    for (const [q, title] of [["Cubarsi", "Pau Cubarsí"], ["Mbappe", "Kylian Mbappé"], ["Turkiye", "Turkey"]] as const) {
      const response = await request.get(`/api/search?q=${encodeURIComponent(q)}`);
      expect(response.status()).toBe(200);
      const body = (await response.json()) as { results: { title: string }[] };
      expect(body.results.map((r) => r.title)).toContain(title);
    }
  });

  test("older tournaments keep their standard page (1986) and shootout final (2022)", async ({ page }) => {
    await page.goto("/tournaments/1986");
    await expect(page.getByRole("heading", { name: "1986" })).toBeVisible();
    await expect(page.locator("#bracket")).toHaveCount(0);
    await page.goto("/matches/m-2022-64-argentina-vs-france");
    await expect(page.getByText("3–3").first()).toBeVisible();
    await expect(page.getByText("4–2 on penalties")).toBeVisible();
    await expect(page.getByText("After extra time")).toHaveCount(0);
  });

  test("sitemap lists canonical 2026 URLs only", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("/tournaments/2026");
    expect(xml).toContain("/matches/m-2026-104-spain-vs-argentina");
    expect(xml).not.toContain("/matches/2026/");
    expect(xml).not.toContain("/tournaments/2026/players/");
  });
});
