// Pure presentation model for the archive hub: group tables, bracket tree and
// score labels. No database, no React — unit-tested directly.

import { computeGroupStandings, type Wc2026GroupStandingRow } from "../worldcup2026/groupStandings";
import type { ArchiveMatchDto } from "./tournamentArchiveTypes";

// --- groups -----------------------------------------------------------------

export type ArchiveGroupRow = Wc2026GroupStandingRow & {
  teamSlug: string;
  countrySlug: string | null;
  /** Played in the first knockout round (a fact from match data, not a tie-break). */
  advanced: boolean;
};

export type ArchiveGroup = { letter: string; rows: ArchiveGroupRow[] };

/**
 * Group tables COMPUTED from imported results (3/1/0 points; ordered by
 * points, goal difference, goals scored, name). This is not FIFA's official
 * ranking: head-to-head and fair-play tie-breakers are not applied, so the
 * "advanced" flag comes from who actually played the first knockout round —
 * that also covers the 2026 best-third-placed qualifiers without assuming a
 * bracket rule.
 */
export function computeArchiveGroups(matches: ArchiveMatchDto[]): ArchiveGroup[] {
  const groupMatches = matches.filter((m) => m.groupName !== null);
  const firstKnockout = firstKnockoutStage(matches);
  const advancedSlugs = new Set(
    matches.filter((m) => m.stage === firstKnockout).flatMap((m) => [m.homeTeam.slug, m.awayTeam.slug]),
  );
  const teamBySlug = new Map(groupMatches.flatMap((m) => [[m.homeTeam.slug, m.homeTeam], [m.awayTeam.slug, m.awayTeam]] as const));
  const standings = computeGroupStandings(
    groupMatches.map((m) => ({
      groupLetter: m.groupName!.replace(/^Group\s+/i, ""),
      // Slugs are unique within a tournament; names are display-only.
      homeTeamName: m.homeTeam.slug,
      awayTeamName: m.awayTeam.slug,
      homeTeamCode: m.homeTeam.code,
      awayTeamCode: m.awayTeam.code,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
    })),
  );
  return standings.map((group) => ({
    letter: group.letter,
    rows: group.rows.map((row) => {
      const team = teamBySlug.get(row.teamName)!;
      return {
        ...row,
        teamName: team.name,
        teamSlug: team.slug,
        countrySlug: team.countrySlug,
        advanced: advancedSlugs.has(team.slug),
      };
    }),
  }));
}

// --- bracket ----------------------------------------------------------------

export const KNOCKOUT_ROUNDS = [
  { stage: "round of 32", label: "Round of 32" },
  { stage: "round of 16", label: "Round of 16" },
  { stage: "quarter-finals", label: "Quarter-finals" },
  { stage: "semi-finals", label: "Semi-finals" },
  { stage: "final", label: "Final" },
] as const;

export function firstKnockoutStage(matches: ArchiveMatchDto[]): string | null {
  return KNOCKOUT_ROUNDS.find((round) => matches.some((m) => m.stage === round.stage))?.stage ?? null;
}

export type ArchiveBracket = {
  rounds: { stage: string; label: string; matches: ArchiveMatchDto[] }[];
  thirdPlace: ArchiveMatchDto | null;
};

/**
 * Orders each knockout round so feeder matches sit next to the match they
 * feed. Feeders are found by TEAM PARTICIPATION (a team in a later match
 * played in exactly one earlier-round match), never by recorded winner — so
 * a match whose outcome the source omits still slots into the tree.
 */
export function buildBracket(matches: ArchiveMatchDto[]): ArchiveBracket {
  const rounds = KNOCKOUT_ROUNDS.map((round) => ({
    ...round,
    matches: matches.filter((m) => m.stage === round.stage).sort((a, b) => (a.matchNumber ?? 0) - (b.matchNumber ?? 0)),
  })).filter((round) => round.matches.length > 0);
  const thirdPlace = matches.find((m) => m.stage === "third-place match") ?? null;
  if (rounds.length === 0) return { rounds: [], thirdPlace };

  const feederOf = (match: ArchiveMatchDto, previous: ArchiveMatchDto[]): ArchiveMatchDto[] =>
    [match.homeTeam.slug, match.awayTeam.slug].flatMap((slug) => {
      const found = previous.filter((p) => p.homeTeam.slug === slug || p.awayTeam.slug === slug);
      return found.length === 1 ? [found[0]!] : [];
    });

  // Walk back from the last round, re-ordering each earlier round to follow
  // its successors; unmatched matches keep their match-number order at the end.
  const ordered = rounds.map((round) => [...round.matches]);
  for (let index = ordered.length - 1; index > 0; index -= 1) {
    const previous = ordered[index - 1]!;
    const next: ArchiveMatchDto[] = [];
    for (const match of ordered[index]!) {
      for (const feeder of feederOf(match, previous)) if (!next.includes(feeder)) next.push(feeder);
    }
    for (const match of previous) if (!next.includes(match)) next.push(match);
    ordered[index - 1] = next;
  }
  return {
    rounds: rounds.map((round, index) => ({ stage: round.stage, label: round.label, matches: ordered[index]! })),
    thirdPlace,
  };
}

// --- score labels -------------------------------------------------------------

/**
 * Display score that never folds shootout kicks into the match score:
 * "1–0 a.e.t.", "1–1 (3–4 pens)", or "0–0 · outcome not recorded".
 */
export function formatArchiveScore(match: Pick<ArchiveMatchDto, "homeScore" | "awayScore" | "homeScorePenalties" | "awayScorePenalties" | "decidedByPenalties" | "extraTime" | "outcomeIncomplete">): string {
  const base = `${match.homeScore}–${match.awayScore}`;
  if (match.decidedByPenalties && match.homeScorePenalties !== null && match.awayScorePenalties !== null) {
    return `${base} (${match.homeScorePenalties}–${match.awayScorePenalties} pens)`;
  }
  if (match.outcomeIncomplete) return `${base} · outcome not recorded`;
  if (match.extraTime === true) return `${base} a.e.t.`;
  return base;
}

/** Screen-reader sentence for a match link. */
export function describeArchiveMatch(match: ArchiveMatchDto, stageLabel: string): string {
  const score = formatArchiveScore(match)
    .replace("a.e.t.", "after extra time")
    .replace("pens", "on penalties")
    .replaceAll("–", " to ");
  const winner = match.winnerSide === null ? "" : `, ${match.winnerSide === "home" ? match.homeTeam.name : match.awayTeam.name} won`;
  return `${stageLabel}: ${match.homeTeam.name} ${score} ${match.awayTeam.name}${winner}`;
}
