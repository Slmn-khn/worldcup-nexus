import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PageContainer from "@/components/layout/PageContainer";
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
        borderBottom: "1px solid",
        borderColor: "divider",
        background:
          "radial-gradient(ellipse 70% 70% at 80% -20%, rgba(244, 201, 93, 0.14), transparent), " +
          "radial-gradient(ellipse 50% 50% at 10% 110%, rgba(31, 122, 77, 0.12), transparent), #06111F",
      }}
    >
      <PageContainer sx={{ py: { xs: 6, md: 9 } }}>
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
