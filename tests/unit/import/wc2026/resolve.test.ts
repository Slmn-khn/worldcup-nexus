// Identity resolution, target classification, approval gate and the official
// overwrite guard — pure functions, no database.

import { describe, expect, it } from "vitest";

import { checkApproval } from "../../../../src/server/import/wc2026/approval";
import { canonicalJson, officialDiff } from "../../../../src/server/import/wc2026/load";
import {
  isTruncatedName,
  namesCompatible,
  resolvePlayer,
  resolveReferee,
  resolveVenue,
  type PlayerSnap,
} from "../../../../src/server/import/wc2026/resolve";
import { foldName, venueCommonName, type StagedPlayer } from "../../../../src/server/import/wc2026/stage";
import { classifyTarget } from "../../../../src/server/import/wc2026/target";

const player = (overrides: Partial<StagedPlayer>): StagedPlayer => ({
  srcId: 1,
  teamSrcId: 1,
  name: "Lionel Andrés Messi",
  candidateName: "Lionel Andrés Messi",
  officialName: null,
  position: "FW",
  dateOfBirth: "1987-06-24",
  shirtNumber: null,
  ...overrides,
});

const snap = (overrides: Partial<PlayerSnap>): PlayerSnap => ({
  id: "p1",
  sourceId: "P-14758",
  name: "Lionel Messi",
  slug: "lionel-messi",
  dateOfBirth: "1987-06-24",
  countryId: "arg",
  ...overrides,
});

describe("name normalisation", () => {
  it("folds accents for matching while display names keep them", () => {
    expect(foldName("Kylian Mbappé")).toBe("kylian mbappe");
    expect(foldName("Slavko Vinčić")).toBe("slavko vincic");
    expect(foldName("Martin Ødegaard")).toBe("martin odegaard");
  });

  it("detects truncated source names and allows prefix matches only for them", () => {
    expect(isTruncatedName("Mc")).toBe(true);
    expect(isTruncatedName("Rodri")).toBe(false);
    expect(namesCompatible("Mc", "Weston McKennie")).toBe(true);
    expect(namesCompatible("Rod", "Rodri")).toBe(false);
    expect(namesCompatible("Minjae Kim", "Kim Min-jae")).toBe(true);
  });

  it("extracts the common stadium name", () => {
    expect(venueCommonName("Mexico City Stadium (Estadio Azteca)")).toBe("Estadio Azteca");
    expect(venueCommonName("Lusail Stadium")).toBe("Lusail Stadium");
  });
});

describe("resolvePlayer", () => {
  it("links to an existing canonical player by DOB + country + name tokens", () => {
    const result = resolvePlayer(player({}), "arg", "Argentina", { players: [snap({})] }, {});
    expect(result).toEqual({ kind: "linked", playerId: "p1", method: "dob+country+name", canonicalName: "Lionel Messi" });
  });

  it("does not merge on name alone (different DOB → new player)", () => {
    const result = resolvePlayer(player({ dateOfBirth: "2000-01-01" }), "arg", "Argentina", { players: [snap({})] }, {});
    expect(result.kind).toBe("new");
  });

  it("does not merge across countries (reports a possible match instead)", () => {
    const result = resolvePlayer(player({}), "esp", "Spain", { players: [snap({ name: "Lionel Andres Messi" })] }, {});
    expect(result).toMatchObject({ kind: "new", possibleMatches: ["lionel-messi"] });
  });

  it("refuses to guess between two compatible candidates", () => {
    const result = resolvePlayer(player({}), "arg", "Argentina", { players: [snap({}), snap({ id: "p2", slug: "lionel-messi-2", sourceId: "P-2" })] }, {});
    expect(result.kind).toBe("conflict");
  });

  it("prefers its own 2026 sourceId so re-runs are idempotent", () => {
    const result = resolvePlayer(player({ srcId: 7 }), "arg", "Argentina", { players: [snap({ id: "own", sourceId: "mominul2026:player:7" }), snap({})] }, {});
    expect(result).toEqual({ kind: "existing2026", playerId: "own", method: "sourceId" });
  });

  it("names unresolvable truncated players honestly instead of inventing a name", () => {
    const result = resolvePlayer(player({ srcId: 290, name: "Mc", candidateName: "Mc", dateOfBirth: "1996-12-08" }), "sco", "Scotland", { players: [] }, {});
    expect(result).toEqual({ kind: "new", name: "Unidentified Scotland player (source #290)", nameIncomplete: true, possibleMatches: [] });
  });

  it("applies a reviewed override with evidence", () => {
    const result = resolvePlayer(
      player({ srcId: 290, name: "Mc", candidateName: "Mc" }),
      "sco",
      "Scotland",
      { players: [] },
      { players: { "290": { displayName: "Reviewed Name", evidenceUrl: "https://example.org/report", reviewedBy: "owner" } } },
    );
    expect(result).toMatchObject({ kind: "new", name: "Reviewed Name", nameIncomplete: false });
  });
});

