import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";

/**
 * Static search placeholder for the app shell checkpoint.
 * No search logic is wired up yet.
 */
export default function GlobalSearch() {
  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2.5,
          py: 1.75,
          bgcolor: "#142338",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2.5,
          transition: "border-color 150ms ease",
          "&:hover, &:focus-within": { borderColor: "primary.main" },
        }}
      >
        <SearchIcon sx={{ color: "text.secondary" }} />
        <InputBase
          fullWidth
          placeholder="Search tournaments, countries, players, matches…"
          inputProps={{ "aria-label": "Search the archive" }}
          sx={{ color: "text.primary", fontSize: "1.05rem" }}
        />
      </Paper>
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", display: "block", mt: 1, px: 0.5 }}
      >
        Try: Brazil 1970, Maradona 1986, Argentina France final
      </Typography>
    </Box>
  );
}
