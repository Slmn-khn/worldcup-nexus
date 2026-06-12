import Box from "@mui/material/Box";
import { atlas } from "@/theme/tokens";

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
        display: "inline-flex",
        gap: 0.5,
        maxWidth: "100%",
        overflowX: "auto",
        p: 0.5,
        borderRadius: 2,
        border: `1px solid ${atlas.border}`,
        bgcolor: atlas.surface1,
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {SECTIONS.map((section) => (
        <Box
          key={section.anchor}
          component="a"
          href={section.anchor}
          sx={{
            px: 1.5,
            py: 0.6,
            borderRadius: 1.5,
            fontSize: "0.82rem",
            fontWeight: 600,
            whiteSpace: "nowrap",
            color: "text.secondary",
            transition: "color 150ms ease, background-color 150ms ease",
            "&:hover": {
              color: "text.primary",
              bgcolor: atlas.surface2,
            },
          }}
        >
          {section.label}
        </Box>
      ))}
    </Box>
  );
}
