"use client";

// Zero-radius archive select bound to a URL param. Always offers an "All"
// option; option lists come from the query layer (actual DB values).

import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { atlas, eyebrowSx } from "@/theme/tokens";
import { useUrlFilters } from "./useUrlFilters";
import type { FilterOptionDto } from "@/server/queries/types";

type VaultSelectProps = {
  param: string;
  label: string;
  options: FilterOptionDto[];
  allLabel?: string;
};

export default function VaultSelect({
  param,
  label,
  options,
  allLabel = "All",
}: VaultSelectProps) {
  const { get, update } = useUrlFilters();
  const value = get(param);
  // Guard against stale URLs pointing at values that no longer exist.
  const known = options.some((option) => option.value === value);
  const labelId = `vault-select-${param}`;

  return (
    <Box sx={{ minWidth: { xs: "100%", md: 170 } }}>
      <Typography
        component="label"
        id={labelId}
        sx={{ ...eyebrowSx, fontSize: "0.66rem", color: atlas.textMuted, display: "block", mb: 0.75 }}
      >
        {label}
      </Typography>
      <Select
        labelId={labelId}
        value={known ? value : ""}
        onChange={(event) => update({ [param]: event.target.value || null })}
        displayEmpty
        fullWidth
        sx={{
          height: 48,
          bgcolor: atlas.black,
          fontSize: "0.9rem",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: atlas.border },
        }}
        MenuProps={{
          slotProps: {
            paper: { sx: { maxHeight: 360 } },
          },
        }}
      >
        <MenuItem value="">{allLabel}</MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
            {option.count !== undefined ? ` (${option.count})` : ""}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
