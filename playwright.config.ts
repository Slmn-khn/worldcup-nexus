import { defineConfig, devices } from "@playwright/test";

const BASE_URL = "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  // Low parallelism on purpose: pages are server-rendered per request
  // against a local database (and a dev server compiles routes on first
  // hit) — a parallel stampede causes spurious timeouts.
  fullyParallel: false,
  workers: 2,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
