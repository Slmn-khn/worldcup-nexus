// Extract stage: read the worldcupnexus_2026_data bundle from disk, verify the
// SHA-256 manifest, and parse every file the import uses with Zod. Never
// touches the database. Relative imports only (runs under tsx and vitest).

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { parse } from "csv-parse/sync";
import { z } from "zod";

// --- Zod row schemas --------------------------------------------------------

const intString = z
  .string()
  .trim()
  .regex(/^-?\d+$/, "expected an integer")
  .transform(Number);
const optionalInt = z
  .string()
  .trim()
  .transform((value, ctx) => {
    if (value === "") return null;
    if (!/^-?\d+$/.test(value)) {
      ctx.addIssue({ code: "custom", message: "expected an integer or empty" });
      return z.NEVER;
    }
    return Number(value);
  });
const optionalNumber = z
  .string()
  .trim()
  .transform((value, ctx) => {
    if (value === "") return null;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      ctx.addIssue({ code: "custom", message: "expected a number or empty" });
      return z.NEVER;
    }
    return parsed;
  });
const isoDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");
const nonEmpty = z.string().trim().min(1);
const candidateStatus = z.literal("REQUIRES_RECONCILIATION");
const officialStatus = z.literal("FIFA_OFFICIAL");
const bool01 = z.enum(["0", "1"]).transform((value) => value === "1");
const boolWord = z.enum(["True", "False"]).transform((value) => value === "True");

export const teamRow = z.object({
  team_id: intString,
  team_name: nonEmpty,
  fifa_code: z.string().trim().regex(/^[A-Z]{3}$/),
  group_letter: z.string().trim().regex(/^[A-L]$/),
  confederation: nonEmpty,
  manager_name: z.string().trim(),
  verification_status: candidateStatus,
});

export const venueRow = z.object({
  venue_id: intString,
  stadium_name: nonEmpty,
  city: nonEmpty,
  country: z.enum(["CAN", "MEX", "USA"]),
  capacity: optionalInt,
  latitude: optionalNumber,
  longitude: optionalNumber,
  elevation_meters: optionalInt,
  verification_status: candidateStatus,
});

export const stageRow = z.object({
  stage_id: intString,
  stage_name: nonEmpty,
  is_knockout: boolWord,
  verification_status: candidateStatus,
});

export const refereeRow = z.object({
  referee_id: intString,
  name: nonEmpty,
  country: nonEmpty,
  verification_status: candidateStatus,
});

export const matchRow = z.object({
  match_id: intString,
  date: isoDate,
  kickoff_time_utc: z.string().trim().regex(/^\d{2}:\d{2}$/),
  stage_id: intString,
  venue_id: intString,
  home_team_id: intString,
  away_team_id: intString,
  home_score: intString,
  away_score: intString,
  home_penalty_score: optionalInt,
  away_penalty_score: optionalInt,
  status: z.literal("Completed"),
  result_type: z.enum(["Regular", "AET", "Penalties"]),
  referee_id: optionalInt,
  player_of_the_match_id: optionalInt,
  verification_status: candidateStatus,
});

export const playerRow = z.object({
  player_id: intString,
  team_id: intString,
  player_name: nonEmpty,
  position: z.enum(["GK", "DEF", "MID", "FWD"]),
  club_team: z.string().trim(),
  caps: optionalInt,
  date_of_birth: z.union([isoDate, z.literal("")]),
  height_cm: optionalInt,
  goals: optionalInt,
  verification_status: candidateStatus,
});

export const EVENT_TYPES = [
  "Goal",
  "Own Goal",
  "Assist",
  "Yellow Card",
  "Red Card",
  "VAR Review",
  "Penalty Shootout Goal",
  "Penalty Shootout Miss",
] as const;

export const eventRow = z.object({
  event_id: intString,
  match_id: intString,
  minute: intString,
  event_type: z.enum(EVENT_TYPES),
  team_id: intString,
  player_id: intString,
  verification_status: candidateStatus,
});

export const lineupRow = z.object({
  lineup_id: intString,
  match_id: intString,
  player_id: intString,
  team_id: intString,
  is_starting_xi: bool01,
  tactical_position: z.string().trim(),
  minutes_played: optionalInt,
  verification_status: candidateStatus,
});

export const teamStatRow = z.object({
  match_id: intString,
  team_id: intString,
  data_source: nonEmpty,
  last_updated: z.string().trim(),
  verification_status: candidateStatus,
});

export const awardRow = z.object({
  award_category: nonEmpty,
  rank: intString,
  recipient_type: z.enum(["TEAM", "PLAYER"]),
  player_id: optionalInt,
  player_name: z.string().trim(),
  team_id: intString,
  team_name: nonEmpty,
  shirt_number: optionalInt,
  goals: optionalInt,
  assists: optionalInt,
  minutes: optionalInt,
  source_url: z.url(),
  verification_status: officialStatus,
});

