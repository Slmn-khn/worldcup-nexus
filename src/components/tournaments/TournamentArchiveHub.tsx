// Archive hub for canonical tournaments with group-labelled matches
// (/tournaments/2026 after the canonical promotion; any future edition
// imported the same way). Champion hero, verified headline numbers, groups
// A–L, a Round-of-32-first bracket, matches, teams, venues, squads, official
// awards and event-derived leaders — all from the canonical query layer.
// Data the archive does not hold is labelled "not recorded", never zero.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import PageContainer from "@/components/layout/PageContainer";
import SectionHeading from "@/components/ui/SectionHeading";
import EmptyState from "@/components/ui/EmptyState";
import VaultEyebrow from "@/components/vault/VaultEyebrow";
import VaultButton from "@/components/vault/VaultButton";
import CountryFlag from "@/components/media/CountryFlag";
import HostMapHeroBackdrop from "@/components/maps/hostMap/HostMapHeroBackdrop";
import ArchiveMatchRows from "./archive/ArchiveMatchRows";
import ArchiveGroupTables from "./archive/ArchiveGroupTables";
import ArchiveBracket from "./archive/ArchiveBracket";
import ArchiveAwards from "./archive/ArchiveAwards";
import { atlas, eyebrowSx, tabularNums } from "@/theme/tokens";
import { formatNumber } from "@/lib/format";
import { getStringParam, type RawSearchParams } from "@/lib/search-params";
import { formatArchiveScore } from "@/server/queries/tournamentArchiveModel";
import {
  searchTournamentSquads,
  type ArchiveLeader,
  type ArchiveTeamRef,
  type TournamentArchive,
} from "@/server/queries/tournamentArchive";

const SECTION_SX = { py: { xs: 4, md: 5 }, scrollMarginTop: 96 } as const;

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "groups", label: "Groups" },
  { id: "bracket", label: "Bracket" },
  { id: "matches", label: "Matches" },
  { id: "teams", label: "Teams" },
  { id: "players", label: "Players" },
  { id: "venues", label: "Venues" },
  { id: "awards", label: "Awards" },
  { id: "stats", label: "Stats" },
];

