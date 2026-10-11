// Host maps on the /tournaments archive cards and /tournaments/[year] heroes:
// placement (header band / hero only), map-to-tournament pairing through
// filters and sorting, unchanged links/tabs, interaction pass-through,
// focus, reduced motion and console cleanliness.

import { test, expect, type Page } from "@playwright/test";

const archiveCards = (page: Page) => page.locator("a:has(svg[data-host-map-variant='archive-card'])");

async function expectNoHorizontalScroll(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
}

test.describe("/tournaments archive cards", () => {
  test("every card carries its own map, confined to the header band", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => { if (m.type() === "error" && !/Content Security|google-analytics/.test(m.text())) errors.push(m.text()); });
    await page.goto("/tournaments");
    const cards = archiveCards(page);
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(30);
    const checks = await cards.evaluateAll((els) =>
      els.map((card) => {
        const svg = card.querySelector("svg[data-host-map]")!;
        const band = card.firstElementChild!;
        const body = card.children[1]!;
        const s = svg.getBoundingClientRect();
        const b = band.getBoundingClientRect();
        return {
          pairs: card.getAttribute("href") === `/tournaments/${svg.getAttribute("data-host-map")}`,
          inBand: band.contains(svg) && s.top >= b.top - 1 && s.bottom <= b.bottom + 1,
          bodyHasMap: body.querySelector("svg[data-host-map]") !== null,
          decorative: svg.getAttribute("aria-hidden") === "true" && svg.getAttribute("focusable") === "false" && getComputedStyle(svg).pointerEvents === "none",
        };
      }),
    );
    for (const c of checks) expect(c).toEqual({ pairs: true, inBand: true, bodyHasMap: false, decorative: true });
    // Multi-host 2026 and England (context-only, no false border).
    await expect(page.locator("svg[data-host-map='2026'] [data-host]")).toHaveCount(3);
    await expect(page.locator("svg[data-host-map='1966'] [data-host]")).toHaveCount(0);
    await expect(page.locator("svg[data-host-map='1966']")).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  test("filters and sorting keep each map paired with its tournament", async ({ page }) => {
    await page.goto("/tournaments?host=Brazil");
    const years = await archiveCards(page).evaluateAll((els) => els.map((a) => [a.getAttribute("href"), a.querySelector("svg")!.getAttribute("data-host-map"), a.querySelector("[data-host]")?.getAttribute("data-host")]));
    expect(years.length).toBeGreaterThanOrEqual(2);
    for (const [href, year, host] of years) {
      expect(href).toBe(`/tournaments/${year}`);
      expect(host).toBe("BRA");
    }
    await page.goto("/tournaments?sort=oldest");
    const first = archiveCards(page).first();
    await expect(first).toHaveAttribute("href", "/tournaments/1930");
    await expect(first.locator("svg")).toHaveAttribute("data-host-map", "1930");
    await expect(first.locator("[data-host]")).toHaveAttribute("data-host", "URY");
  });

  test("clicking the map area opens the tournament; focus stays visible", async ({ page }) => {
    await page.goto("/tournaments");
    await page.waitForLoadState("networkidle");
    const card = page.locator("a[href='/tournaments/2022']:has(svg[data-host-map])");
    await card.focus();
    await expect(card).toBeFocused();
    const focusStyle = await card.evaluate((el) => {
      const s = getComputedStyle(el);
      return s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0;
    });
    expect(focusStyle).toBe(true);
    await card.locator("svg[data-host-map]").click({ position: { x: 200, y: 40 }, force: true });
    await expect(page).toHaveURL(/\/tournaments\/2022$/);
    // Client navigation lands on a hero with its own map.
    await expect(page.locator("svg[data-host-map-variant='detail-hero'] [data-host='QAT']")).toHaveCount(1);
  });

  for (const width of [375, 768, 1024, 1440, 1920]) {
    test(`archive layout stable at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/tournaments");
      await expect(archiveCards(page).first()).toBeVisible();
      const rows = await archiveCards(page).evaluateAll((els) => {
        const byTop = new Map<number, number[]>();
        for (const el of els) {
          const r = el.getBoundingClientRect();
          byTop.set(Math.round(r.top), [...(byTop.get(Math.round(r.top)) ?? []), Math.round(r.height)]);
        }
        return [...byTop.values()];
      });
      for (const heights of rows) expect(new Set(heights).size).toBe(1);
      await expectNoHorizontalScroll(page);
    });
  }
});

test.describe("/tournaments/[year] hero", () => {
  for (const [year, hosts] of [["2026", ["CAN", "MEX", "USA"]], ["2022", ["QAT"]], ["2014", ["BRA"]], ["2002", ["JPN", "KOR"]], ["1966", []]] as const) {
    test(`${year} hero shows its host map inside the hero only`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (m) => { if (m.type() === "error" && !/Content Security|google-analytics/.test(m.text())) errors.push(m.text()); });
      await page.goto(`/tournaments/${year}`);
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
      const svg = page.locator("svg[data-host-map-variant='detail-hero']");
      await expect(svg).toHaveCount(1);
      await expect(svg).toHaveAttribute("data-host-map", year);
      expect(await svg.locator("[data-host]").evaluateAll((els) => els.map((e) => e.getAttribute("data-host")))).toEqual([...hosts]);
      const placement = await svg.evaluate((el) => {
        const hero = el.closest("[data-host-map-backdrop]")!.parentElement!;
        const h = hero.getBoundingClientRect();
        const s = el.getBoundingClientRect();
        const heading = hero.querySelector("h1")!.getBoundingClientRect();
        return { inside: s.top >= h.top - 1 && s.bottom <= h.bottom + 1, headingInHero: heading.top >= h.top && heading.bottom <= h.bottom, overflowHidden: getComputedStyle(hero).overflow === "hidden" };
      });
      expect(placement).toEqual({ inside: true, headingInHero: true, overflowHidden: true });
      expect(errors).toEqual([]);
    });
  }

  test("section tabs and anchors still work below the hero", async ({ page }) => {
    await page.goto("/tournaments/2014");
    await page.getByRole("navigation", { name: "Tournament sections" }).getByRole("link", { name: "Awards" }).click();
    await expect(page).toHaveURL(/#awards$/);
  });

  test("no hero map animation runs (reduced motion)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/tournaments/2026");
    const running = await page.locator("[data-host-map-backdrop]").evaluate((el) => el.getAnimations({ subtree: true }).length);
    expect(running).toBe(0);
  });

  for (const width of [768, 1024, 1440, 1920]) {
    test(`hero adds no horizontal scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const year of ["2026", "2022", "1966"]) {
        await page.goto(`/tournaments/${year}`);
        await expectNoHorizontalScroll(page);
      }
    });
  }
});
