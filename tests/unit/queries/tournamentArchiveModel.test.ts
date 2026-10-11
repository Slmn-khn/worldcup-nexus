// Archive-hub presentation model: score labels (extra time, shootouts,
// unrecorded outcomes), the participation-based bracket and group tables.

import { describe, expect, it } from "vitest";

import {
  buildBracket,
  computeArchiveGroups,
  describeArchiveMatch,
  formatArchiveScore,
} from "../../../src/server/queries/tournamentArchiveModel";
import type { ArchiveMatchDto, ArchiveTeamRef } from "../../../src/server/queries/tournamentArchiveTypes";

const team = (slug: string): ArchiveTeamRef => ({ id: slug, name: slug.toUpperCase(), slug, code: null, countrySlug: slug });

let n = 0;
function match(stage: string, home: string, away: string, score: [number, number], extra: Partial<ArchiveMatchDto> = {}): ArchiveMatchDto {
  n += 1;
  const winnerSide = score[0] === score[1] ? null : score[0] > score[1] ? "home" : "away";
  return {
    id: `m${n}`, slug: `m-${n}`, matchNumber: n, date: "2026-07-01", kickoffUtc: null, stage, groupName: null,
    venueName: null, cityName: null, homeTeam: team(home), awayTeam: team(away), homeScore: score[0], awayScore: score[1],
    homeScorePenalties: null, awayScorePenalties: null, decidedByPenalties: false, extraTime: false, winnerSide, outcomeIncomplete: false,
    ...extra,
  };
}

describe("formatArchiveScore", () => {
  it("keeps shootouts out of the score and labels extra time", () => {
    expect(formatArchiveScore(match("final", "esp", "arg", [1, 0], { extraTime: true }))).toBe("1–0 a.e.t.");
    expect(formatArchiveScore(match("round of 32", "ger", "par", [1, 1], { decidedByPenalties: true, homeScorePenalties: 3, awayScorePenalties: 4, extraTime: true, winnerSide: "away" }))).toBe("1–1 (3–4 pens)");
    expect(formatArchiveScore(match("round of 16", "sui", "col", [0, 0], { extraTime: null, outcomeIncomplete: true }))).toBe("0–0 · outcome not recorded");
    expect(formatArchiveScore(match("group stage", "a", "b", [2, 2], { extraTime: null }))).toBe("2–2");
  });

  it("describes matches for screen readers without symbols", () => {
    const m = match("final", "esp", "arg", [1, 0], { extraTime: true });
    expect(describeArchiveMatch(m, "Final")).toBe("Final: ESP 1 to 0 after extra time ARG, ESP won");
  });
});

describe("buildBracket", () => {
  it("orders feeders next to the match they feed — even without a recorded winner", () => {
    const r16 = [
      match("round of 16", "a", "b", [1, 0]),
      match("round of 16", "c", "d", [0, 0], { extraTime: null, outcomeIncomplete: true }),
      match("round of 16", "e", "f", [2, 1]),
      match("round of 16", "g", "h", [0, 1]),
    ];
    const qf = [match("quarter-finals", "e", "h", [1, 0]), match("quarter-finals", "a", "c", [2, 0])];
    const sf = [match("semi-finals", "a", "e", [1, 0])];
    const bracket = buildBracket([...r16, ...qf, ...sf]);
    expect(bracket.rounds.map((r) => r.label)).toEqual(["Round of 16", "Quarter-finals", "Semi-finals"]);
    expect(bracket.rounds[1]!.matches.map((m) => m.homeTeam.slug)).toEqual(["a", "e"]);
    expect(bracket.rounds[0]!.matches.map((m) => `${m.homeTeam.slug}${m.awayTeam.slug}`)).toEqual(["ab", "cd", "ef", "gh"]);
  });

  it("starts at the round of 32 when present and keeps the third-place match separate", () => {
    const bracket = buildBracket([match("round of 32", "a", "b", [1, 0]), match("third-place match", "x", "y", [6, 4]), match("final", "a", "z", [1, 0])]);
    expect(bracket.rounds[0]!.stage).toBe("round of 32");
    expect(bracket.thirdPlace?.homeTeam.slug).toBe("x");
  });
});

describe("computeArchiveGroups", () => {
  it("marks advancement from actual knockout participation, not tie-break assumptions", () => {
    const g = (home: string, away: string, score: [number, number]) => match("group stage", home, away, score, { groupName: "Group A" });
    const groups = computeArchiveGroups([
      g("a", "b", [1, 0]), g("c", "d", [1, 1]), g("a", "c", [0, 0]), g("b", "d", [2, 0]), g("a", "d", [3, 0]), g("b", "c", [1, 1]),
      match("round of 32", "a", "zz", [1, 0]),
      match("round of 32", "c", "yy", [1, 0]),
      match("round of 32", "b", "xx", [1, 0]),
    ]);
    expect(groups).toHaveLength(1);
    const rows = groups[0]!.rows;
    expect(rows.map((r) => r.teamSlug)).toEqual(["a", "b", "c", "d"]);
    expect(rows.filter((r) => r.advanced).map((r) => r.teamSlug)).toEqual(["a", "b", "c"]);
    expect(rows[0]!.teamName).toBe("A");
  });
});