function formatDay(iso: string | null): string | null {
  if (iso === null) return null;
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function StatCell({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <Box sx={{ border: `1px solid ${accent ? atlas.goldBorder : atlas.border}`, bgcolor: atlas.surfaceSoft, px: 2.5, py: 2 }}>
      <Typography component="p" sx={{ ...tabularNums, fontFamily: atlas.fontDisplay, fontWeight: 900, fontSize: "1.6rem", color: accent ? atlas.gold : atlas.textPrimary, lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography component="p" sx={{ ...eyebrowSx, fontSize: "0.62rem", color: atlas.textMuted, mt: 0.75 }}>
        {label}
      </Typography>
    </Box>
  );
}

function TeamName({ team, strong = false }: { team: ArchiveTeamRef; strong?: boolean }) {
  const sx = { color: atlas.bodyStrong, fontSize: "0.95rem", fontWeight: strong ? 800 : 500, textDecoration: "none", "&:hover": { color: atlas.goldStrong } };
  return team.countrySlug !== null ? (
    <Box component={Link} href={`/countries/${team.countrySlug}`} sx={sx}>{team.name}</Box>
  ) : (
    <Typography component="span" sx={sx}>{team.name}</Typography>
  );
}

function PodiumLine({ label, team }: { label: string; team: ArchiveTeamRef | null }) {
  if (team === null) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
      <Typography component="span" sx={{ ...eyebrowSx, fontSize: "0.6rem", color: atlas.textMuted, width: 92 }}>{label}</Typography>
      <CountryFlag code={team.code} name={team.name} slug={team.countrySlug} size="xs" />
      <TeamName team={team} strong={label === "Champion"} />
    </Box>
  );
}

function LeaderList({ title, leaders, valueLabel, secondaryLabel }: { title: string; leaders: ArchiveLeader[]; valueLabel: string; secondaryLabel: string }) {
  return (
    <Box sx={{ border: `1px solid ${atlas.border}`, bgcolor: atlas.surfaceSoft, p: 2.5 }}>
      <Typography component="h3" sx={{ ...eyebrowSx, fontSize: "0.66rem", color: atlas.gold, mb: 2 }}>{title}</Typography>
      {leaders.length === 0 ? (
        <Typography variant="body2" sx={{ color: atlas.textMuted }}>Not recorded in the archive.</Typography>
      ) : (
        <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0 }}>
          {leaders.map((leader, index) => (
            <Box component="li" key={leader.player.slug} sx={{ borderTop: index > 0 ? `1px solid ${atlas.border}` : "none" }}>
              <Box component={Link} href={`/players/${leader.player.slug}`} sx={{ display: "flex", alignItems: "center", gap: 1.25, py: 0.9, textDecoration: "none", "&:hover span:nth-of-type(2)": { color: atlas.goldStrong } }}>
                <Typography component="span" sx={{ ...tabularNums, fontSize: "0.72rem", color: atlas.textMuted, width: 20 }}>{index + 1}</Typography>
                <CountryFlag code={leader.team?.code ?? null} name={leader.team?.name ?? null} slug={leader.team?.countrySlug ?? null} size="xs" />
                <Typography component="span" sx={{ color: atlas.bodyStrong, fontSize: "0.88rem", flexGrow: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{leader.player.name}</Typography>
                <Typography component="span" sx={{ ...tabularNums, fontFamily: atlas.fontDisplay, fontWeight: 900, color: atlas.textPrimary }}>
                  {leader.value}
                  {leader.secondary > 0 ? (
                    <Typography component="span" sx={{ fontSize: "0.68rem", color: atlas.textMuted, ml: 0.5 }}>({leader.secondary} {secondaryLabel})</Typography>
                  ) : null}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
      <Typography component="p" sx={{ ...eyebrowSx, fontSize: "0.55rem", color: atlas.textMuted, mt: 1.5 }}>{valueLabel}</Typography>
    </Box>
  );
}

export default async function TournamentArchiveHub({ archive, rawParams }: { archive: TournamentArchive; rawParams: RawSearchParams }) {
  const playerQuery = getStringParam(rawParams, "pq", 60);
  const squad = await searchTournamentSquads(archive.year, playerQuery, 48);
  const champion = archive.podium.champion;
  const championPath = champion === null ? [] : archive.matches.filter((m) => m.homeTeam.id === champion.id || m.awayTeam.id === champion.id);
  const knockoutStart = archive.bracket.rounds[0]?.label ?? null;
  const groupLetters = archive.groups.map((g) => g.letter);
  const awardSource = archive.awards.find((a) => a.sourceUrl !== null)?.sourceUrl ?? null;
  const notRecorded = [
    archive.coverage.substitutions === 0 ? "substitutions" : null,
    archive.coverage.bookings === 0 ? "yellow/red cards" : null,
    "minutes played",
    "expected goals (xG)",
  ].filter((v): v is string => v !== null);

  return (
    <Box>
      {/* Hero */}
      <Box component="header" sx={{ borderBottom: `1px solid ${atlas.border}`, bgcolor: atlas.black, position: "relative", overflow: "hidden", isolation: "isolate" }}>
        <HostMapHeroBackdrop year={archive.year} hosts={archive.hostCountries} />
        <PageContainer sx={{ py: { xs: 7, md: 10 }, position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 2.5 }}>
            <VaultEyebrow label={archive.hosts.length > 1 ? "Co-hosts" : "Host"} />
            {archive.hosts.map((host) => (
              <Box key={host} sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                <CountryFlag name={host} size="xs" />
                <Typography component="span" sx={{ color: atlas.textSecondary, fontSize: "0.85rem" }}>{host}</Typography>
              </Box>
            ))}
          </Box>
          <Typography variant="h1" sx={{ fontSize: { xs: "3rem", sm: "3.6rem", md: "4.6rem" }, mb: 2 }}>
            {archive.year} World Cup
          </Typography>
          <Typography variant="body1" sx={{ color: atlas.textSecondary, maxWidth: 680, mb: 3 }}>
            {formatDay(archive.startDate) ?? "—"} – {formatDay(archive.endDate) ?? "—"}.{" "}
            {archive.counts.teams} teams in {groupLetters.length} groups
            {knockoutStart !== null ? `, then a knockout stage from the ${knockoutStart}` : ""}.
          </Typography>
          {champion !== null && archive.finalMatch !== null ? (
            <Box sx={{ border: `1px solid ${atlas.goldBorder}`, bgcolor: atlas.goldTint, px: { xs: 2, md: 3 }, py: 2, mb: 3, display: "inline-flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              <CountryFlag code={champion.code} name={champion.name} slug={champion.countrySlug} size="md" />
              <Box>
                <Typography component="p" sx={{ ...eyebrowSx, fontSize: "0.6rem", color: atlas.gold }}>Champion</Typography>
                <Typography component="p" sx={{ fontFamily: atlas.fontDisplay, fontWeight: 900, fontSize: { xs: "1.25rem", md: "1.5rem" }, color: atlas.textPrimary }}>
                  {archive.finalMatch.homeTeam.name} {formatArchiveScore(archive.finalMatch)} {archive.finalMatch.awayTeam.name}
                </Typography>
              </Box>
            </Box>
          ) : null}
          <Box sx={{ display: "grid", gap: 1 }}>
            <PodiumLine label="Champion" team={archive.podium.champion} />
            <PodiumLine label="Runner-up" team={archive.podium.runnerUp} />
            <PodiumLine label="Third" team={archive.podium.third} />
            <PodiumLine label="Fourth" team={archive.podium.fourth} />
          </Box>
        </PageContainer>
      </Box>

      {/* Headline numbers */}
      <PageContainer component="section" aria-label="Tournament in numbers" sx={{ pt: { xs: 4, md: 5 } }}>
        <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", sm: "repeat(3, minmax(0,1fr))", lg: "repeat(6, minmax(0,1fr))" } }}>
          <StatCell label="Teams" value={formatNumber(archive.counts.teams)} />
          <StatCell label="Matches" value={formatNumber(archive.counts.matches)} />
          <StatCell label="Goals" value={formatNumber(archive.counts.goals)} accent />
          <StatCell label="Venues" value={formatNumber(archive.counts.venues)} />
          <StatCell label="Squad players" value={formatNumber(archive.counts.players)} />
          <StatCell label="Attendance" value={archive.attendance !== null ? formatNumber(archive.attendance) : "Not recorded"} />
        </Box>
        <Typography component="p" sx={{ fontSize: "0.75rem", color: atlas.textMuted, mt: 2 }}>
          Dates, hosts, attendance, podium and awards:{" "}
          {archive.sourceUrl !== null ? (
            <Box component="a" href={archive.sourceUrl} target="_blank" rel="noopener noreferrer" sx={{ color: atlas.textSecondary }}>
              {archive.verificationStatus === "FIFA_OFFICIAL" ? "FIFA official records" : "source record"}
            </Box>
          ) : "source record"}
          . Matches, squads and goals: reconciled open dataset (Mominul FIFA World Cup 2026 Dataset, CC0). Last updated {archive.lastUpdated}.
        </Typography>
      </PageContainer>

      {/* Section nav */}
      <Box component="nav" aria-label="Tournament sections" sx={{ position: "sticky", top: 0, zIndex: 10, bgcolor: atlas.black, borderBottom: `1px solid ${atlas.border}`, mt: 3 }}>
        <PageContainer>
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", gap: { xs: 2, md: 3.5 }, overflowX: "auto", py: 1.75 }}>
            {SECTIONS.map((section) => (
              <Box component="li" key={section.id}>
                <Typography component="a" href={`#${section.id}`} sx={{ ...eyebrowSx, fontSize: "0.66rem", color: atlas.textSecondary, whiteSpace: "nowrap", textDecoration: "none", "&:hover, &:focus-visible": { color: atlas.goldStrong } }}>
                  {section.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </PageContainer>
      </Box>

      {/* Overview */}
      <PageContainer component="section" id="overview" sx={SECTION_SX}>
        <SectionHeading eyebrow="The decider" title="Overview" />
        {archive.finalMatch !== null ? (
          <Box sx={{ border: `1px solid ${atlas.goldBorder}`, bgcolor: atlas.surfaceSoft, p: 3, maxWidth: 640 }}>
            <Typography component="p" sx={{ ...eyebrowSx, fontSize: "0.62rem", color: atlas.gold, mb: 1.5 }}>
              The Final · {formatDay(archive.finalMatch.date) ?? ""}
            </Typography>
            <Typography sx={{ fontFamily: atlas.fontDisplay, fontWeight: 900, fontSize: "1.5rem", color: atlas.textPrimary }}>
              {archive.finalMatch.homeTeam.name} {formatArchiveScore(archive.finalMatch)} {archive.finalMatch.awayTeam.name}
            </Typography>
            <Typography variant="body2" sx={{ color: atlas.textMuted, mt: 1 }}>
              {[archive.finalMatch.venueName, archive.finalMatch.cityName].filter((v) => v !== null).join(" · ")}
            </Typography>
            <Box sx={{ mt: 2.5 }}>
              <VaultButton component={Link} href={`/matches/${archive.finalMatch.slug}`} variant="outline">Final match centre</VaultButton>
            </Box>
          </Box>
        ) : null}
        {championPath.length > 0 && champion !== null ? (
          <Box sx={{ mt: 4 }}>
            <Typography component="h3" sx={{ ...eyebrowSx, fontSize: "0.66rem", color: atlas.gold, mb: 2 }}>{champion.name}&apos;s road to the title</Typography>
            <ArchiveMatchRows matches={championPath} showStage />
          </Box>
        ) : null}
      </PageContainer>

      {/* Groups */}
      <PageContainer component="section" id="groups" sx={SECTION_SX}>
        <SectionHeading
          eyebrow={groupLetters.length > 0 ? `Groups ${groupLetters[0]}–${groupLetters.at(-1)}` : "Groups"}
          title="Group stage"
          subtitle="Final tables computed from the group-stage results."
        />
        {archive.groups.length === 0 ? <EmptyState title="Group results unavailable" /> : <ArchiveGroupTables groups={archive.groups} />}
      </PageContainer>

      {/* Bracket */}
      <PageContainer component="section" id="bracket" sx={SECTION_SX}>
        <SectionHeading
          eyebrow="Knockout stage"
          title="Bracket"
          subtitle={archive.bracket.rounds.length > 0 ? `${archive.bracket.rounds.map((r) => r.label).join(" → ")}. Penalty shootouts are shown in brackets and never added to the score.` : undefined}
        />
        {archive.bracket.rounds.length === 0 ? <EmptyState title="Knockout results unavailable" /> : <ArchiveBracket bracket={archive.bracket} />}
        {archive.coverage.incompleteOutcomes > 0 ? (
          <Typography component="p" sx={{ fontSize: "0.75rem", color: atlas.textMuted, mt: 2 }}>
            {archive.coverage.incompleteOutcomes === 1 ? "One knockout draw has" : `${archive.coverage.incompleteOutcomes} knockout draws have`} no recorded extra-time or shootout outcome in the source data. It is shown as &ldquo;outcome not recorded&rdquo; rather than guessed from the next round.
          </Typography>
        ) : null}
      </PageContainer>

      {/* Matches */}
      <PageContainer component="section" id="matches" sx={SECTION_SX}>
        <SectionHeading
          eyebrow={`${formatNumber(archive.counts.matches)} matches`}
          title="Matches"
          subtitle="Every match in kickoff order. Open one for its goals, shootout and match details."
          action={<VaultButton component={Link} href={`/matches?tournamentYear=${archive.year}`} variant="text">Match archive</VaultButton>}
        />
        <ArchiveMatchRows matches={archive.matches} />
      </PageContainer>

      {/* Teams */}
      <PageContainer component="section" id="teams" sx={SECTION_SX}>
        <SectionHeading eyebrow={`${archive.counts.teams} nations`} title="Teams" />
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1.5, gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", sm: "repeat(3, minmax(0,1fr))", lg: "repeat(4, minmax(0,1fr))" } }}>
          {archive.teams.map((team) => (
            <Box component="li" key={team.id}>
              <Box component={team.countrySlug !== null ? Link : "div"} href={team.countrySlug !== null ? `/countries/${team.countrySlug}` : undefined} sx={{ display: "block", border: `1px solid ${atlas.border}`, bgcolor: atlas.surfaceSoft, p: 2, textDecoration: "none", height: "100%", "&:hover": { borderColor: atlas.goldBorder } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 0.75 }}>
                  <CountryFlag code={team.code} name={team.name} slug={team.countrySlug} size="sm" />
                  <Typography component="span" sx={{ color: atlas.bodyStrong, fontWeight: 700, fontSize: "0.92rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{team.name}</Typography>
                </Box>
                <Typography component="span" sx={{ fontSize: "0.72rem", color: atlas.textMuted }}>{team.groupLetter !== null ? `Group ${team.groupLetter}` : "—"}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </PageContainer>

      {/* Players */}
      <PageContainer component="section" id="players" sx={SECTION_SX}>
        <SectionHeading eyebrow={`${formatNumber(archive.counts.players)} squad players`} title="Players" subtitle="Search the tournament squads (accents optional). Each player links to their career profile." />
        <Box component="form" method="get" action={`/tournaments/${archive.year}#players`} role="search" sx={{ mb: 2.5, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Box component="input" type="search" name="pq" defaultValue={playerQuery ?? ""} placeholder="Search player or team…" aria-label="Search squad players"
            sx={{ bgcolor: atlas.surface2, border: `1px solid ${atlas.border}`, color: atlas.textPrimary, px: 2, py: 1.1, fontSize: "0.9rem", minWidth: { xs: "100%", sm: 320 }, outline: "none", "&:focus-visible": { borderColor: atlas.goldBorder, outline: `2px solid ${atlas.gold}`, outlineOffset: 2 } }} />
          <VaultButton type="submit" variant="outline">Search</VaultButton>
        </Box>
        {squad.players.length === 0 ? (
          <EmptyState title="No players match" description="Try a different name or team." />
        ) : (
          <>
            <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1, gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "repeat(2, minmax(0,1fr))", lg: "repeat(3, minmax(0,1fr))" } }}>
              {squad.players.map((player) => (
                <Box component="li" key={`${player.team.id}-${player.slug}`}>
                  <Box component={Link} href={`/players/${player.slug}`} sx={{ display: "flex", alignItems: "center", gap: 1.25, border: `1px solid ${atlas.border}`, bgcolor: atlas.surfaceSoft, px: 1.75, py: 1.25, textDecoration: "none", "&:hover": { borderColor: atlas.goldBorder } }}>
                    <CountryFlag code={player.team.code} name={player.team.name} slug={player.team.countrySlug} size="xs" />
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography component="span" sx={{ display: "block", color: atlas.bodyStrong, fontSize: "0.88rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{player.name}</Typography>
                      <Typography component="span" sx={{ display: "block", fontSize: "0.68rem", color: atlas.textMuted }}>{[player.position, player.team.name].filter((v) => v !== null).join(" · ")}</Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
            {squad.total > squad.players.length ? (
              <Typography variant="body2" sx={{ color: atlas.textMuted, mt: 2 }}>Showing {squad.players.length} of {formatNumber(squad.total)} players — refine the search to narrow further.</Typography>
            ) : null}
          </>
        )}
      </PageContainer>

      {/* Venues */}
      <PageContainer component="section" id="venues" sx={SECTION_SX}>
        <SectionHeading eyebrow={`${archive.counts.venues} stadiums`} title="Venues" />
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1.5, gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "repeat(2, minmax(0,1fr))", lg: "repeat(4, minmax(0,1fr))" } }}>
          {archive.venues.map((venue) => (
            <Box component="li" key={venue.id} sx={{ border: `1px solid ${atlas.border}`, bgcolor: atlas.surfaceSoft, p: 2 }}>
              <Typography component="p" sx={{ color: atlas.bodyStrong, fontWeight: 700, fontSize: "0.92rem" }}>{venue.name}</Typography>
              <Typography component="p" sx={{ fontSize: "0.72rem", color: atlas.textMuted, mt: 0.5 }}>{[venue.city, venue.country].filter((v) => v !== null).join(" · ")}</Typography>
              <Typography component="p" sx={{ ...tabularNums, fontSize: "0.72rem", color: atlas.textMuted, mt: 0.5 }}>
                {venue.matches} {venue.matches === 1 ? "match" : "matches"}
                {venue.capacity !== null ? ` · capacity ${formatNumber(venue.capacity)}` : ""}
              </Typography>
            </Box>
          ))}
        </Box>
      </PageContainer>

      {/* Awards */}
      <PageContainer component="section" id="awards" sx={SECTION_SX}>
        <SectionHeading eyebrow="Honours" title="Awards" subtitle="The official tournament awards, linked to each winner's profile." />
        <ArchiveAwards awards={archive.awards} sourceUrl={awardSource} />
      </PageContainer>

      {/* Stats */}
      <PageContainer component="section" id="stats" sx={{ ...SECTION_SX, pb: { xs: 7, md: 9 } }}>
        <SectionHeading eyebrow="Tournament leaders" title="Stats" subtitle="Counted from the archive's goal records (own goals and shootout kicks excluded). Official award figures are under Awards." />
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "minmax(0,1fr)", md: "repeat(2, minmax(0,1fr))" } }}>
          <LeaderList title="Top scorers" leaders={archive.topScorers} valueLabel="Goals" secondaryLabel="assists" />
          <LeaderList title="Most assists" leaders={archive.topAssists} valueLabel="Assists" secondaryLabel="goals" />
        </Box>
        <Box role="note" sx={{ mt: 3, border: `1px dashed ${atlas.border}`, p: 2 }}>
          <Typography component="p" sx={{ fontSize: "0.8rem", color: atlas.textSecondary }}>
            Not recorded for {archive.year} yet: {notRecorded.join(", ")}. These stay blank until they can be
            reconciled with official match reports — they are never shown as zero.
          </Typography>
          <Typography component="p" sx={{ fontSize: "0.8rem", color: atlas.textSecondary, mt: 1 }}>
            <Box component={Link} href="/records" sx={{ color: atlas.gold }}>Book of Records</Box> · <Box component={Link} href="/sources" sx={{ color: atlas.gold }}>Sources and attribution</Box>
          </Typography>
        </Box>
      </PageContainer>
    </Box>
  );
}
