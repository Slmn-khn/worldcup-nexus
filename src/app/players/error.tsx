"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export default function PlayersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        py: 16,
        textAlign: "center",
        px: 3,
      }}
    >
      <Typography variant="h5" component="p" sx={{ color: "text.primary" }}>
        Could not load players
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", maxWidth: 480 }}
      >
        The archive database may be unavailable. Check that the local database
        is running, then try again.
        {error.digest ? ` (ref: ${error.digest})` : ""}
      </Typography>
      <Button variant="contained" onClick={reset} sx={{ mt: 1 }}>
        Try again
      </Button>
    </Box>
  );
}