export const tournamentSummaryRow = z.object({
  year: intString,
  name: nonEmpty,
  start_date: isoDate,
  end_date: isoDate,
  host_countries: nonEmpty,
  team_count: intString,
  match_count: intString,
  goal_count: intString,
  venue_count: intString,
  attendance: intString,
  champion_team_id: intString,
  champion: nonEmpty,
  runner_up_team_id: intString,
  runner_up: nonEmpty,
  third_place_team_id: intString,
  third_place: nonEmpty,
  fourth_place_team_id: intString,
  fourth_place: nonEmpty,
  final_match_id: intString,
  source_url: z.url(),
  verification_status: officialStatus,
});

export type TeamRow = z.infer<typeof teamRow>;
export type VenueRow = z.infer<typeof venueRow>;
export type StageRow = z.infer<typeof stageRow>;
export type RefereeRow = z.infer<typeof refereeRow>;
export type MatchRow = z.infer<typeof matchRow>;
export type PlayerRow = z.infer<typeof playerRow>;
export type EventRow = z.infer<typeof eventRow>;
export type LineupRow = z.infer<typeof lineupRow>;
export type TeamStatRow = z.infer<typeof teamStatRow>;
export type AwardRow = z.infer<typeof awardRow>;
export type TournamentSummaryRow = z.infer<typeof tournamentSummaryRow>;

// --- File registry ----------------------------------------------------------

export const BUNDLE_FILES = {
  tournament: "01_verified_official/tournament_summary_2026.csv",
  awards: "01_verified_official/awards_2026.csv",
  teams: "02_import_candidates/teams_2026.csv",
  venues: "02_import_candidates/venues_2026.csv",
  stages: "02_import_candidates/tournament_stages_2026.csv",
  referees: "02_import_candidates/referees_2026.csv",
  matches: "02_import_candidates/matches_2026.csv",
  players: "02_import_candidates/players_2026.csv",
  events: "02_import_candidates/match_events_2026.csv",
  lineups: "02_import_candidates/match_lineups_2026.csv",
  teamStats: "02_import_candidates/match_team_stats_2026.csv",
  validationReport: "validation/validation_report.json",
  manifest: "source_manifest.csv",
} as const;

/** Raw rows (all string values) keyed by file, kept for RawSourceRecord. */
export type RawRow = Record<string, string>;

export type ParsedBundle = {
  dir: string;
  /** sha256 of source_manifest.csv — pins the exact snapshot (the "checksum"). */
  manifestSha256: string;
  validationReportSha256: string;
  validationReport: { all_structural_checks_passed: boolean; checks_passed: number; checks_total: number };
  fileSha256: Record<string, string>;
  tournament: TournamentSummaryRow;
  awards: AwardRow[];
  teams: TeamRow[];
  venues: VenueRow[];
  stages: StageRow[];
  referees: RefereeRow[];
  matches: MatchRow[];
  players: PlayerRow[];
  events: EventRow[];
  lineups: LineupRow[];
  teamStats: TeamStatRow[];
  raw: Record<keyof typeof BUNDLE_FILES, RawRow[]>;
};

export class BundleError extends Error {
  constructor(
    message: string,
    readonly details: string[] = [],
  ) {
    super(message);
    this.name = "BundleError";
  }
}

export function sha256(buffer: Buffer | string): string {
  return createHash("sha256").update(buffer).digest("hex");
}

/** Parse CSV text into string records (BOM-tolerant, CRLF-tolerant). */
export function parseCsv(text: string): RawRow[] {
  return parse(text, {
    columns: true,
    bom: true,
    skip_empty_lines: true,
    relax_column_count: false,
  }) as RawRow[];
}

/**
 * Validate rows with a schema; collect structured errors that name the file,
 * 1-based data row number and the failing rule instead of throwing on the
 * first one.
 */
export function parseRows<T>(
  file: string,
  rows: RawRow[],
  schema: z.ZodType<T>,
  errors: string[],
): T[] {
  const out: T[] = [];
  rows.forEach((row, index) => {
    const result = schema.safeParse(row);
    if (result.success) {
      out.push(result.data);
    } else {
      for (const issue of result.error.issues) {
        errors.push(
          `${file} row ${index + 1}: ${issue.path.join(".") || "(row)"} — ${issue.message}`,
        );
      }
    }
  });
  return out;
}

export type ManifestCheck = {
  verified: string[];
  mismatched: string[];
  missing: string[];
  /** Mismatches that are known-benign (documented in the report). */
  ignored: string[];
};

