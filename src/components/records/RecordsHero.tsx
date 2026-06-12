import Typography from "@mui/material/Typography";
import PageContainer from "@/components/layout/PageContainer";
import HeroSurface from "@/components/visual/HeroSurface";
import PitchLines from "@/components/visual/PitchLines";
import FootballConstellation from "@/components/visual/FootballConstellation";
import { eyebrowSx } from "@/theme/tokens";
import RecordsScopeNote from "./RecordsScopeNote";

export default function RecordsHero({
  scopeLabel,
  scopeNote,
}: {
  scopeLabel: string;
  scopeNote: string;
}) {
  return (
    <HeroSurface variant="feature">
      <PitchLines />
      <FootballConstellation variant="records" intensity="medium" />
      <PageContainer sx={{ position: "relative", py: { xs: 6, md: 8.5 } }}>
        <Typography
          variant="overline"
          component="p"
          sx={{ ...eyebrowSx, color: "primary.main", mb: 1.5 }}
        >
          The Archive
        </Typography>
        <Typography
          variant="h1"
          sx={{ fontSize: { xs: "2.2rem", md: "3.1rem" }, mb: 1.5 }}
        >
          Book of Records
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            fontSize: { xs: "1rem", md: "1.1rem" },
            maxWidth: 620,
            mb: 3.5,
          }}
        >
          Explore leaderboards built from the imported WorldCup Atlas database.
        </Typography>
        <RecordsScopeNote scopeLabel={scopeLabel} scopeNote={scopeNote} />
      </PageContainer>
    </HeroSurface>
  );
}
