"use client";

// App-level error boundary. Generic on purpose — no stack traces or error
// details are shown to users (only the opaque digest reference).

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";

export default function AppError({
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
        Something went wrong
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", maxWidth: 480 }}
      >
        An unexpected error occurred while loading this page. Please try again.
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
          href="/"
          variant="outlined"
          sx={{
            color: "text.primary",
            borderColor: "divider",
            "&:hover": { borderColor: "primary.main" },
          }}
        >
          Back home
        </Button>
      </Stack>
    </Box>
  );
}
