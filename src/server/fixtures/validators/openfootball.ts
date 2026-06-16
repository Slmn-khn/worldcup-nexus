// Tolerant Zod schema for the OpenFootball worldcup.json shape. The format
// varies across editions and may evolve, so fields are optional and unknown
// keys are ignored (the untouched match object is still stored as rawPayload).

import { z } from "zod";

/** A team is usually a plain name string, occasionally an object. */
const teamSchema = z.union([
  z.string(),
  z
    .object({ name: z.string().optional(), code: z.string().optional() })
    .loose(),
]);

const scoreSchema = z
  .object({
    ft: z.array(z.number()).optional(),
    ht: z.array(z.number()).optional(),
    et: z.array(z.number()).optional(),
    p: z.array(z.number()).optional(),
  })
  .loose();

export const openFootballMatchSchema = z
  .object({
    num: z.union([z.number(), z.string()]).optional(),
    round: z.string().optional(),
    stage: z.string().optional(),
    group: z.string().optional(),
    date: z.string().optional(),
    time: z.string().optional(),
    team1: teamSchema.optional(),
    team2: teamSchema.optional(),
    score: scoreSchema.optional(),
    // Some editions inline the full-time array or per-team numbers.
    ft: z.array(z.number()).optional(),
    score1: z.number().optional(),
    score2: z.number().optional(),
    group_name: z.string().optional(),
    ground: z.string().optional(),
    stadium: z
      .union([
        z.string(),
        z.object({ name: z.string().optional() }).loose(),
      ])
      .optional(),
    city: z.string().optional(),
    goals1: z.array(z.unknown()).optional(),
    goals2: z.array(z.unknown()).optional(),
  })
  .loose();

const roundSchema = z
  .object({
    name: z.string().optional(),
    matches: z.array(openFootballMatchSchema).optional(),
  })
  .loose();

export const openFootballDocumentSchema = z
  .object({
    name: z.string().optional(),
    matches: z.array(openFootballMatchSchema).optional(),
    rounds: z.array(roundSchema).optional(),
  })
  .loose();

export type OpenFootballMatch = z.infer<typeof openFootballMatchSchema>;
export type OpenFootballDocument = z.infer<typeof openFootballDocumentSchema>;
