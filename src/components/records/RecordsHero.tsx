import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PageContainer from "@/components/layout/PageContainer";
import VaultEyebrow from "@/components/vault/VaultEyebrow";
import RecordsScopeNote from "./RecordsScopeNote";
import { atlas } from "@/theme/tokens";

export default function RecordsHero({
  scopeLabel,
  scopeNote,
}: {
  scopeLabel: string;
  scopeNote: string;
}) {
  return (
    <Box sx={{ borderBottom: `1px solid ${atlas.border}`, bgcolor: atlas.black }}>
      <PageContainer sx={{ py: { xs: 7, md: 10 } }}>
        <VaultEyebrow label="Still standing" sx={{ mb: 2.5 }} />
        <Typography
          variant="h1"
          sx={{ fontSize: { xs: "3rem", sm: "3.6rem", md: "4.6rem" }, mb: 2 }}
        >
          The Book of Records
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: atlas.textSecondary,
            fontSize: { xs: "1rem", md: "1.08rem" },
            maxWidth: 640,
            mb: 4,
          }}
        >
          Explore leaderboards built from the imported WorldCup Atlas database.
        </Typography>
        <RecordsScopeNote scopeLabel={scopeLabel} scopeNote={scopeNote} />
      </PageContainer>
    </Box>
  );
}
