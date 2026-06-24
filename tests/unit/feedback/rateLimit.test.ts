import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkFeedbackRateLimit } from "../../../src/server/feedback/rateLimit";

// These tests exercise the unconfigured fallback only (no live Upstash). The
// Upstash-backed path is covered manually with real credentials.
describe("checkFeedbackRateLimit (unconfigured fallback)", () => {
  let savedUrl: string | undefined;
  let savedToken: string | undefined;

  beforeEach(() => {
    savedUrl = process.env.UPSTASH_REDIS_REST_URL;
    savedToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  afterEach(() => {
    if (savedUrl !== undefined) process.env.UPSTASH_REDIS_REST_URL = savedUrl;
    if (savedToken !== undefined)
      process.env.UPSTASH_REDIS_REST_TOKEN = savedToken;
  });

  it("allows submissions outside production when Upstash is not configured", async () => {
    // NODE_ENV is "test" under Vitest — the dev/test fallback allows.
    const result = await checkFeedbackRateLimit({
      ipHash: "abc",
      duplicateHash: "def",
    });
    expect(result.allowed).toBe(true);
  });
});
