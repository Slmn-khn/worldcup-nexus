"use client";

// Active filter labels: rectangular, hairline-bordered, uppercase — never
// rounded colorful pills. Each label clears its own param; "Clear filters"
// clears them all.

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { atlas, eyebrowSx } from "@/theme/tokens";
import { useUrlFilters } from "./useUrlFilters";

export type ActiveFilterItem = {
  param: string;
  label: string;
  value: string;
};

export default function VaultActiveFilters({
  items,
  clearKeys,
}: {
  items: ActiveFilterItem[];
  /** Params removed by "Clear filters" (defaults to the active params). */
  clearKeys?: string[];
}) {
  const { update, clear } = useUrlFilters();
  if (items.length === 0) return null;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1,
        mt: 2,
      }}
    >
      {items.map((item) => (
        <ButtonBase
          key={item.param}
          onClick={() => update({ [item.param]: null })}
          aria-label={`Remove filter ${item.label}: ${item.value}`}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            px: 1.25,
            height: 30,
            border: `1px solid ${atlas.borderStrong}`,
            bgcolor: atlas.surface1,
            transition: "border-color 150ms ease",
            "&:hover": { borderColor: atlas.textPrimary },
          }}
        >
          <Typography
            component="span"
            sx={{ ...eyebrowSx, fontSize: "0.62rem", color: atlas.textMuted }}
          >
            {item.label}
          </Typography>
          <Typography
            component="span"
            sx={{
              ...eyebrowSx,
              fontSize: "0.66rem",
              color: atlas.textPrimary,
            }}
          >
            {item.value}
          </Typography>
          <CloseRoundedIcon sx={{ fontSize: 13, color: atlas.textMuted }} />
        </ButtonBase>
      ))}
      <ButtonBase
        onClick={() => clear(clearKeys ?? items.map((item) => item.param))}
        sx={{
          px: 1.25,
          height: 30,
          transition: "color 150ms ease",
          "&:hover .VaultActiveFilters-clear": { color: atlas.goldStrong },
        }}
      >
        <Typography
          component="span"
          className="VaultActiveFilters-clear"
          sx={{ ...eyebrowSx, fontSize: "0.66rem", color: atlas.textSecondary }}
        >
          Clear filters
        </Typography>
      </ButtonBase>
    </Box>
  );
}
