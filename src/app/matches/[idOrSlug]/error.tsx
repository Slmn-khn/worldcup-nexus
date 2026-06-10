"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";

export default function MatchDetailError({
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
        Could not load this match
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", maxWidth: 480 }}
      >
        The archive database may be unavailable. Check that the local database
        is running, then try again.
        {error.digest ? ` (ref: ${error.digest})` : ""}
      </Typography>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ mt: 1 }}
      >
        <Button variant="contained" onClick={reset}>
          Try again
        </Button>
        <Button
          component={Link}
          href="/tournaments"
          variant="outlined"
          sx={{
            color: "text.primary",
            borderColor: "divider",
            "&:hover": { borderColor: "primary.main" },
          }}
        >
          Back to tournaments
        </Button>
      </Stack>
    </Box>
  );
}
