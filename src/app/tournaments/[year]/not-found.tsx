import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";

export default function TournamentNotFound() {
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
        variant="h2"
        component="p"
        sx={{ color: "primary.main", fontSize: { xs: "2rem", md: "2.5rem" } }}
      >
        Tournament not found
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", maxWidth: 480 }}
      >
        There is no tournament for that year in the archive. The source data
        covers FIFA World Cup editions from 1930 onward.
      </Typography>
      <Button
        component={Link}
        href="/tournaments"
        variant="contained"
        sx={{ mt: 1 }}
      >
        Browse all tournaments
      </Button>
    </Box>
  );
}
