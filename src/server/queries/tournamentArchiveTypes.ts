// DTOs shared by the archive-hub query layer and its pure model helpers.
// Type-only module (no runtime imports) so unit tests stay hermetic.

export type ArchiveTeamRef = {
  id: string;
  name: string;
  /** Per-tournament team slug (matches TeamCard / filters). */
  slug: string;
  code: string | null;
  /** Canonical country page slug (/countries/<slug>). */
  countrySlug: string | null;
};

export type ArchiveMatchDto = {
  id: string;
  slug: string;
  matchNumber: number | null;
  date: string | null;
  /** Kickoff instant (ISO, UTC) when recorded. */
  kickoffUtc: string | null;
  stage: string;
  groupName: string | null;
  venueName: string | null;
  cityName: string | null;
  homeTeam: ArchiveTeamRef;
  awayTeam: ArchiveTeamRef;
  homeScore: number;
  awayScore: number;
  homeScorePenalties: number | null;
  awayScorePenalties: number | null;
  decidedByPenalties: boolean;
  /** null = not recorded by the source. */
  extraTime: boolean | null;
  winnerSide: "home" | "away" | null;
  /** Knockout draw whose ET/shootout outcome the source does not record. */
  outcomeIncomplete: boolean;
};
