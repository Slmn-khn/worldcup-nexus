import { beforeAll, describe, expect, it } from "vitest";
import {
  calculateSpamScore,
  createDuplicateHash,
  hashSensitiveValue,
  normalizeFeedbackText,
  SPAM_THRESHOLD,
} from "../../../src/server/feedback/security";

beforeAll(() => {
  process.env.FEEDBACK_HASH_SALT = "test-salt";
});

describe("hashSensitiveValue", () => {
  it("never returns the raw value and produces a 64-char hex digest", () => {
    const hash = hashSensitiveValue("203.0.113.7");
    expect(hash).not.toBeNull();
    expect(hash).not.toBe("203.0.113.7");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("returns null for nullish/blank input", () => {
    expect(hashSensitiveValue(null)).toBeNull();
    expect(hashSensitiveValue(undefined)).toBeNull();
    expect(hashSensitiveValue("   ")).toBeNull();
  });

  it("is deterministic for the same input", () => {
    expect(hashSensitiveValue("203.0.113.7")).toBe(
      hashSensitiveValue("203.0.113.7"),
    );
  });
});

describe("normalizeFeedbackText", () => {
  it("lowercases, trims, collapses whitespace and repeated punctuation", () => {
    expect(normalizeFeedbackText("  Hello!!!   World??  ")).toBe(
      "hello! world?",
    );
  });
});

describe("createDuplicateHash", () => {
  it("collides for normalized-equivalent content", () => {
    const a = createDuplicateHash("Title", "Hello   World");
    const b = createDuplicateHash("  title ", "hello world");
    expect(a).toBe(b);
  });

  it("differs when the email differs", () => {
    const a = createDuplicateHash("T", "Some message body", "a@example.com");
    const b = createDuplicateHash("T", "Some message body", "b@example.com");
    expect(a).not.toBe(b);
  });
});

describe("calculateSpamScore", () => {
  const cleanInput = {
    honeypotFilled: false,
    elapsedMs: 12_000,
    title: "Add a penalty shootout filter",
    message: "Please add a penalty shootout filter to the records page.",
    turnstileSuccess: true,
  };

  it("scores a genuine submission at zero", () => {
    const { score, reasons } = calculateSpamScore(cleanInput);
    expect(score).toBe(0);
    expect(reasons).toEqual([]);
  });

  it("flags a filled honeypot heavily", () => {
    const { score, reasons } = calculateSpamScore({
      ...cleanInput,
      honeypotFilled: true,
    });
    expect(score).toBeGreaterThanOrEqual(SPAM_THRESHOLD);
    expect(reasons).toContain("honeypot_filled");
  });

  it("flags a failed Turnstile check", () => {
    const { reasons } = calculateSpamScore({
      ...cleanInput,
      turnstileSuccess: false,
    });
    expect(reasons).toContain("turnstile_failed");
  });

  it("flags too-fast submissions", () => {
    const { reasons } = calculateSpamScore({ ...cleanInput, elapsedMs: 800 });
    expect(reasons).toContain("submitted_too_fast");
  });

  it("flags messages with many URLs", () => {
    const { reasons } = calculateSpamScore({
      ...cleanInput,
      message:
        "buy now http://a.com http://b.com http://c.com http://d.com cheap deals",
    });
    expect(reasons).toContain("too_many_urls");
  });

  it("flags repeated characters and generic content", () => {
    const repeated = calculateSpamScore({
      ...cleanInput,
      message: "aaaaaaaaaa",
    });
    expect(repeated.reasons).toContain("repeated_characters");

    const generic = calculateSpamScore({ ...cleanInput, message: "nice nice" });
    expect(generic.reasons).toContain("generic_message");
  });

  it("flags a recent duplicate", () => {
    const { reasons } = calculateSpamScore({
      ...cleanInput,
      duplicateExists: true,
    });
    expect(reasons).toContain("duplicate_recent");
  });
});
