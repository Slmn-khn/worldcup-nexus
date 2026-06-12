import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PageContainer from "@/components/layout/PageContainer";
import AtlasBackground from "@/components/visual/AtlasBackground";
import PitchLines from "@/components/visual/PitchLines";
import FootballConstellation from "@/components/visual/FootballConstellation";
import RecordsScopeNote from "./RecordsScopeNote";

export default function RecordsHero({
  scopeLabel,
  scopeNote,
}: {
  scopeLabel: string;
  scopeNote: string;
}) {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "#050B14",
      }}
    >
      <AtlasBackground variant="hero" />
      <PitchLines />
      <FootballConstellation variant="records" intensity="medium" />
      <PageContainer sx={{ position: "relative", py: { xs: 6, md: 9 } }}>
        <Typography
          variant="overline"
          sx={{
            color: "primary.main",
            letterSpacing: "0.2em",
            display: "block",
            mb: 1.5,
          }}
        >
          The Archive
        </Typography>
        <Typography
          variant="h2"
          component="h1"
          sx={{ fontSize: { xs: "2rem", md: "2.75rem" }, mb: 1.5 }}
        >
          Book of Records
        </Typography>
        <Typography
          variant="h6"
          component="p"
          sx={{
            color: "text.secondary",
            fontWeight: 400,
            maxWidth: 640,
            mb: 3.5,
          }}
        >
          Explore leaderboards built from the imported WorldCup Atlas database.
        </Typography>
        <RecordsScopeNote scopeLabel={scopeLabel} scopeNote={scopeNote} />
      </PageContainer>
    </Box>
  );
}
