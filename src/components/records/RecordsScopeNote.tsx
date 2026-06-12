import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { atlas } from "@/theme/tokens";

/**
 * Explains exactly what the leaderboards cover. Never overstates official
 * status — these are computed from the imported dataset only.
 */
export default function RecordsScopeNote({
  scopeLabel,
  scopeNote,
}: {
  scopeLabel: string;
  scopeNote: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        alignItems: "flex-start",
        border: `1px solid ${atlas.border}`,
        bgcolor: atlas.surfaceSoft,
        px: 2.5,
        py: 2,
        maxWidth: 860,
      }}
    >
      <InfoOutlinedIcon sx={{ color: atlas.gold, fontSize: 20, mt: 0.25 }} />
      <Box>
        <Typography
          variant="body2"
          sx={{ color: atlas.textPrimary, fontWeight: 600, mb: 0.5 }}
        >
          Scope: {scopeLabel}
        </Typography>
        <Typography variant="body2" sx={{ color: atlas.textSecondary }}>
          {scopeNote}
        </Typography>
      </Box>
    </Box>
  );
}
