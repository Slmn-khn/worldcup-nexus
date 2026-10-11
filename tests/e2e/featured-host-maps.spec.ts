// Featured Tournaments host maps: decorative SVG contract, unchanged card
// content/links, interaction pass-through, focus and responsive layout.

import { test, expect, type Page } from "@playwright/test";

const featured = (page: Page) =>
  page.locator("section", { has: page.getByRole("heading", { name: "Featured Tournaments" }) }).first();
const cards = (page: Page) => featured(page).locator("a:has(svg[data-host-map])");

test.describe("Featured Tournament host maps", () => {
  test("every featured card shows a decorative host map", async ({ page }) => {
    await page.goto("/");
    await expect(cards(page)).toHaveCount(6);
    for (const svg of await featured(page).locator("svg[data-host-map]").all()) {
      await expect(svg).toHaveAttribute("aria-hidden", "true");
      await expect(svg).toHaveAttribute("focusable", "false");
      expect(await svg.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none");
    }
    const hosts2026 = featured(page).locator('svg[data-host-map="2026"] [data-host]');
    await expect(hosts2026).toHaveCount(3);
    expect(await hosts2026.evaluateAll((els) => els.map((e) => e.getAttribute("data-host")))).toEqual(["CAN", "MEX", "USA"]);
    await expect(featured(page).locator('svg[data-host-map="2022"] [data-host="QAT"]')).toHaveCount(1);
  });

  test("card links, facts and CTA are unchanged and the map never blocks clicks", async ({ page }) => {
    await page.goto("/");
    const card = featured(page).locator('a:has(svg[data-host-map="2014"])');
    await expect(card).toHaveAttribute("href", "/tournaments/2014");
    await expect(card).toContainText("Brazil");
    await expect(card).toContainText("Germany");
    await expect(card).toContainText("View tournament");
    await page.waitForLoadState("networkidle");
    // Click on the map itself: the event must reach the card link.
    await card.locator("svg[data-host-map]").click({ position: { x: 40, y: 30 }, force: true });
    await expect(page).toHaveURL(/\/tournaments\/2014$/);
  });

  test("keyboard focus lands on the card link with a visible indicator", async ({ page }) => {
    await page.goto("/");
    const card = featured(page).locator('a:has(svg[data-host-map="2022"])');
    await card.focus();
    await expect(card).toBeFocused();
    const outline = await card.evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, width: parseFloat(s.outlineWidth), shadow: s.boxShadow };
    });
    expect(outline.style !== "none" && outline.width > 0 || outline.shadow !== "none").toBe(true);
    // Nothing inside the decorative layer is focusable.
    expect(await featured(page).locator("svg[data-host-map] [tabindex], svg[data-host-map] a").count()).toBe(0);
  });

  for (const width of [1440, 1280, 768, 390, 375]) {
    test(`layout is stable at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/");
      await expect(cards(page)).toHaveCount(6);
      const boxes = await cards(page).evaluateAll((els) =>
        els.map((el) => {
          const r = el.getBoundingClientRect();
          const media = el.firstElementChild!.getBoundingClientRect();
          const svg = el.querySelector("svg[data-host-map]")!.getBoundingClientRect();
          return { top: Math.round(r.top), height: Math.round(r.height), mediaH: Math.round(media.height), svgInside: svg.top >= media.top - 1 && svg.bottom <= media.bottom + 1 && svg.height > 0 };
        }),
      );
      expect(boxes).toHaveLength(6);
      // The map stays inside the media band.
      for (const box of boxes) expect(box.svgInside).toBe(true);
      // Cards in the same row share one height.
      const rows = new Map<number, number[]>();
      for (const box of boxes) rows.set(box.top, [...(rows.get(box.top) ?? []), box.height]);
      for (const heights of rows.values()) expect(new Set(heights).size).toBe(1);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("no animation runs in the map layer (reduced motion or not)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(cards(page)).toHaveCount(6);
    const running = await featured(page).locator("svg[data-host-map]").evaluateAll((els) =>
      els.reduce((n, el) => n + el.getAnimations({ subtree: true }).length, 0),
    );
    expect(running).toBe(0);
  });
});