describe("resolveVenue / resolveReferee", () => {
  const venue = { srcId: 1, name: "Estadio Azteca", tournamentName: "Mexico City Stadium (Estadio Azteca)", city: "Mexico City", country: "Mexico", capacity: 80824, latitude: null, longitude: null };

  it("links a stadium only when name, city and country all agree", () => {
    const stadiums = [{ id: "s1", sourceId: "S-132", name: "Estadio Azteca", slug: "estadio-azteca-mexico-city", city: "Mexico City", country: "Mexico" }];
    expect(resolveVenue(venue, stadiums)).toEqual({ kind: "existing", stadiumId: "s1" });
    expect(resolveVenue({ ...venue, city: "Zapopan" }, stadiums)).toEqual({ kind: "new" });
  });

  it("links a referee by full folded name and reports a changed country", () => {
    const refs = [{ id: "r1", sourceId: "R-147", name: "Alireza Faghani", slug: "alireza-faghani", country: "Iran" }];
    expect(resolveReferee({ srcId: 14, name: "Alireza Faghani", country: "Australia" }, refs)).toEqual({ kind: "existing", refereeId: "r1", countryDiffers: "Iran → Australia" });
  });
});

describe("classifyTarget", () => {
  it("treats only explicit local hosts as LOCAL and never echoes credentials", () => {
    const local = classifyTarget("postgresql://user:secret@localhost:5432/worldcup_atlas");
    expect(local.kind).toBe("LOCAL");
    expect(local.redacted).toBe("postgresql://***@localhost:5432/worldcup_atlas");
    expect(JSON.stringify(local)).not.toContain("secret");
  });

  it("treats managed hosts and production signals as PRODUCTION", () => {
    expect(classifyTarget("postgresql://u:p@aws-1-x.pooler.supabase.com:5432/postgres").kind).toBe("PRODUCTION");
    expect(classifyTarget("postgresql://u:p@localhost:5432/db", { NODE_ENV: "production" }).kind).toBe("PRODUCTION");
    expect(classifyTarget("postgresql://u:p@db.internal:5432/db").kind).toBe("STAGING");
  });
});

describe("checkApproval", () => {
  const manifest = "a".repeat(64);
  const report = "b".repeat(64);
  const approval = {
    approvedBy: "owner",
    approvedAt: "2026-10-11T06:30:00Z",
    dataPackVersion: "v1",
    validationReportHash: `sha256:${report}`,
    bundleManifestHash: `sha256:${manifest}`,
    approvedForImport: true,
    scope: "LOCAL",
  };
  const expected = { manifestSha256: manifest, validationReportSha256: report, target: "LOCAL" as const };

  it("accepts an approval pinned to this snapshot and target", () => {
    expect(checkApproval(approval, expected).ok).toBe(true);
  });

  it("refuses a missing file, other snapshots, unapproved packs and wider targets", () => {
    expect(checkApproval(null, expected).ok).toBe(false);
    expect(checkApproval({ ...approval, bundleManifestHash: `sha256:${"c".repeat(64)}` }, expected).ok).toBe(false);
    expect(checkApproval({ ...approval, approvedForImport: false }, expected).ok).toBe(false);
    expect(checkApproval(approval, { ...expected, target: "PRODUCTION" })).toEqual({ ok: false, reason: "approval scope LOCAL does not cover a PRODUCTION target" });
  });
});

describe("official overwrite guard", () => {
  it("ignores JSON key order (Postgres JSONB reorders keys)", () => {
    expect(canonicalJson({ b: 1, a: { d: 2, c: 3 } })).toBe(canonicalJson({ a: { c: 3, d: 2 }, b: 1 }));
    expect(officialDiff({ details: { minutes: 769, goals: 10 } }, { details: { goals: 10, minutes: 769 } })).toEqual([]);
  });

  it("reports a real change field by field", () => {
    expect(officialDiff({ attendance: 6810966 }, { attendance: 6810000 })).toEqual(["attendance: 6810966 → 6810000"]);
  });
});
