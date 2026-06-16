import { defineConfig } from "vitest/config";

// Unit tests only — Playwright owns tests/e2e (those are .spec.ts and would
// fail under Vitest). Keep these to pure, dependency-light functions.
export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
  },
});
