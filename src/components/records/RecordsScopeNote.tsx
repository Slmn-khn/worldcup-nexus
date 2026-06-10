import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

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
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "rgba(244, 201, 93, 0.05)",
        px: 2.5,
        py: 2,
        maxWidth: 860,
      }}
    >
      <InfoOutlinedIcon
        sx={{ color: "primary.main", fontSize: 20, mt: 0.25 }}
      />
      <Box>
        <Typography
          variant="body2"
          sx={{ color: "text.primary", fontWeight: 700, mb: 0.5 }}
        >
          Scope: {scopeLabel}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {scopeNote}
        </Typography>
      </Box>
    </Box>
  );
}
