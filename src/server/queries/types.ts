// Frontend-friendly DTOs returned by the server query layer.
// Pages receive only these shapes — never raw Prisma models and never
// RawSourceRecord payloads. Dates are ISO strings, everything is
// JSON-serializable.

export type ArchiveStatsDto = {
  tournaments: number;
  countries: number;
  teams: number;
  players: number;
  matches: number;
  goals: number;
  bookings: number;
  substitutions: number;
  penaltyKicks: number;
  awards: number;
};

export type TeamRefDto = {
  name: string;
  slug: string;
};

export type TournamentCardDto = {
  id: string;
  year: number;
  name: string;
  slug: string;
  hostName: string | null;
  teamsCount: number | null;
  matchesCount: number | null;
  goalsCount: number | null;
  winner: string | null;
  runnerUp: string | null;
  /** e.g. "3–3 (4–2 pens)" — null when the tournament had no "final" stage match. */
  finalScore: string | null;
};

export type TournamentTeamDto = {
  id: string;
  name: string;
  slug: string;
  code: string | null;
};

export type TopScorerDto = {
  playerId: string;
  name: string;
  slug: string;
  countryName: string | null;
  goals: number;
};

export type AwardDto = {
  name: string;
  playerName: string | null;
  playerSlug: string | null;
  teamName: string | null;
};

export type TournamentDetailDto = TournamentCardDto & {
  startDate: string | null;
  endDate: string | null;
  teams: TournamentTeamDto[];
  matches: MatchCardDto[];
  topScorers: TopScorerDto[];
  awards: AwardDto[];
  stats: {
    penaltyShootouts: number;
    penaltyKicks: number;
    bookings: number;
    substitutions: number;
  };
};

export type MatchCardDto = {
  id: string;
  slug: string;
  stage: string;
  matchDate: string | null;
  tournamentYear: number;
  tournamentSlug: string;
  tournamentName: string;
  homeTeam: TeamRefDto;
  awayTeam: TeamRefDto;
  homeScore: number;
  awayScore: number;
  /** e.g. "3–3" (full-time / after extra time, as recorded by the source). */
  score: string;
  /** e.g. "4–2" — only set when the match was decided by penalties. */
  penaltyScore: string | null;
  decidedByPenalties: boolean;
  stadiumName: string | null;
};

export type MatchGoalDto = {
  playerName: string;
  playerSlug: string;
  teamName: string;
  minute: number | null;
  stoppageMinute: number | null;
  isOwnGoal: boolean;
  isPenalty: boolean;
};

export type MatchBookingDto = {
  playerName: string;
  playerSlug: string;
  teamName: string;
  cardType: "YELLOW" | "SECOND_YELLOW" | "RED";
  minute: number | null;
  stoppageMinute: number | null;
};

export type MatchSubstitutionDto = {
  teamName: string;
  playerInName: string | null;
  playerInSlug: string | null;
  playerOutName: string | null;
  playerOutSlug: string | null;
  minute: number | null;
  stoppageMinute: number | null;
};

export type MatchPenaltyKickDto = {
  playerName: string | null;
  playerSlug: string | null;
  teamName: string;
  type: "IN_MATCH" | "SHOOTOUT";
  converted: boolean;
};

export type MatchDetailDto = MatchCardDto & {
  stadium: { name: string; city: string | null; country: string | null } | null;
  /** Always null for now — referee–match links are not in the imported subset (ISSUE-005). */
  referee: { name: string; country: string | null } | null;
  /** Always null for now — attendance is not in the imported source columns. */
  attendance: number | null;
  goals: MatchGoalDto[];
  bookings: MatchBookingDto[];
  substitutions: MatchSubstitutionDto[];
  penaltyKicks: MatchPenaltyKickDto[];
};

export type CountryCardDto = {
  id: string;
  name: string;
  slug: string;
  code: string | null;
  /** Number of tournament participations (Team rows are per tournament). */
  tournamentsEntered: number;
  playersCount: number;
};

export type CountryParticipationDto = {
  tournamentYear: number;
  tournamentSlug: string;
  tournamentName: string;
  teamId: string;
};

export type SquadTournamentsLeaderDto = {
  playerId: string;
  name: string;
  slug: string;
  /** Tournaments the player was named in a squad — NOT match appearances. */
  squadTournaments: number;
};

export type CountryProfileDto = {
  id: string;
  name: string;
  slug: string;
  code: string | null;
  participations: CountryParticipationDto[];
  totals: {
    tournamentsEntered: number;
    matchesPlayed: number;
    goalsFor: number;
    goalsAgainst: number;
    finalsPlayed: number;
  };
  topScorers: TopScorerDto[];
  mostSquadTournaments: SquadTournamentsLeaderDto[];
  finals: MatchCardDto[];
};

export type PlayerCardDto = {
  id: string;
  name: string;
  slug: string;
  countryName: string | null;
  countrySlug: string | null;
  position: string | null;
};

export type PlayerSquadTournamentDto = {
  tournamentYear: number;
  tournamentSlug: string;
  teamName: string;
  shirtNumber: number | null;
  position: string | null;
};

export type PlayerGoalDto = {
  matchSlug: string;
  matchLabel: string;
  tournamentYear: number;
  minute: number | null;
  stoppageMinute: number | null;
  isOwnGoal: boolean;
  isPenalty: boolean;
};

export type PlayerBookingDto = {
  matchSlug: string;
  matchLabel: string;
  tournamentYear: number;
  cardType: "YELLOW" | "SECOND_YELLOW" | "RED";
  minute: number | null;
};

export type PlayerPenaltyKickDto = {
  matchSlug: string;
  matchLabel: string;
  tournamentYear: number;
  type: "IN_MATCH" | "SHOOTOUT";
  converted: boolean;
};

export type PlayerAwardDto = {
  name: string;
  tournamentYear: number;
  tournamentSlug: string;
};

export type PlayerProfileDto = {
  id: string;
  name: string;
  slug: string;
  position: string | null;
  dateOfBirth: string | null;
  country: { name: string; slug: string } | null;
  /** Squad selections per tournament — NOT match appearances. */
  squadTournaments: PlayerSquadTournamentDto[];
  goals: PlayerGoalDto[];
  bookings: PlayerBookingDto[];
  penaltyKicks: PlayerPenaltyKickDto[];
  awards: PlayerAwardDto[];
  totals: {
    goals: number;
    ownGoals: number;
    bookings: number;
    substitutionsIn: number;
    substitutionsOut: number;
    shootoutPenaltiesTaken: number;
    shootoutPenaltiesConverted: number;
    awards: number;
  };
};

export type RecordItemDto = {
  rank: number;
  label: string;
  slug: string | null;
  value: number;
  detail: string | null;
};

export type RecordLeaderboardDto = {
  key: string;
  title: string;
  /** Clarifies exactly what the imported data supports (no invented metrics). */
  description: string;
  items: RecordItemDto[];
};

export type HomePageDataDto = {
  archiveStats: ArchiveStatsDto;
  featuredTournaments: TournamentCardDto[];
  iconicMatches: MatchCardDto[];
  featuredCountries: CountryCardDto[];
  featuredPlayers: PlayerCardDto[];
  recordsPreview: RecordLeaderboardDto[];
};
