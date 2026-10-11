// Plan step: combine staged rows with the DB snapshot into concrete,
// identity-resolved operations. Pure (given a snapshot) — the dry-run report
// is exactly this plan, and load.ts executes it without re-deciding anything.

import { CANDIDATE_NS, sourceIdFor } from "./constants";
import {
  resolvePlayer,
  resolveReferee,
  resolveVenue,
  type DbSnapshot,
  type IdentityOverrides,
} from "./resolve";
import { slugify, type StagedBundle } from "./stage";

export type CountryOp =
  | { fifaCode: string; op: "link"; countryId: string; name: string; slug: string; code: string | null }
  | { fifaCode: string; op: "create"; sourceId: string; name: string; slug: string; code: string; historicalNote?: string };

export type TeamOp = { srcId: number; sourceId: string; fifaCode: string; name: string; slug: string; code: string | null; groupLetter: string; sourceName: string };
export type VenueOp =
  | { srcId: number; op: "link"; stadiumId: string; name: string }
  | { srcId: number; op: "upsert"; sourceId: string; name: string; slug: string; city: string; country: string; capacity: number | null; latitude: number | null; longitude: number | null };
export type RefereeOp =
  | { srcId: number; op: "link"; refereeId: string; name: string; note?: string }
  | { srcId: number; op: "upsert"; sourceId: string; name: string; slug: string; country: string };
export type PlayerOp =
  | { srcId: number; op: "link"; playerId: string; method: string; canonicalName: string; candidateName: string }
  | {
      srcId: number;
      op: "upsert";
      sourceId: string;
      exists: boolean;
      name: string;
      slug: string;
      teamSrcId: number;
      position: string | null;
      dateOfBirth: string | null;
      nameIncomplete: boolean;
      candidateName: string;
    };

export type ImportPlan = {
  countries: CountryOp[];
  teams: TeamOp[];
  venues: VenueOp[];
  referees: RefereeOp[];
  players: PlayerOp[];
  /** Blocking identity conflicts. */
  conflicts: string[];
  warnings: string[];
  summary: Record<string, Record<string, number>>;
};

function tally(ops: { op: string }[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const op of ops) out[op.op] = (out[op.op] ?? 0) + 1;
  return out;
}

