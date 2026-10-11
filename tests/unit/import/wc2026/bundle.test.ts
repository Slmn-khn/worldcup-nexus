// Hermetic tests over the real worldcupnexus_2026_data bundle: extract (Zod +
// manifest), stage (transformations) and validate (cross-file invariants).
// No database. Mutation tests clone the parsed bundle and break one thing.

import { beforeAll, describe, expect, it } from "vitest";

import { loadBundle, parseRows, playerRow, type ParsedBundle } from "../../../../src/server/import/wc2026/bundle";
import { stageBundle, type StagedBundle } from "../../../../src/server/import/wc2026/stage";
import { validateBundle } from "../../../../src/server/import/wc2026/validate";

const BUNDLE_DIR = "docs/worldcupnexus_2026_data";

let bundle: ParsedBundle;
let staged: StagedBundle;

beforeAll(async () => {
  bundle = await loadBundle(BUNDLE_DIR);
  staged = stageBundle(bundle);
});

function clone(): ParsedBundle {
  return structuredClone(bundle);
}

describe("extract (Zod + manifest)", () => {
  it("parses every file and pins the snapshot by manifest hash", () => {
    expect(bundle.teams).toHaveLength(48);
    expect(bundle.matches).toHaveLength(104);
    expect(bundle.players).toHaveLength(1248);
    expect(bundle.awards).toHaveLength(9);
    expect(bundle.manifestSha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it("reports row-level schema errors with file, row and rule", () => {
    const errors: string[] = [];
    parseRows("players_2026.csv", [{ ...bundle.raw.players[0]!, position: "STRIKER", date_of_birth: "25/02/2000" }], playerRow, errors);
    expect(errors.some((e) => e.startsWith("players_2026.csv row 1: position"))).toBe(true);
    expect(errors.some((e) => e.includes("date_of_birth"))).toBe(true);
  });
});

describe("stage (transformations)", () => {
  it("stages 308 goals, 30 shootout kicks and folds 204 assists", () => {
    expect(staged.goals).toHaveLength(308);
    expect(staged.shootoutKicks).toHaveLength(30);
    expect(staged.goals.filter((g) => g.assistPlayerSrcId !== null)).toHaveLength(204);
  });

  it("credits own goals to the opponent (canonical Goal.teamId convention)", () => {
    const ownGoals = staged.goals.filter((g) => g.isOwnGoal);
    expect(ownGoals).toHaveLength(14);
    const playerTeam = new Map(bundle.players.map((p) => [p.player_id, p.team_id]));
    for (const goal of ownGoals) {
      expect(goal.teamSrcId).not.toBe(playerTeam.get(goal.playerSrcId));
      expect(goal.assistPlayerSrcId).toBeNull();
    }
  });

  it("never counts shootout kicks as goals", () => {
    const goalIds = new Set(staged.goals.map((g) => g.eventId));
    expect(staged.shootoutKicks.some((k) => goalIds.has(k.eventId))).toBe(false);
    const golden = staged.goals.filter((g) => g.playerSrcId === 842 && !g.isOwnGoal);
    expect(golden).toHaveLength(10); // Mbappé — FIFA Golden Boot total
  });

  it("orders shootout kicks per match", () => {
    const m75 = staged.shootoutKicks.filter((k) => k.matchSrcId === 75).map((k) => k.order);
    expect(m75).toEqual(m75.map((_, i) => i + 1));
  });

  it("maps round of 32 as a first-class stage and labels groups", () => {
    expect(staged.matches.filter((m) => m.stage === "round of 32")).toHaveLength(16);
    expect(staged.matches.find((m) => m.srcId === 1)?.groupName).toBe("Group A");
    expect(staged.matches.filter((m) => m.stage !== "group stage").every((m) => m.groupName === null)).toBe(true);
  });

  it("models extra time and shootouts without guessing", () => {
    const final = staged.matches.find((m) => m.srcId === 104)!;
    expect(final).toMatchObject({ extraTime: true, decidedByPenalties: false, winnerSrcId: 29 });
    const pens = staged.matches.find((m) => m.srcId === 75)!;
    expect(pens).toMatchObject({ extraTime: true, decidedByPenalties: true, homeScorePenalties: 3, awayScorePenalties: 4, winnerSrcId: 14 });
    const m96 = staged.matches.find((m) => m.srcId === 96)!;
    expect(m96).toMatchObject({ extraTime: null, winnerSrcId: null, outcomeIncomplete: true, homeScorePenalties: null });
    const group = staged.matches.find((m) => m.srcId === 1)!;
    expect(group.extraTime).toBe(false);
  });

  it("prefers FIFA official names and shirt numbers for award winners only", () => {
    const cubarsi = staged.players.find((p) => p.srcId === 750)!;
    expect(cubarsi).toMatchObject({ name: "Pau Cubarsí", candidateName: "Pau Cubarsi", shirtNumber: 22, position: "DF" });
    const other = staged.players.find((p) => p.srcId === 1)!;
    expect(other.shirtNumber).toBeNull();
    expect(other.officialName).toBeNull();
  });

  it("withholds bookings, VAR, lineups, team stats and quarantine data", () => {
    expect(staged.withheld.bookings.rows).toBe(47);
    expect(staged.withheld.lineups.rows).toBe(5408);
    expect(staged.withheld.teamStats.rows).toBe(208);
    expect(Object.keys(staged)).not.toContain("bookings");
  });
});

describe("validate (cross-file invariants)", () => {
  it("passes the real bundle with M96 as the only known conflict", () => {
    const result = validateBundle(bundle, staged);
    expect(result.ok).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.checks.find((c) => c.id === "knockout-draws-have-outcome")?.status).toBe("KNOWN_CONFLICT");
    expect(result.checks.find((c) => c.id === "final-official")?.status).toBe("PASS");
  });

  it("blocks when an event no longer reconciles with the scoreline", () => {
    const broken = clone();
    broken.matches.find((m) => m.match_id === 1)!.home_score = 3;
    const result = validateBundle(broken, stageBundle(broken));
    expect(result.ok).toBe(false);
    expect(result.blockers.map((b) => b.id)).toEqual(expect.arrayContaining(["goals-reconcile", "goal-total"]));
  });

  it("blocks a second unexplained knockout draw (only M96 is a known conflict)", () => {
    const broken = clone();
    const qf = broken.matches.find((m) => m.match_id === 97)!; // France 2–0 Morocco
    qf.home_score = 0;
    broken.events = broken.events.filter((e) => !(e.match_id === 97 && (e.event_type === "Goal" || e.event_type === "Own Goal" || e.event_type === "Assist")));
    const result = validateBundle(broken, stageBundle(broken));
    expect(result.checks.find((c) => c.id === "knockout-draws-have-outcome")?.status).toBe("FAIL");
    expect(result.ok).toBe(false);
  });

  it("blocks when shootout kicks disagree with the penalty score", () => {
    const broken = clone();
    broken.matches.find((m) => m.match_id === 75)!.home_penalty_score = 5;
    const result = validateBundle(broken, stageBundle(broken));
    expect(result.blockers.map((b) => b.id)).toContain("shootouts-reconcile");
  });

  it("blocks an official podium that disagrees with the candidate results", () => {
    const broken = clone();
    broken.tournament.champion_team_id = 37;
    const result = validateBundle(broken, stageBundle(broken));
    expect(result.ok).toBe(false);
  });

  it("blocks a team name that is not a reviewed alias", () => {
    const broken = clone();
    broken.teams.find((t) => t.fifa_code === "CIV")!.team_name = "Elfenbeinküste";
    const result = validateBundle(broken, stageBundle(broken));
    expect(result.blockers.map((b) => b.id)).toContain("staging");
  });
});
