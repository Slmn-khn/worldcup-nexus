// End-to-end import tests against the disposable *_it database (see
// scripts/test/setup-integration-db.ts). Steps run in order and share state:
// seed a small historical archive → dry-run → interrupted write → resume →
// idempotent re-run → conflicting official snapshot → production guard.

import "dotenv/config";

import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PrismaClient } from "../../src/generated/prisma/client";
import { loadBundle } from "../../src/server/import/wc2026/bundle";
import { COUNTRY_BY_FIFA_CODE } from "../../src/server/import/wc2026/constants";
import { runWc2026Import, type RunOptions } from "../../src/server/import/wc2026/run";
import { historicalFingerprint } from "../../src/server/import/wc2026/verify";
import { integrationDatabaseUrl } from "../../scripts/test/integrationDb";

const BUNDLE_DIR = "docs/worldcupnexus_2026_data";
const IT_URL = integrationDatabaseUrl();

let prisma: PrismaClient;
let approvalFile: string;
let prodApprovalFile: string;
let overridesFile: string;

const options = (overrides: Partial<RunOptions> = {}): RunOptions => ({
  mode: "write",
  bundleDir: BUNDLE_DIR,
  approvalFile,
  overridesFile,
  databaseUrl: IT_URL,
  env: {},
  batchSize: 50,
  ...overrides,
});

async function counts() {
  return {
    tournaments: await prisma.tournament.count(),
    countries: await prisma.country.count(),
    teams: await prisma.team.count(),
    players: await prisma.player.count(),
    stadiums: await prisma.stadium.count(),
    referees: await prisma.referee.count(),
    matches: await prisma.match.count(),
    squads: await prisma.squadPlayer.count(),
    goals: await prisma.goal.count(),
    kicks: await prisma.penaltyKick.count(),
    awards: await prisma.award.count(),
    raw: await prisma.rawSourceRecord.count(),
  };
}

/** Minimal canonical archive: every mapped country, a 2022 tournament, and
 *  pre-existing people/venues the import must LINK rather than duplicate. */
async function seedHistoricalArchive() {
  const titleCase = (slug: string) => slug.split("-").map((w) => w[0]!.toUpperCase() + w.slice(1)).join(" ");
  const countryIds = new Map<string, string>();
  for (const { resolution } of Object.values(COUNTRY_BY_FIFA_CODE)) {
    if (resolution.kind !== "existing" || countryIds.has(resolution.slug)) continue;
    const country = await prisma.country.create({
      data: { sourceId: `T-${resolution.slug}`, name: titleCase(resolution.slug), slug: resolution.slug, code: resolution.slug.slice(0, 3).toUpperCase() },
    });
    countryIds.set(resolution.slug, country.id);
  }
  const t2022 = await prisma.tournament.create({ data: { sourceId: "WC-2022", year: 2022, name: "2022 FIFA Men's World Cup", slug: "2022", hostName: "Qatar", teamsCount: 2, matchesCount: 1, goalsCount: 3 } });
  const arg = await prisma.team.create({ data: { sourceId: "WC-2022:T-03", tournamentId: t2022.id, countryId: countryIds.get("argentina")!, name: "Argentina", slug: "argentina", code: "ARG" } });
  const fra = await prisma.team.create({ data: { sourceId: "WC-2022:T-30", tournamentId: t2022.id, countryId: countryIds.get("france")!, name: "France", slug: "france", code: "FRA" } });
  const messi = await prisma.player.create({ data: { sourceId: "P-14758", name: "Lionel Messi", slug: "lionel-messi", countryId: countryIds.get("argentina")!, dateOfBirth: new Date("1987-06-24T00:00:00Z") } });
  await prisma.player.create({ data: { sourceId: "P-64077", name: "Kylian Mbappé", slug: "kylian-mbappe", countryId: countryIds.get("france")!, dateOfBirth: new Date("1998-12-20T00:00:00Z") } });
  await prisma.player.create({ data: { sourceId: "P-62341", name: "Rodri", slug: "rodri", countryId: countryIds.get("spain")!, dateOfBirth: new Date("1996-06-22T00:00:00Z") } });
  const lusail = await prisma.stadium.create({ data: { sourceId: "S-147", name: "Lusail Stadium", slug: "lusail-stadium-lusail", city: "Lusail", country: "Qatar" } });
  await prisma.stadium.create({ data: { sourceId: "S-132", name: "Estadio Azteca", slug: "estadio-azteca-mexico-city", city: "Mexico City", country: "Mexico" } });
  await prisma.referee.create({ data: { sourceId: "R-147", name: "Alireza Faghani", slug: "alireza-faghani", country: "Iran" } });
  const final = await prisma.match.create({
    data: { sourceId: "M-2022-64", tournamentId: t2022.id, homeTeamId: arg.id, awayTeamId: fra.id, winningTeamId: arg.id, slug: "m-2022-64-argentina-vs-france", stage: "final", homeScore: 3, awayScore: 3, homeScorePenalties: 4, awayScorePenalties: 2, decidedByPenalties: true, stadiumId: lusail.id },
  });
  await prisma.goal.create({ data: { sourceId: "G-1", matchId: final.id, teamId: arg.id, playerId: messi.id, minute: 23, isPenalty: true } });
  await prisma.booking.create({ data: { sourceId: "B-1", matchId: final.id, teamId: arg.id, playerId: messi.id, cardType: "YELLOW", minute: 90 } });
}