export function buildPlan(
  staged: StagedBundle,
  snapshot: DbSnapshot,
  overrides: IdentityOverrides,
): ImportPlan {
  const conflicts: string[] = [];
  const warnings: string[] = [];

  if (snapshot.tournament2026 !== null && snapshot.tournament2026.sourceId !== sourceIdFor.tournament()) {
    conflicts.push(
      `Tournament year 2026 already exists with sourceId ${snapshot.tournament2026.sourceId ?? "NULL"} — not created by this import; refusing to overwrite.`,
    );
  }

  // Countries ----------------------------------------------------------------
  const countryBySlug = new Map(snapshot.countries.map((c) => [c.slug, c]));
  const countries: CountryOp[] = staged.teams.map((team) => {
    const resolution = team.country;
    if (resolution.kind === "existing") {
      const country = countryBySlug.get(resolution.slug);
      if (country === undefined) {
        conflicts.push(`team ${team.srcId} ${team.sourceName}: canonical country "${resolution.slug}" not found`);
        return { fifaCode: team.fifaCode, op: "link", countryId: "", name: team.sourceName, slug: resolution.slug, code: null };
      }
      return { fifaCode: team.fifaCode, op: "link", countryId: country.id, name: country.name, slug: country.slug, code: country.code };
    }
    const existing = countryBySlug.get(resolution.slug);
    if (existing !== undefined && existing.sourceId !== sourceIdFor.country(team.fifaCode)) {
      conflicts.push(`new country slug "${resolution.slug}" already used by ${existing.sourceId ?? existing.id}`);
    }
    if (resolution.historicalNote !== undefined) warnings.push(`${resolution.name}: ${resolution.historicalNote}`);
    return {
      fifaCode: team.fifaCode,
      op: "create",
      sourceId: sourceIdFor.country(team.fifaCode),
      name: resolution.name,
      slug: resolution.slug,
      code: resolution.iso3,
      ...(resolution.historicalNote !== undefined ? { historicalNote: resolution.historicalNote } : {}),
    };
  });
  const countryByFifa = new Map(countries.map((c) => [c.fifaCode, c]));

  // Teams (one per tournament; name/code follow the canonical country) -------
  const teams: TeamOp[] = staged.teams.map((team) => {
    const country = countryByFifa.get(team.fifaCode)!;
    return {
      srcId: team.srcId,
      sourceId: sourceIdFor.team(team.srcId),
      fifaCode: team.fifaCode,
      name: country.name,
      slug: country.slug,
      code: country.code,
      groupLetter: team.groupLetter,
      sourceName: team.sourceName,
    };
  });

  // Venues -------------------------------------------------------------------
  const stadiumSlugs = new Set(snapshot.stadiums.map((s) => s.slug));
  const venues: VenueOp[] = staged.venues.map((venue) => {
    const resolution = resolveVenue(venue, snapshot.stadiums);
    if (resolution.kind === "existing") return { srcId: venue.srcId, op: "link", stadiumId: resolution.stadiumId, name: venue.name };
    if (resolution.kind === "conflict") {
      conflicts.push(`venue ${venue.srcId}: ${resolution.reason}`);
      return { srcId: venue.srcId, op: "link", stadiumId: "", name: venue.name };
    }
    const own = resolution.kind === "existing2026" ? snapshot.stadiums.find((s) => s.id === resolution.stadiumId) : undefined;
    let slug = own?.slug ?? slugify(`${venue.name} ${venue.city}`);
    if (own === undefined && stadiumSlugs.has(slug)) slug = `${slug}-v26-${venue.srcId}`;
    stadiumSlugs.add(slug);
    return {
      srcId: venue.srcId,
      op: "upsert",
      sourceId: sourceIdFor.venue(venue.srcId),
      name: venue.name,
      slug,
      city: venue.city,
      country: venue.country,
      capacity: venue.capacity,
      latitude: venue.latitude,
      longitude: venue.longitude,
    };
  });

  // Referees -----------------------------------------------------------------
  const refereeSlugs = new Set(snapshot.referees.map((r) => r.slug));
  const referees: RefereeOp[] = staged.referees.map((referee) => {
    const resolution = resolveReferee(referee, snapshot.referees);
    if (resolution.kind === "existing") {
      if (resolution.countryDiffers !== undefined) {
        warnings.push(`referee ${referee.name}: country differs (${resolution.countryDiffers}); canonical row kept unchanged`);
      }
      return {
        srcId: referee.srcId,
        op: "link",
        refereeId: resolution.refereeId,
        name: referee.name,
        ...(resolution.countryDiffers !== undefined ? { note: resolution.countryDiffers } : {}),
      };
    }
    const own = resolution.kind === "existing2026" ? snapshot.referees.find((r) => r.id === resolution.refereeId) : undefined;
    let slug = own?.slug ?? slugify(referee.name);
    if (own === undefined && refereeSlugs.has(slug)) slug = `${slug}-r26-${referee.srcId}`;
    refereeSlugs.add(slug);
    return { srcId: referee.srcId, op: "upsert", sourceId: sourceIdFor.referee(referee.srcId), name: referee.name, slug, country: referee.country };
  });

  // Players ------------------------------------------------------------------
  const teamBySrc = new Map(teams.map((t) => [t.srcId, t]));
  const ownPlayers = new Map(
    snapshot.players.filter((p) => (p.sourceId ?? "").startsWith(`${CANDIDATE_NS}:player:`)).map((p) => [p.sourceId!, p]),
  );
  const claimedSlugs = new Set<string>(snapshot.takenPlayerSlugs);
  const linkedTargets = new Map<string, number>();
  const players: PlayerOp[] = staged.players.map((player) => {
    const team = teamBySrc.get(player.teamSrcId)!;
    const country = countryByFifa.get(team.fifaCode)!;
    const countryId = country.op === "link" ? country.countryId : null;
    const resolution = resolvePlayer(player, countryId, country.name, snapshot, overrides);
    if (resolution.kind === "conflict") {
      conflicts.push(`player ${player.srcId} ${player.candidateName}: ${resolution.reason}`);
      return { srcId: player.srcId, op: "link", playerId: "", method: "conflict", canonicalName: "", candidateName: player.candidateName };
    }
    if (resolution.kind === "linked") {
      const previous = linkedTargets.get(resolution.playerId);
      if (previous !== undefined) {
        conflicts.push(`players ${previous} and ${player.srcId} both resolve to canonical ${resolution.canonicalName}`);
      }
      linkedTargets.set(resolution.playerId, player.srcId);
      return {
        srcId: player.srcId,
        op: "link",
        playerId: resolution.playerId,
        method: resolution.method,
        canonicalName: resolution.canonicalName,
        candidateName: player.candidateName,
      };
    }
    const sourceId = sourceIdFor.player(player.srcId);
    const own = ownPlayers.get(sourceId);
    const name = resolution.kind === "new" ? resolution.name : (own?.name ?? player.name);
    let slug = own?.slug ?? slugify(name);
    if (own === undefined && claimedSlugs.has(slug)) slug = `${slug}-p26-${player.srcId}`;
    claimedSlugs.add(slug);
    if (resolution.kind === "new" && resolution.possibleMatches.length > 0) {
      warnings.push(`player ${player.srcId} ${player.candidateName}: same DOB + name as ${resolution.possibleMatches.join(", ")} under another country — created separately, review`);
    }
    const nameIncomplete = resolution.kind === "new" && resolution.nameIncomplete;
    if (nameIncomplete) {
      warnings.push(`player ${player.srcId}: source name "${player.candidateName}" is truncated — stored as "${name}" until a reviewed override supplies the name`);
    }
    return {
      srcId: player.srcId,
      op: "upsert",
      sourceId,
      exists: own !== undefined,
      name,
      slug,
      teamSrcId: player.teamSrcId,
      position: player.position,
      dateOfBirth: player.dateOfBirth,
      nameIncomplete,
      candidateName: player.candidateName,
    };
  });

  const playerSummary: Record<string, number> = {};
  for (const op of players) {
    const key = op.op === "link" ? `link:${op.method}` : op.exists ? "update" : "create";
    playerSummary[key] = (playerSummary[key] ?? 0) + 1;
  }

  return {
    countries,
    teams,
    venues,
    referees,
    players,
    conflicts,
    warnings,
    summary: {
      countries: tally(countries),
      teams: { upsert: teams.length },
      venues: tally(venues),
      referees: tally(referees),
      players: playerSummary,
      squadPlayers: { upsert: staged.players.length },
      matches: { upsert: staged.matches.length },
      goals: { upsert: staged.goals.length },
      shootoutKicks: { upsert: staged.shootoutKicks.length },
      awards: { upsert: staged.awards.length },
    },
  };
}

/** Slugs a plan would newly claim — checked against the DB before planning. */
export function candidatePlayerSlugs(staged: StagedBundle): string[] {
  return [...new Set(staged.players.map((p) => slugify(p.name)))];
}