/**
 * `validation/latest_validation_output.json` is captured from stdout AFTER the
 * bundle script writes the manifest, so the manifest always records it as 0
 * bytes. It is not read by the import; its mismatch is reported, not fatal.
 */
const MANIFEST_BENIGN = new Set(["validation/latest_validation_output.json"]);

export async function verifyManifest(dir: string): Promise<ManifestCheck> {
  const manifest = parseCsv(
    await readFile(path.join(dir, BUNDLE_FILES.manifest), "utf8"),
  );
  const check: ManifestCheck = { verified: [], mismatched: [], missing: [], ignored: [] };
  for (const entry of manifest) {
    const relative = entry.path;
    if (relative === undefined || relative.includes("..")) {
      check.mismatched.push(String(relative));
      continue;
    }
    let buffer: Buffer;
    try {
      buffer = await readFile(path.join(dir, relative));
    } catch {
      check.missing.push(relative);
      continue;
    }
    const ok =
      sha256(buffer) === entry.sha256 && String(buffer.length) === entry.size_bytes;
    if (ok) check.verified.push(relative);
    else if (MANIFEST_BENIGN.has(relative)) check.ignored.push(relative);
    else check.mismatched.push(relative);
  }
  return check;
}

export async function loadBundle(dir: string): Promise<ParsedBundle> {
  const manifest = await verifyManifest(dir);
  const required = Object.values(BUNDLE_FILES).filter(
    (file) => file !== BUNDLE_FILES.manifest,
  );
  const unlisted = required.filter((file) => !manifest.verified.includes(file));
  if (manifest.mismatched.length > 0 || manifest.missing.length > 0 || unlisted.length > 0) {
    throw new BundleError("Bundle manifest verification failed — refusing to import.", [
      ...manifest.mismatched.map((file) => `checksum mismatch: ${file}`),
      ...manifest.missing.map((file) => `missing file: ${file}`),
      ...unlisted.map((file) => `required file not verified by manifest: ${file}`),
    ]);
  }

  const fileSha256: Record<string, string> = {};
  const raw = {} as Record<keyof typeof BUNDLE_FILES, RawRow[]>;
  const texts = {} as Record<keyof typeof BUNDLE_FILES, string>;
  for (const [key, file] of Object.entries(BUNDLE_FILES) as [keyof typeof BUNDLE_FILES, string][]) {
    const buffer = await readFile(path.join(dir, file));
    fileSha256[file] = sha256(buffer);
    texts[key] = buffer.toString("utf8");
    raw[key] = file.endsWith(".csv") ? parseCsv(texts[key]) : [];
  }

  const validationReport = JSON.parse(texts.validationReport) as ParsedBundle["validationReport"];
  if (validationReport.all_structural_checks_passed !== true) {
    throw new BundleError("Bundle validation_report.json says structural checks failed.");
  }

  const errors: string[] = [];
  const tournaments = parseRows(BUNDLE_FILES.tournament, raw.tournament, tournamentSummaryRow, errors);
  const bundle: ParsedBundle = {
    dir,
    manifestSha256: fileSha256[BUNDLE_FILES.manifest]!,
    validationReportSha256: fileSha256[BUNDLE_FILES.validationReport]!,
    validationReport,
    fileSha256,
    tournament: tournaments[0]!,
    awards: parseRows(BUNDLE_FILES.awards, raw.awards, awardRow, errors),
    teams: parseRows(BUNDLE_FILES.teams, raw.teams, teamRow, errors),
    venues: parseRows(BUNDLE_FILES.venues, raw.venues, venueRow, errors),
    stages: parseRows(BUNDLE_FILES.stages, raw.stages, stageRow, errors),
    referees: parseRows(BUNDLE_FILES.referees, raw.referees, refereeRow, errors),
    matches: parseRows(BUNDLE_FILES.matches, raw.matches, matchRow, errors),
    players: parseRows(BUNDLE_FILES.players, raw.players, playerRow, errors),
    events: parseRows(BUNDLE_FILES.events, raw.events, eventRow, errors),
    lineups: parseRows(BUNDLE_FILES.lineups, raw.lineups, lineupRow, errors),
    teamStats: parseRows(BUNDLE_FILES.teamStats, raw.teamStats, teamStatRow, errors),
    raw,
  };
  if (tournaments.length !== 1) {
    errors.push(`${BUNDLE_FILES.tournament}: expected exactly 1 row, found ${raw.tournament.length}`);
  }
  if (errors.length > 0) {
    throw new BundleError(`Bundle failed schema validation (${errors.length} issue(s)).`, errors);
  }
  return bundle;
}
