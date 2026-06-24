import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isTurnstileBypassEnabled,
  verifyTurnstileToken,
} from "../../../src/server/feedback/turnstile";

describe("isTurnstileBypassEnabled", () => {
  afterEach(() => {
    delete process.env.FEEDBACK_TURNSTILE_BYPASS;
  });

  it("is true only when explicitly enabled and not in production", () => {
    process.env.FEEDBACK_TURNSTILE_BYPASS = "true";
    // NODE_ENV is "test" under Vitest — not production.
    expect(isTurnstileBypassEnabled()).toBe(true);
  });

  it("is false when not enabled", () => {
    delete process.env.FEEDBACK_TURNSTILE_BYPASS;
    expect(isTurnstileBypassEnabled()).toBe(false);
  });
});

describe("verifyTurnstileToken", () => {
  beforeEach(() => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.TURNSTILE_SECRET_KEY;
  });

  it("returns success:false without calling Cloudflare when token is empty", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const result = await verifyTurnstileToken({ token: "" });
    expect(result.success).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns success:false when Cloudflare reports failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: false,
          "error-codes": ["invalid-input-response"],
        }),
      }),
    );
    const result = await verifyTurnstileToken({ token: "bad-token" });
    expect(result.success).toBe(false);
    expect(result.errorCodes).toContain("invalid-input-response");
  });

  it("returns success:true when Cloudflare accepts the token", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: true, json: async () => ({ success: true }) }),
    );
    const result = await verifyTurnstileToken({
      token: "good-token",
      ip: "203.0.113.7",
    });
    expect(result.success).toBe(true);
  });

  it("fails closed on a network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );
    const result = await verifyTurnstileToken({ token: "good-token" });
    expect(result.success).toBe(false);
  });

  it("returns success:false when no secret is configured", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    const result = await verifyTurnstileToken({ token: "good-token" });
    expect(result.success).toBe(false);
  });
});
