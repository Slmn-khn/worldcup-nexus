// Records category strip: uppercase text tabs with a hairline underline on
// the active category — Vault archive tabs, not rounded pills. Pure links;
// the current q param is preserved.

import Box from "@mui/material/Box";
import Link from "@/components/Link";
import { buildQueryString } from "@/lib/search-params";
import { atlas, eyebrowSx } from "@/theme/tokens";
import type { RecordCategoryKey } from "@/server/queries/types";

const TABS: { label: string; value: RecordCategoryKey | "" }[] = [
  { label: "All", value: "" },
  { label: "Teams", value: "teams" },
  { label: "Players", value: "players" },
  { label: "Matches", value: "matches" },
  { label: "Tournaments", value: "tournaments" },
  { label: "Penalties", value: "penalties" },
  { label: "Discipline", value: "discipline" },
];

export default function RecordsCategoryTabs({
  category,
  q,
}: {
  category: RecordCategoryKey | undefined;
  q: string | undefined;
}) {
  return (
    <Box
      component="nav"
      aria-label="Record categories"
      sx={{
        display: "flex",
        gap: { xs: 2.5, md: 3.5 },
        overflowX: "auto",
        borderBottom: `1px solid ${atlas.border}`,
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {TABS.map((tab) => {
        const active = (category ?? "") === tab.value;
        return (
          <Box
            key={tab.value}
            component={Link}
            href={`/records${buildQueryString({ category: tab.value, q })}`}
            aria-current={active ? "page" : undefined}
            sx={{
              ...eyebrowSx,
              whiteSpace: "nowrap",
              color: active ? atlas.textPrimary : atlas.textMuted,
              pb: 1.5,
              borderBottom: `2px solid ${active ? atlas.textPrimary : "transparent"}`,
              transition: "color 150ms ease, border-color 150ms ease",
              "&:hover": { color: atlas.textPrimary },
            }}
          >
            {tab.label}
          </Box>
        );
      })}
    </Box>
  );
}
