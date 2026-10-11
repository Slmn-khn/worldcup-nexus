// Official tournament awards for the archive hub. Each award shows a text
// tier label (Gold / Silver / Bronze) so medal colour is never the only cue,
// links its player and nation to their canonical profiles, and shows FIFA's
// published figures (e.g. Golden Boot minutes) only when the award row holds
// them. A single fade-in on reveal; reduced motion handled by FadeIn.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import VerifiedIcon from "@mui/icons-material/Verified";
import Link from "@/components/Link";
import CountryFlag from "@/components/media/CountryFlag";
import EmptyState from "@/components/ui/EmptyState";
import FadeIn from "@/components/motion/FadeIn";
import { atlas, eyebrowSx, tabularNums } from "@/theme/tokens";
import type { ArchiveAwardDto } from "@/server/queries/tournamentArchive";

const TIERS: Record<number, { label: string; color: string; border: string }> = {
  1: { label: "Gold", color: "#F4C95D", border: "rgba(244, 201, 93, 0.55)" },
  2: { label: "Silver", color: "#C9D3E0", border: "rgba(201, 211, 224, 0.45)" },
  3: { label: "Bronze", color: "#D49A6A", border: "rgba(212, 154, 106, 0.5)" },
};

/** Award families in display order; anything else follows alphabetically. */
const FAMILY_ORDER = ["Ball", "Boot", "Glove", "Young", "Fair Play"];

function family(name: string): number {
  const index = FAMILY_ORDER.findIndex((key) => name.includes(key));
  return index === -1 ? FAMILY_ORDER.length : index;
}

function AwardCard({ award }: { award: ArchiveAwardDto }) {
  const tieredName = /^(Golden|Silver|Bronze) (Ball|Boot)$/.test(award.name);
  const tier = tieredName && award.rank !== null ? TIERS[award.rank] : undefined;
  const accent = tier ?? { label: award.name.includes("Fair Play") ? "Team award" : "Individual award", color: atlas.gold, border: atlas.goldBorder };
  const figures = [
    award.details.goals !== undefined ? `${award.details.goals} goals` : null,
    award.details.assists !== undefined ? `${award.details.assists} assists` : null,
    award.details.minutes !== undefined ? `${award.details.minutes.toLocaleString("en-US")} min` : null,
  ].filter((value): value is string => value !== null);
  return (
    <Box component="article" aria-label={`${award.name}${award.player !== null ? `: ${award.player.name}` : award.team !== null ? `: ${award.team.name}` : ""}`} sx={{ border: `1px solid ${accent.border}`, bgcolor: atlas.surfaceSoft, p: 2.5, height: "100%", display: "grid", gap: 1.25, alignContent: "start" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Typography component="p" sx={{ ...eyebrowSx, fontSize: "0.6rem", color: accent.color }}>
          {accent.label}
        </Typography>
        {award.verified ? (
          <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: atlas.textMuted, fontSize: "0.65rem" }}>
            <VerifiedIcon sx={{ fontSize: 13 }} aria-hidden /> FIFA official
          </Box>
        ) : null}
      </Box>
      <Typography component="h3" sx={{ fontFamily: atlas.fontDisplay, fontWeight: 900, fontSize: "1.15rem", color: atlas.textPrimary, lineHeight: 1.2 }}>
        {award.name}
      </Typography>
      {award.officialName !== null && award.officialName !== award.name ? (
        <Typography component="p" sx={{ fontSize: "0.7rem", color: atlas.textMuted, mt: -0.75 }}>
          Officially: {award.officialName}
        </Typography>
      ) : null}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
        {award.team !== null ? <CountryFlag code={award.team.code} name={award.team.name} slug={award.team.countrySlug} size="sm" /> : null}
        <Box sx={{ minWidth: 0 }}>
          {award.player !== null ? (
            <Box component={Link} href={`/players/${award.player.slug}`} sx={{ display: "block", color: atlas.bodyStrong, fontWeight: 700, textDecoration: "none", "&:hover": { color: atlas.goldStrong } }}>
              {award.player.name}
              {award.details.shirtNumber !== undefined ? (
                <Typography component="span" sx={{ ...tabularNums, color: atlas.textMuted, fontSize: "0.75rem", ml: 0.75 }}>
                  #{award.details.shirtNumber}
                </Typography>
              ) : null}
            </Box>
          ) : null}
          {award.team !== null ? (
            award.team.countrySlug !== null ? (
              <Box component={Link} href={`/countries/${award.team.countrySlug}`} sx={{ color: award.player === null ? atlas.bodyStrong : atlas.textSecondary, fontWeight: award.player === null ? 700 : 400, fontSize: award.player === null ? "1rem" : "0.8rem", textDecoration: "none", "&:hover": { color: atlas.goldStrong } }}>
                {award.team.name}
              </Box>
            ) : (
              <Typography component="span" sx={{ color: atlas.textSecondary }}>{award.team.name}</Typography>
            )
          ) : null}
        </Box>
      </Box>
      {figures.length > 0 ? (
        <Typography component="p" sx={{ ...tabularNums, fontSize: "0.78rem", color: atlas.textSecondary }}>
          {figures.join(" · ")}
        </Typography>
      ) : null}
    </Box>
  );
}

export default function ArchiveAwards({ awards, sourceUrl }: { awards: ArchiveAwardDto[]; sourceUrl: string | null }) {
  if (awards.length === 0) {
    return <EmptyState title="No awards recorded" description="This tournament has no award records in the archive yet." />;
  }
  const sorted = [...awards].sort((a, b) => family(a.name) - family(b.name) || (a.rank ?? 9) - (b.rank ?? 9) || a.name.localeCompare(b.name));
  return (
    <>
      <FadeIn>
        <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "repeat(2, minmax(0,1fr))", lg: "repeat(3, minmax(0,1fr))" } }}>
          {sorted.map((award) => (
            <AwardCard key={award.id} award={award} />
          ))}
        </Box>
      </FadeIn>
      {sourceUrl !== null ? (
        <Typography component="p" sx={{ fontSize: "0.75rem", color: atlas.textMuted, mt: 2 }}>
          Source:{" "}
          <Box component={Link} href={sourceUrl} sx={{ color: atlas.textSecondary }} target="_blank" rel="noopener noreferrer">
            FIFA official awards document
          </Box>
          . Goal, assist and minute figures are FIFA&apos;s published totals.
        </Typography>
      ) : null}
    </>
  );
}
