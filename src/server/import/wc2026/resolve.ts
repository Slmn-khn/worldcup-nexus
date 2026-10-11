// Resolve step: map staged 2026 entities onto canonical identities. The
// matching rules are pure functions over DB snapshots (unit-tested); the
// snapshot loader is the only part that reads the database.
//
// Rules (never by display name alone):
//   countries — reviewed FIFA-code table (constants.ts), slug lookup
//   players   — own sourceId → human override → DOB + country + name tokens
//   stadiums  — common name + city + country must all agree
//   referees  — accent-folded full name, unique match only
// Anything ambiguous becomes a conflict; conflicts block writes.

import type { PrismaClient } from "../../../generated/prisma/client";
import { CANDIDATE_NS, sourceIdFor } from "./constants";
import { foldName, nameTokens, type StagedBundle, type StagedPlayer } from "./stage";

// --- snapshot types ---------------------------------------------------------

export type CountrySnap = { id: string; slug: string; name: string; code: string | null; sourceId: string | null };
export type PlayerSnap = {
  id: string;
  sourceId: string | null;
  name: string;
  slug: string;
  dateOfBirth: string | null;
  countryId: string | null;
};
export type StadiumSnap = { id: string; sourceId: string | null; name: string; slug: string; city: string | null; country: string | null };
export type RefereeSnap = { id: string; sourceId: string | null; name: string; slug: string; country: string | null };

export type DbSnapshot = {
  countries: CountrySnap[];
  /** Canonical players sharing a DOB with a candidate, plus all 2026-namespace players. */
  players: PlayerSnap[];
  /** Existing player slugs that collide with a planned new slug. */
  takenPlayerSlugs: Set<string>;
  stadiums: StadiumSnap[];
  referees: RefereeSnap[];
  tournament2026: { id: string; sourceId: string | null } | null;
};

export type IdentityOverrides = {
  /** candidate player id → reviewed decision with evidence. */
  players?: Record<
    string,
    { canonicalPlayerSlug?: string; displayName?: string; evidenceUrl: string; reviewedBy: string }
  >;
};

// --- pure matching ----------------------------------------------------------

export type PlayerResolution =
  | { kind: "existing2026"; playerId: string; method: "sourceId" }
  | { kind: "linked"; playerId: string; method: "override" | "dob+country+name"; canonicalName: string }
  | { kind: "new"; name: string; nameIncomplete: boolean; possibleMatches: string[] }
  | { kind: "conflict"; reason: string };

/** "Mc", "Jr" … — a single token of ≤2 letters cannot identify a player. */
export function isTruncatedName(name: string): boolean {
  const folded = foldName(name);
  return folded.length < 3 || (!folded.includes(" ") && folded.length <= 2);
}

/** Shared token, or (for truncated source names) a ≥2-char prefix of a token. */
export function namesCompatible(candidate: string, canonical: string): boolean {
  const left = nameTokens(candidate);
  const right = nameTokens(canonical);
  for (const token of left) {
    if (right.has(token)) return true;
    if (isTruncatedName(candidate)) {
      for (const other of right) if (token.length >= 2 && other.startsWith(token)) return true;
    }
  }
  return false;
}

export function resolvePlayer(
  player: StagedPlayer,
  countryId: string | null,
  countryName: string,
  snapshot: Pick<DbSnapshot, "players">,
  overrides: IdentityOverrides,
): PlayerResolution {
  const own = snapshot.players.find((p) => p.sourceId === sourceIdFor.player(player.srcId));
  if (own !== undefined) return { kind: "existing2026", playerId: own.id, method: "sourceId" };

  const override = overrides.players?.[String(player.srcId)];
  if (override?.canonicalPlayerSlug !== undefined) {
    const target = snapshot.players.find((p) => p.slug === override.canonicalPlayerSlug);
    if (target === undefined) return { kind: "conflict", reason: `override slug ${override.canonicalPlayerSlug} not found` };
    return { kind: "linked", playerId: target.id, method: "override", canonicalName: target.name };
  }

  const canonical = snapshot.players.filter((p) => !(p.sourceId ?? "").startsWith(`${CANDIDATE_NS}:`));
  if (player.dateOfBirth !== null) {
    const sameDob = canonical.filter((p) => p.dateOfBirth === player.dateOfBirth);
    const sameCountry = sameDob.filter((p) => p.countryId !== null && p.countryId === countryId);
    const compatible = sameCountry.filter((p) => namesCompatible(player.candidateName, p.name) || (player.officialName !== null && namesCompatible(player.officialName, p.name)));
    if (compatible.length === 1) {
      return { kind: "linked", playerId: compatible[0]!.id, method: "dob+country+name", canonicalName: compatible[0]!.name };
    }
    if (compatible.length > 1) {
      return { kind: "conflict", reason: `ambiguous: ${compatible.map((p) => p.slug).join(", ")} share DOB, country and name tokens` };
    }
    // Same DOB elsewhere with ≥2 shared name tokens: report (possible change of
    // nationality) but do not merge automatically.
    const possible = sameDob
      .filter((p) => !sameCountry.includes(p))
      .filter((p) => {
        let shared = 0;
        const tokens = nameTokens(p.name);
        for (const t of nameTokens(player.candidateName)) if (tokens.has(t)) shared += 1;
        return shared >= 2;
      })
      .map((p) => p.slug);
    const truncated = isTruncatedName(player.name);
    const name =
      override?.displayName ??
      (truncated ? `Unidentified ${countryName} player (source #${player.srcId})` : player.name);
    return { kind: "new", name, nameIncomplete: truncated && override?.displayName === undefined, possibleMatches: possible };
  }
  const truncated = isTruncatedName(player.name);
  return {
    kind: "new",
    name: override?.displayName ?? (truncated ? `Unidentified ${countryName} player (source #${player.srcId})` : player.name),
    nameIncomplete: truncated && override?.displayName === undefined,
    possibleMatches: [],
  };
}

