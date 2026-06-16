// Zod validation for fixture API query params. Bad input is rejected (or
// ignored) — never trusted. App-only (route handlers), so "@/"-free relative
// imports are not required, but kept relative for consistency with siblings.

import { z } from "zod";
import { MAX_LIST_LIMIT } from "./constants";
import type { FixtureStatusValue } from "./types";

const FIXTURE_STATUSES: readonly FixtureStatusValue[] = [
  "SCHEDULED",
  "LIVE",
  "HALF_TIME",
  "FINISHED",
  "POSTPONED",
  "CANCELLED",
  "UNKNOWN",
] as const;

const isoDate = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "invalid date",
  })
  .transform((value) => new Date(value));

export const fixtureListQuerySchema = z.object({
  from: isoDate.optional(),
  to: isoDate.optional(),
  status: z.enum(FIXTURE_STATUSES).optional(),
  group: z.string().trim().min(1).max(60).optional(),
  stage: z.string().trim().min(1).max(60).optional(),
  q: z.string().trim().min(1).max(80).optional(),
  limit: z.coerce.number().int().min(1).max(MAX_LIST_LIMIT).optional(),
});

export type FixtureListQuery = z.infer<typeof fixtureListQuerySchema>;

/** Parses a URLSearchParams into validated query options (throws on invalid). */
export function parseFixtureListQuery(
  searchParams: URLSearchParams,
): FixtureListQuery {
  const raw: Record<string, string> = {};
  for (const key of ["from", "to", "status", "group", "stage", "q", "limit"]) {
    const value = searchParams.get(key);
    if (value !== null && value.trim() !== "") raw[key] = value;
  }
  return fixtureListQuerySchema.parse(raw);
}
