// Defensive Zod schema for the worldcup26.ir community API. Its exact contract
// is not guaranteed, so this is deliberately permissive: a wide net of common
// field names, all optional, unknown keys ignored. Anything that does not fit
// is skipped during normalization rather than throwing — the provider must
// never crash the sync.

import { z } from "zod";

const numberish = z.union([z.number(), z.string()]).optional();

export const worldcup26MatchSchema = z
  .object({
    id: numberish,
    matchId: numberish,
    fixtureId: numberish,
    number: numberish,
    matchNumber: numberish,
    round: z.union([z.string(), z.number()]).optional(),
    stage: z.string().optional(),
    group: z.string().optional(),
    groupName: z.string().optional(),
    status: z.union([z.string(), z.number()]).optional(),
    state: z.string().optional(),
    date: z.string().optional(),
    datetime: z.string().optional(),
    kickoff: z.string().optional(),
    utcDate: z.string().optional(),
    time: z.string().optional(),
    timezone: z.string().optional(),
    home: z.unknown().optional(),
    away: z.unknown().optional(),
    homeTeam: z.unknown().optional(),
    awayTeam: z.unknown().optional(),
    team1: z.unknown().optional(),
    team2: z.unknown().optional(),
    homeScore: numberish,
    awayScore: numberish,
    score: z.unknown().optional(),
    venue: z.unknown().optional(),
    stadium: z.unknown().optional(),
    city: z.string().optional(),
    updatedAt: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .loose();

/** Accepts a bare array or a `{ data | matches | fixtures | results }` wrapper. */
export const worldcup26DocumentSchema = z.union([
  z.array(worldcup26MatchSchema),
  z
    .object({
      data: z.array(worldcup26MatchSchema).optional(),
      matches: z.array(worldcup26MatchSchema).optional(),
      fixtures: z.array(worldcup26MatchSchema).optional(),
      results: z.array(worldcup26MatchSchema).optional(),
    })
    .loose(),
]);

export type Worldcup26Match = z.infer<typeof worldcup26MatchSchema>;
export type Worldcup26Document = z.infer<typeof worldcup26DocumentSchema>;
