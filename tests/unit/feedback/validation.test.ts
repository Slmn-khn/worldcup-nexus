import { describe, expect, it } from "vitest";
import {
  feedbackRequestSchema,
  isSafeInternalPath,
  parseFeedbackQueryParams,
} from "../../../src/server/feedback/validation";

const validBase = {
  type: "BUG_REPORT",
  title: "Score looks wrong",
  message: "The 2022 final penalty score appears incorrect on this page.",
};

describe("feedbackRequestSchema", () => {
  it("accepts a minimal valid submission", () => {
    const result = feedbackRequestSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("rejects a missing/short title", () => {
    expect(
      feedbackRequestSchema.safeParse({ ...validBase, title: "" }).success,
    ).toBe(false);
    expect(
      feedbackRequestSchema.safeParse({ ...validBase, title: "hi" }).success,
    ).toBe(false);
  });

  it("rejects a message shorter than 20 chars", () => {
    expect(
      feedbackRequestSchema.safeParse({ ...validBase, message: "too short" })
        .success,
    ).toBe(false);
  });

  it("rejects an invalid email but accepts a valid one", () => {
    expect(
      feedbackRequestSchema.safeParse({ ...validBase, email: "not-an-email" })
        .success,
    ).toBe(false);
    expect(
      feedbackRequestSchema.safeParse({
        ...validBase,
        email: "fan@example.com",
      }).success,
    ).toBe(true);
  });

  it("treats blank optional fields as undefined", () => {
    const result = feedbackRequestSchema.safeParse({
      ...validBase,
      email: "",
      countryName: "   ",
      pageUrl: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBeUndefined();
      expect(result.data.countryName).toBeUndefined();
    }
  });

  it("coerces tournamentYear and enforces its range", () => {
    const ok = feedbackRequestSchema.safeParse({
      ...validBase,
      tournamentYear: "2022",
    });
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data.tournamentYear).toBe(2022);

    expect(
      feedbackRequestSchema.safeParse({ ...validBase, tournamentYear: "1800" })
        .success,
    ).toBe(false);
  });

  it("rejects an unknown feedback type", () => {
    expect(
      feedbackRequestSchema.safeParse({ ...validBase, type: "NONSENSE" })
        .success,
    ).toBe(false);
  });
});

describe("isSafeInternalPath", () => {
  it("accepts internal paths", () => {
    expect(isSafeInternalPath("/matches/2022-final")).toBe(true);
    expect(isSafeInternalPath("/records?filter=shootout")).toBe(true);
  });

  it("rejects external/protocol-relative/malformed paths", () => {
    expect(isSafeInternalPath("https://evil.example.com")).toBe(false);
    expect(isSafeInternalPath("//evil.example.com")).toBe(false);
    expect(isSafeInternalPath("javascript:alert(1)")).toBe(false);
    expect(isSafeInternalPath("/path/with<script>")).toBe(false);
    expect(isSafeInternalPath("")).toBe(false);
    expect(isSafeInternalPath(null)).toBe(false);
  });
});

describe("parseFeedbackQueryParams", () => {
  const fromMap = (map: Record<string, string>) => (key: string) =>
    key in map ? map[key] : null;

  it("preselects a valid type and ignores an invalid one", () => {
    expect(
      parseFeedbackQueryParams(fromMap({ type: "INCORRECT_DATA" })).type,
    ).toBe("INCORRECT_DATA");
    expect(
      parseFeedbackQueryParams(fromMap({ type: "BOGUS" })).type,
    ).toBeUndefined();
  });

  it("prefills only safe internal pageUrls", () => {
    expect(
      parseFeedbackQueryParams(fromMap({ pageUrl: "/matches/2022-final" }))
        .pageUrl,
    ).toBe("/matches/2022-final");
    expect(
      parseFeedbackQueryParams(fromMap({ pageUrl: "https://evil.com" }))
        .pageUrl,
    ).toBeUndefined();
  });

  it("prefills an in-range tournament year only", () => {
    expect(
      parseFeedbackQueryParams(fromMap({ tournamentYear: "2022" }))
        .tournamentYear,
    ).toBe(2022);
    expect(
      parseFeedbackQueryParams(fromMap({ tournamentYear: "3000" }))
        .tournamentYear,
    ).toBeUndefined();
  });
});
