// Responsive footer + mobile navigation smoke tests (Checkpoint: Responsive
// Footer + Mobile Navigation Polish). Functional checks only — no screenshot
// snapshots. Requires the local database + dev server (see playwright.config).

import { test, expect } from "@playwright/test";

const MOBILE = { width: 375, height: 812 };

test.describe("mobile layout (375px)", () => {
  test.use({ viewport: MOBILE });

  test("footer brand, disclaimer, and attribution are visible", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeVisible();
    await expect(footer.getByText("WORLDCUP", { exact: false })).toBeVisible();
    await expect(
      footer.getByText("not affiliated with FIFA").first(),
    ).toBeVisible();
    await expect(
      footer.getByText("Fjelstul World Cup Database", { exact: false }),
    ).toBeVisible();
  });

  test("footer keeps all link groups reachable", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    // Privacy lives only in the footer — it must remain present on mobile.
    await expect(footer.getByRole("link", { name: "Privacy" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Records" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Sources" })).toBeVisible();
  });

  test("primary nav collapses to a working hamburger menu", async ({
    page,
  }) => {
    await page.goto("/");
    const menuButton = page.getByRole("button", {
      name: "Open navigation menu",
    });
    await expect(menuButton).toBeVisible();

    await menuButton.click();
    // Scope to the Primary nav so footer links (which also include
    // "Explorer"/"Tournaments") don't collide in strict mode. On mobile the
    // inline desktop nav is display:none, so only the drawer's nav matches.
    const menuNav = page.getByRole("navigation", { name: "Primary" });
    // Explorer (previously cut off) is fully reachable inside the menu.
    await expect(menuNav.getByRole("link", { name: "Explorer" })).toBeVisible();
    await expect(
      menuNav.getByRole("link", { name: "Tournaments" }),
    ).toBeVisible();

    // Navigating from the menu works and closes it.
    await menuNav.getByRole("link", { name: "Explorer" }).click();
    await expect(page).toHaveURL(/\/explorer/);
    await expect(
      page.getByRole("button", { name: "Close navigation menu" }),
    ).toBeHidden();
  });

  for (const path of ["/", "/records", "/explorer", "/sources", "/privacy"]) {
    test(`no horizontal overflow at ${path}`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      // Allow a 1px rounding tolerance.
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
});

test.describe("desktop layout (1280px)", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("primary nav is inline with no hamburger", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Open navigation menu" }),
    ).toBeHidden();
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: "Explorer" })).toBeVisible();
  });
});
