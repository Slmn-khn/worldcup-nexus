import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";

const SECTIONS = [
  { label: "Overview", anchor: "#overview" },
  { label: "Teams", anchor: "#teams" },
  { label: "Matches", anchor: "#matches" },
  { label: "Top Scorers", anchor: "#top-scorers" },
  { label: "Awards", anchor: "#awards" },
  { label: "Penalties", anchor: "#penalties" },
];

/** Plain anchor navigation — no client state needed. */
export default function TournamentSectionNav() {
  return (
    <Box
      component="nav"
      aria-label="Tournament sections"
      sx={{
        display: "flex",
        gap: 1,
        overflowX: "auto",
        pb: 0.5,
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {SECTIONS.map((section) => (
        <Chip
          key={section.anchor}
          label={section.label}
          component="a"
          href={section.anchor}
          clickable
          variant="outlined"
          sx={{
            color: "text.secondary",
            borderColor: "divider",
            "&:hover": { color: "primary.main", borderColor: "primary.main" },
          }}
        />
      ))}
    </Box>
  );
}
