// Zod validation for the public feedback API. Client validation is never
// trusted — every submission is re-validated here on the server. This module
// is pure (no Node/Next imports) so it is safe to unit test and to import from
// both the route handler and client-side query-param parsing.

import { z } from "zod";

export const FEEDBACK_TYPES = [
  "BUG_REPORT",
  "INCORRECT_DATA",
  "FEATURE_REQUEST",
  "DESIGN_FEEDBACK",
  "MISSING_DATA",
  "SCHEDULE_ISSUE",
  "OTHER",
] as const;

export type FeedbackTypeValue = (typeof FEEDBACK_TYPES)[number];

export const MIN_TOURNAMENT_YEAR = 1930;
export const MAX_TOURNAMENT_YEAR = 2030;

/** Treat blank/whitespace-only strings as "not provided" for optional fields. */
const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalTrimmed = (max: number) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());

const optionalYear = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number()
    .int()
    .min(MIN_TOURNAMENT_YEAR)
    .max(MAX_TOURNAMENT_YEAR)
    .optional(),
);

/**
 * True only for safe internal paths ("/matches/2022-final"). Used to vet a
 * `pageUrl` arriving via query params before prefilling it — protocol-relative
 * URLs, absolute external URLs, markup, and control characters are rejected.
 */
export function isSafeInternalPath(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const v = value.trim();
  if (v.length === 0 || v.length > 500) return false;
  if (!v.startsWith("/")) return false; // internal paths only
  if (v.startsWith("//")) return false; // protocol-relative
  if (v.includes("://")) return false; // absolute URL smuggled in
  if (v.includes("<") || v.includes(">")) return false; // markup chars
  // Reject ASCII control characters (0x00–0x1F, 0x7F) without a regex range.
  for (let i = 0; i < v.length; i += 1) {
    const code = v.charCodeAt(i);
    if (code < 0x20 || code === 0x7f) return false;
  }
  return true;
}

// The shape accepted by POST /api/feedback. `turnstileToken` is optional here
// because whether it is *required* depends on runtime env (the local dev
// bypass); the route enforces presence. `companyWebsite` is the honeypot.
export const feedbackRequestSchema = z.object({
  type: z.enum(FEEDBACK_TYPES),
  title: z.string().trim().min(5).max(120),
  message: z.string().trim().min(20).max(2000),
  pageUrl: optionalTrimmed(500),
  tournamentYear: optionalYear,
  countryName: optionalTrimmed(100),
  playerName: optionalTrimmed(120),
  matchLabel: optionalTrimmed(160),
  email: z.preprocess(emptyToUndefined, z.email().max(254).optional()),
  name: optionalTrimmed(80),
  turnstileToken: optionalTrimmed(4096),
  startedAt: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().nonnegative().optional(),
  ),
  companyWebsite: z.preprocess(
    emptyToUndefined,
    z.string().max(200).optional(),
  ),
});

export type FeedbackRequest = z.infer<typeof feedbackRequestSchema>;

// Safe subset of fields that may be prefilled from the URL (e.g. a future
// "Report data issue" button links to /feedback?type=...&pageUrl=...).
export type FeedbackPrefill = {
  type?: FeedbackTypeValue;
  pageUrl?: string;
  tournamentYear?: number;
  countryName?: string;
  playerName?: string;
  matchLabel?: string;
};

/**
 * Parses prefill values from query params. Invalid values are ignored (never
 * thrown on) so a malformed link still renders a usable, empty-ish form.
 */
export function parseFeedbackQueryParams(
  get: (key: string) => string | null,
): FeedbackPrefill {
  const prefill: FeedbackPrefill = {};

  const type = get("type");
  if (type !== null && (FEEDBACK_TYPES as readonly string[]).includes(type)) {
    prefill.type = type as FeedbackTypeValue;
  }

  const pageUrl = get("pageUrl");
  if (pageUrl !== null && isSafeInternalPath(pageUrl)) {
    prefill.pageUrl = pageUrl.trim();
  }

  const year = get("tournamentYear");
  if (year !== null && year.trim() !== "") {
    const parsed = Number(year);
    if (
      Number.isInteger(parsed) &&
      parsed >= MIN_TOURNAMENT_YEAR &&
      parsed <= MAX_TOURNAMENT_YEAR
    ) {
      prefill.tournamentYear = parsed;
    }
  }

  const country = get("countryName");
  if (country !== null && country.trim() !== "" && country.length <= 100) {
    prefill.countryName = country.trim();
  }

  const player = get("playerName");
  if (player !== null && player.trim() !== "" && player.length <= 120) {
    prefill.playerName = player.trim();
  }

  const match = get("matchLabel");
  if (match !== null && match.trim() !== "" && match.length <= 160) {
    prefill.matchLabel = match.trim();
  }

  return prefill;
}
