"use client";

// Zero-radius archive search input. Commits to the URL on Enter or blur
// (URL-driven, not keystroke-driven, so views stay shareable and the server
// page re-renders once per query).

import * as React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { atlas, eyebrowSx } from "@/theme/tokens";
import { useUrlFilters } from "./useUrlFilters";

type VaultSearchInputProps = {
  param?: string;
  label?: string;
  placeholder: string;
};

export default function VaultSearchInput({
  param = "q",
  label = "Search",
  placeholder,
}: VaultSearchInputProps) {
  const { get, update } = useUrlFilters();
  const urlValue = get(param);
  const [value, setValue] = React.useState(urlValue);
  // Stay in sync when the URL changes from elsewhere (clear-all,
  // back/forward) — React's adjust-state-during-render pattern.
  const [prevUrlValue, setPrevUrlValue] = React.useState(urlValue);
  if (urlValue !== prevUrlValue) {
    setPrevUrlValue(urlValue);
    setValue(urlValue);
  }

  function commit(next: string) {
    if (next.trim() === urlValue.trim()) return;
    update({ [param]: next.trim() === "" ? null : next.trim() });
  }

  return (
    <Box sx={{ minWidth: { xs: "100%", md: 240 } }}>
      <Typography
        component="label"
        htmlFor={`vault-search-${param}`}
        sx={{ ...eyebrowSx, fontSize: "0.66rem", color: atlas.textMuted, display: "block", mb: 0.75 }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          height: 48,
          bgcolor: atlas.black,
          border: `1px solid ${atlas.border}`,
          transition: "border-color 150ms ease",
          "&:hover": { borderColor: atlas.borderStrong },
          "&:focus-within": { borderColor: atlas.textPrimary },
        }}
      >
        <SearchIcon sx={{ color: atlas.textMuted, fontSize: 18 }} />
        <InputBase
          id={`vault-search-${param}`}
          fullWidth
          placeholder={placeholder}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={() => commit(value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit(value);
            if (event.key === "Escape") {
              setValue("");
              commit("");
            }
          }}
          sx={{ color: atlas.textPrimary, fontSize: "0.9rem", fontWeight: 300 }}
        />
        {value !== "" ? (
          <IconButton
            aria-label={`Clear ${label.toLowerCase()}`}
            size="small"
            onClick={() => {
              setValue("");
              commit("");
            }}
            sx={{ color: atlas.textMuted, p: 0.5 }}
          >
            <CloseRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        ) : null}
      </Box>
    </Box>
  );
}