export type VenueResolution = { kind: "existing" | "existing2026"; stadiumId: string } | { kind: "new" } | { kind: "conflict"; reason: string };

export function resolveVenue(
  venue: StagedBundle["venues"][number],
  stadiums: StadiumSnap[],
): VenueResolution {
  const own = stadiums.find((s) => s.sourceId === sourceIdFor.venue(venue.srcId));
  if (own !== undefined) return { kind: "existing2026", stadiumId: own.id };
  const matches = stadiums.filter(
    (s) =>
      !(s.sourceId ?? "").startsWith(`${CANDIDATE_NS}:`) &&
      foldName(s.name) === foldName(venue.name) &&
      s.city !== null &&
      foldName(s.city) === foldName(venue.city) &&
      s.country === venue.country,
  );
  if (matches.length === 1) return { kind: "existing", stadiumId: matches[0]!.id };
  if (matches.length > 1) return { kind: "conflict", reason: `ambiguous stadium ${venue.name}` };
  return { kind: "new" };
}

export type RefereeResolution = { kind: "existing" | "existing2026"; refereeId: string; countryDiffers?: string } | { kind: "new" };

export function resolveReferee(referee: StagedBundle["referees"][number], referees: RefereeSnap[]): RefereeResolution {
  const own = referees.find((r) => r.sourceId === sourceIdFor.referee(referee.srcId));
  if (own !== undefined) return { kind: "existing2026", refereeId: own.id };
  const matches = referees.filter(
    (r) => !(r.sourceId ?? "").startsWith(`${CANDIDATE_NS}:`) && foldName(r.name) === foldName(referee.name),
  );
  if (matches.length === 1) {
    const match = matches[0]!;
    return {
      kind: "existing",
      refereeId: match.id,
      ...(match.country !== null && match.country !== referee.country ? { countryDiffers: `${match.country} → ${referee.country}` } : {}),
    };
  }
  return { kind: "new" };
}

// --- snapshot loader (read-only) -------------------------------------------

export async function loadSnapshot(
  prisma: PrismaClient,
  staged: StagedBundle,
  overrideSlugs: string[] = [],
): Promise<DbSnapshot> {
  const dobs = [...new Set(staged.players.map((p) => p.dateOfBirth).filter((d): d is string => d !== null))];
  const [countries, players, stadiums, referees, tournament2026] = await Promise.all([
    prisma.country.findMany({ select: { id: true, slug: true, name: true, code: true, sourceId: true } }),
    prisma.player.findMany({
      where: {
        OR: [
          { dateOfBirth: { in: dobs.map((d) => new Date(`${d}T00:00:00.000Z`)) } },
          { sourceId: { startsWith: `${CANDIDATE_NS}:player:` } },
          ...(overrideSlugs.length > 0 ? [{ slug: { in: overrideSlugs } }] : []),
        ],
      },
      select: { id: true, sourceId: true, name: true, slug: true, dateOfBirth: true, countryId: true },
    }),
    prisma.stadium.findMany({ select: { id: true, sourceId: true, name: true, slug: true, city: true, country: true } }),
    prisma.referee.findMany({ select: { id: true, sourceId: true, name: true, slug: true, country: true } }),
    prisma.tournament.findUnique({ where: { year: 2026 }, select: { id: true, sourceId: true } }),
  ]);
  return {
    countries,
    players: players.map((p) => ({ ...p, dateOfBirth: p.dateOfBirth?.toISOString().slice(0, 10) ?? null })),
    takenPlayerSlugs: new Set(),
    stadiums,
    referees,
    tournament2026,
  };
}

/** Which of `slugs` already exist on Player rows (for collision suffixing). */
export async function findTakenPlayerSlugs(prisma: PrismaClient, slugs: string[]): Promise<Set<string>> {
  const rows = await prisma.player.findMany({ where: { slug: { in: slugs } }, select: { slug: true } });
  return new Set(rows.map((r) => r.slug));
}
