import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Database integration tests (tests/integration). They need the disposable
// *_it database created by scripts/test/setup-integration-db.ts — run them
// through `pnpm test:integration`, never `pnpm test:unit`. Files run serially
// because they share one database.
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(rootDir, "src") },
  },
  test: {
    include: ["tests/integration/**/*.test.ts"],
    environment: "node",
    fileParallelism: false,
    testTimeout: 180_000,
    hookTimeout: 180_000,
  },
});
