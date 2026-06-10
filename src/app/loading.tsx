import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

export default function RootLoading() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        py: 16,
      }}
    >
      <CircularProgress size={32} sx={{ color: "primary.main" }} />
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        Loading the archive…
      </Typography>
    </Box>
  );
}
