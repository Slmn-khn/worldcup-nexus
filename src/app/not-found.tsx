import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";

export default function NotFound() {
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
      <Typography
        variant="h1"
        component="p"
        sx={{ color: "primary.main", fontSize: { xs: "2.5rem", md: "3.5rem" } }}
      >
        Page not found
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: "text.secondary", maxWidth: 480 }}
      >
        That page is not in the archive. Try the tournaments index or explore
        the data directly.
      </Typography>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ mt: 1 }}
      >
        <Button component={Link} href="/" variant="contained">
          Back home
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
          Tournaments
        </Button>
        <Button
          component={Link}
          href="/explorer"
          variant="outlined"
          sx={{
            color: "text.primary",
            borderColor: "divider",
            "&:hover": { borderColor: "primary.main" },
          }}
        >
          Data Explorer
        </Button>
      </Stack>
    </Box>
  );
}
