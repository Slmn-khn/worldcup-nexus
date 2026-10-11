// Source resolver for /schedule/2026 in post-tournament archive mode.
//
// Preference order:
//   0. Canonical Match rows for 2026 (after the canonical promotion import) —
//      the single source of truth shared with /tournaments/2026 and /matches.
//   1. Imported WorldCup2026Match rows (Mominul-only DB import) — complete
//      104-match archive with venues and result types.
//   2. File-backed archive chain (approved Mominul pack → finalized files →
//      manual verified reference pack) via getArchived2026Schedule().
//
// Never the legacy live Fixture table, never a provider fetch, never a sync.

import {
  buildArchivedScheduleResult,
  getArchived2026Schedule,
  mominulToArchivedRows,
  type Archived2026ScheduleResult,
} from "./archiveSchedule";
import {
  getWc2026Matches,
  hasImported2026Data,
  MOMINUL_ATTRIBUTION,
} from "./queries";
import { prisma } from "@/server/db/prisma";
import { getTournamentArchive, type ArchiveMatchDto } from "@/server/queries/tournamentArchive";
import type { Archived2026ScheduleRow } from "./archiveSchedule";

export type Schedule2026Display = {
  result: Archived2026ScheduleResult;
  /** Human source line for the page meta — includes attribution. */
  sourceLabel: string;
  teamsCount: number | null;
  venuesCount: number | null;
};

const CANONICAL_STAGE_KEYS: Record<string, { key: string; label: string }> = {
  "group stage": { key: "group", label: "Group Stage" },
  "round of 32": { key: "round_of_32", label: "Round of 32" },
  "round of 16": { key: "round_of_16", label: "Round of 16" },
  "quarter-finals": { key: "quarterfinal", label: "Quarter-final" },
  "semi-finals": { key: "semifinal", label: "Semi-final" },
  "third-place match": { key: "third_place", label: "Third place" },
  final: { key: "final", label: "Final" },
};

/**
 * Canonical matches → archived schedule rows. Candidate-tier results are
 * labelled REPORTED (not VERIFIED); a knockout draw with no recorded outcome
 * is INCOMPLETE rather than shown as a finished result.
 */
export function canonicalToArchivedRows(matches: ArchiveMatchDto[], finalVerified: boolean): Archived2026ScheduleRow[] {
  return matches.map((match) => {
    const stage = CANONICAL_STAGE_KEYS[match.stage] ?? { key: match.stage.replace(/\s+/g, "_"), label: match.stage };
    const winner = match.winnerSide === null ? null : match.winnerSide === "home" ? match.homeTeam : match.awayTeam;
    return {
      id: `wc2026-${match.matchNumber ?? match.id}`,
      matchId: String(match.matchNumber ?? match.id),
      date: match.date,
      dateLabel: match.date === null ? "Date under review" : new Date(`${match.date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }),
      timeLabel: match.kickoffUtc !== null ? `${match.kickoffUtc.slice(11, 16)} UTC` : null,
      stageKey: stage.key,
      stage: stage.label,
      groupName: match.groupName,
      homeTeamCode: match.homeTeam.code,
      homeTeamName: match.homeTeam.name,
      awayTeamCode: match.awayTeam.code,
      awayTeamName: match.awayTeam.name,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      homePenaltyScore: match.homeScorePenalties,
      awayPenaltyScore: match.awayScorePenalties,
      winnerTeamCode: winner?.code ?? null,
      venueId: null,
      venueName: match.venueName,
      cityName: match.cityName,
      status: match.outcomeIncomplete ? "INCOMPLETE" : match.decidedByPenalties ? "PENALTIES" : match.extraTime === true ? "AFTER_EXTRA_TIME" : "FULL_TIME",
      verification: match.stage === "final" && finalVerified ? "VERIFIED" : "REPORTED",
      sources: match.stage === "final" && finalVerified ? ["fifa_official", "mominul_2026_dataset"] : ["mominul_2026_dataset"],
      notes: match.outcomeIncomplete ? "Extra-time / penalty outcome not recorded in the source data." : null,
    };
  });
}

export async function getSchedule2026ForDisplay(): Promise<Schedule2026Display> {
  try {
    const archive = await getTournamentArchive(2026);
    if (archive !== null && archive.matches.length > 0) {
      const rows = canonicalToArchivedRows(archive.matches, archive.verificationStatus === "FIFA_OFFICIAL");
      const label = "Results: reconciled Mominul FIFA World Cup 2026 Dataset (CC0); final and podium confirmed by FIFA";
      return {
        result: buildArchivedScheduleResult(rows, rows.length, label),
        sourceLabel: label,
        teamsCount: archive.counts.teams,
        venuesCount: archive.counts.venues,
      };
    }
  } catch (error) {
    console.error("[schedule-2026] canonical archive unavailable", error);
  }
  try {
    if (await hasImported2026Data()) {
      const [matches, teamsCount, venuesCount] = await Promise.all([
        getWc2026Matches(),
        prisma.worldCup2026Team.count(),
        prisma.worldCup2026Venue.count(),
      ]);
      const rows = mominulToArchivedRows(matches);
      return {
        result: buildArchivedScheduleResult(
          rows,
          rows.length,
          `Data source: ${MOMINUL_ATTRIBUTION}`,
        ),
        sourceLabel: `Data source: ${MOMINUL_ATTRIBUTION}`,
        teamsCount,
        venuesCount,
      };
    }
  } catch (error) {
    console.error("[schedule-2026] imported archive unavailable", error);
  }

  const result = await getArchived2026Schedule();
  return {
    result,
    sourceLabel: result.lastUpdatedLabel ?? "Archived 2026 data",
    teamsCount: null,
    venuesCount: null,
  };
}
