// Shared helpers for the server query layer.

import type { Prisma } from "@/generated/prisma/client";
import type { MatchCardDto } from "./types";

/**
 * Verified stage value for deciding finals ("final"). Matched
 * case-insensitively. Deliberately does NOT match "final round" — 1950's
 * deciding group has no single final match.
 */
export const FINAL_STAGE = "final";

export const finalStageFilter = {
  equals: FINAL_STAGE,
  mode: "insensitive",
} as const;

export function toIso(date: Date | null): string | null {
  return date === null ? null : date.toISOString();
}

/** En-dash score string, e.g. "3–2". */
export function formatScore(home: number, away: number): string {
  return `${home}–${away}`;
}

/** Combined display score, e.g. "3–3 (4–2 pens)". */
export function formatFinalScore(match: {
  homeScore: number;
  awayScore: number;
  homeScorePenalties: number | null;
  awayScorePenalties: number | null;
  decidedByPenalties: boolean;
}): string {
  const base = formatScore(match.homeScore, match.awayScore);
  if (
    match.decidedByPenalties &&
    match.homeScorePenalties !== null &&
    match.awayScorePenalties !== null
  ) {
    return `${base} (${formatScore(match.homeScorePenalties, match.awayScorePenalties)} pens)`;
  }
  return base;
}

/** Relations needed to build a MatchCardDto. */
export const matchCardInclude = {
  tournament: { select: { year: true, slug: true, name: true } },
  homeTeam: { select: { name: true, slug: true } },
  awayTeam: { select: { name: true, slug: true } },
  stadium: { select: { name: true } },
} satisfies Prisma.MatchInclude;

export type MatchWithCardRelations = Prisma.MatchGetPayload<{
  include: typeof matchCardInclude;
}>;

export function toMatchCardDto(match: MatchWithCardRelations): MatchCardDto {
  return {
    id: match.id,
    slug: match.slug,
    stage: match.stage,
    matchDate: toIso(match.matchDate),
    tournamentYear: match.tournament.year,
    tournamentSlug: match.tournament.slug,
    tournamentName: match.tournament.name,
    homeTeam: { name: match.homeTeam.name, slug: match.homeTeam.slug },
    awayTeam: { name: match.awayTeam.name, slug: match.awayTeam.slug },
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    score: formatScore(match.homeScore, match.awayScore),
    penaltyScore:
      match.decidedByPenalties &&
      match.homeScorePenalties !== null &&
      match.awayScorePenalties !== null
        ? formatScore(match.homeScorePenalties, match.awayScorePenalties)
        : null,
    decidedByPenalties: match.decidedByPenalties,
    stadiumName: match.stadium?.name ?? null,
  };
}

/** "France vs Croatia" label for event lists. */
export function matchLabel(match: {
  homeTeam: { name: string };
  awayTeam: { name: string };
}): string {
  return `${match.homeTeam.name} vs ${match.awayTeam.name}`;
}
