import Box from "@mui/material/Box";
import { atlas, eyebrowSx } from "@/theme/tokens";

const SECTIONS = [
  { label: "Overview", anchor: "#overview" },
  { label: "Teams", anchor: "#teams" },
  { label: "Matches", anchor: "#matches" },
  { label: "Top Scorers", anchor: "#top-scorers" },
  { label: "Awards", anchor: "#awards" },
  { label: "Penalties", anchor: "#penalties" },
];

/** Plain anchor navigation — uppercase category-tab labels, no fills. */
export default function TournamentSectionNav() {
  return (
    <Box
      component="nav"
      aria-label="Tournament sections"
      sx={{
        display: "flex",
        gap: { xs: 2.5, md: 3.5 },
        overflowX: "auto",
        borderBottom: `1px solid ${atlas.border}`,
        pb: 0,
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
            ...eyebrowSx,
            whiteSpace: "nowrap",
            color: atlas.textMuted,
            pb: 1.5,
            borderBottom: "2px solid transparent",
            transition: "color 150ms ease, border-color 150ms ease",
            "&:hover": {
              color: atlas.textPrimary,
              borderBottomColor: atlas.textPrimary,
            },
          }}
        >
          {section.label}
        </Box>
      ))}
    </Box>
  );
}