beforeAll(async () => {
  prisma = new PrismaClient({ adapter: new PrismaPg(IT_URL) });
  const bundle = await loadBundle(BUNDLE_DIR);
  const dir = await mkdtemp(path.join(os.tmpdir(), "wc2026-it-"));
  const approval = {
    approvedBy: "integration test",
    approvedAt: "2026-10-11T00:00:00Z",
    dataPackVersion: "test",
    validationReportHash: `sha256:${bundle.validationReportSha256}`,
    bundleManifestHash: `sha256:${bundle.manifestSha256}`,
    approvedForImport: true,
  };
  approvalFile = path.join(dir, "approval.json");
  prodApprovalFile = path.join(dir, "approval-prod.json");
  overridesFile = path.join(dir, "overrides-missing.json");
  await writeFile(approvalFile, JSON.stringify({ ...approval, scope: "LOCAL" }));
  await writeFile(prodApprovalFile, JSON.stringify({ ...approval, scope: "PRODUCTION" }));
  await seedHistoricalArchive();
});

afterAll(async () => {
  await prisma?.$disconnect();
});

describe("canonical 2026 import (integration)", () => {
  let baseline: Awaited<ReturnType<typeof historicalFingerprint>>;

  it("dry-run is read-only and plans links to existing people and venues", async () => {
    baseline = await historicalFingerprint(prisma);
    const before = await counts();
    const report = await runWc2026Import(prisma, options({ mode: "dry-run" }));
    expect(report.ok).toBe(true);
    expect(report.plan?.conflicts).toEqual([]);
    expect(report.plan?.summary.players).toMatchObject({ "link:dob+country+name": 3 });
    expect(report.plan?.summary.venues).toMatchObject({ link: 1 });
    expect(await counts()).toEqual(before);
    expect(await prisma.dataImportRun.count()).toBe(0);
  });

  it("refuses to write without an approval for this snapshot", async () => {
    const report = await runWc2026Import(prisma, options({ approvalFile: path.join(os.tmpdir(), "does-not-exist.json") }));
    expect(report.refusedBy).toBe("approval");
    expect(await prisma.tournament.count({ where: { year: 2026 } })).toBe(0);
  });

  it("an interrupted write reports what committed and what remains", async () => {
    const report = await runWc2026Import(prisma, options({ simulateFailureAt: { entity: "players", rows: 300 } }));
    expect(report.ok).toBe(false);
    expect(report.refusedBy).toBe("load");
    expect(report.errors.join(" ")).toMatch(/PARTIAL, not atomic/);
    const run = await prisma.dataImportRun.findFirstOrThrow({ orderBy: { startedAt: "desc" } });
    expect(run.status).toBe("FAILED_SIMULATED");
    expect(await prisma.match.count({ where: { tournament: { year: 2026 } } })).toBe(0);
  });

  it("resume continues from the checkpoint and verifies every invariant", async () => {
    const report = await runWc2026Import(prisma, options({ mode: "resume" }));
    expect(report.errors).toEqual([]);
    expect(report.ok).toBe(true);
    expect(report.load?.counts.players?.skippedByCheckpoint).toBe(300);
    expect(report.load?.counts.teams?.written).toBe(0);
    const failing = report.verification?.checks.filter((c) => c.status === "FAIL");
    expect(failing).toEqual([]);
    expect(report.verification?.checks.find((c) => c.id === "knockout-outcomes")?.status).toBe("KNOWN_CONFLICT");
    expect(report.verification?.checks.find((c) => c.id === "historical-unchanged")?.status).toBe("PASS");
  });

  it("links award winners to pre-existing canonical profiles without duplicates", async () => {
    const rodri = await prisma.player.findMany({ where: { dateOfBirth: new Date("1996-06-22T00:00:00Z"), name: { contains: "Rodri" } } });
    expect(rodri).toHaveLength(1);
    const goldenBall = await prisma.award.findFirstOrThrow({ where: { name: "Golden Ball", tournament: { year: 2026 } } });
    expect(goldenBall.playerId).toBe(rodri[0]!.id);
    const squads = await prisma.squadPlayer.count({ where: { playerId: rodri[0]!.id } });
    expect(squads).toBe(1);
  });

  it("re-running the same snapshot converges with zero duplicates", async () => {
    const before = await counts();
    const report = await runWc2026Import(prisma, options());
    expect(report.ok).toBe(true);
    expect(report.errors).toEqual([]);
    expect(await counts()).toEqual(before);
  });

  it("never silently overwrites official data that changed in the database", async () => {
    await prisma.tournament.update({ where: { year: 2026 }, data: { attendance: 123 } });
    const report = await runWc2026Import(prisma, options());
    expect(report.errors.join(" ")).toMatch(/official fields differ.*attendance: 123 → 6810966/);
    expect((await prisma.tournament.findUniqueOrThrow({ where: { year: 2026 } })).attendance).toBe(123);
    const accepted = await runWc2026Import(prisma, options({ acceptOfficialChanges: true }));
    expect(accepted.ok).toBe(true);
    expect((await prisma.tournament.findUniqueOrThrow({ where: { year: 2026 } })).attendance).toBe(6810966);
  });

  it("leaves older tournaments untouched", async () => {
    expect(await historicalFingerprint(prisma)).toEqual(baseline);
    const t2022 = await prisma.tournament.findUniqueOrThrow({ where: { year: 2022 }, include: { _count: { select: { matches: true, teams: true } } } });
    expect(t2022._count).toEqual({ matches: 1, teams: 2 });
    expect(await prisma.booking.count()).toBe(1);
  });

  it("refuses production targets without a production approval and explicit confirmation", async () => {
    const prodUrl = "postgresql://user:secret@aws-0-eu.pooler.supabase.com:5432/postgres";
    const local = await runWc2026Import(prisma, options({ databaseUrl: prodUrl }));
    expect(local.refusedBy).toBe("approval");
    expect(JSON.stringify(local)).not.toContain("secret");
    const unconfirmed = await runWc2026Import(prisma, options({ databaseUrl: prodUrl, approvalFile: prodApprovalFile }));
    expect(unconfirmed.refusedBy).toBe("production");
  });
});
