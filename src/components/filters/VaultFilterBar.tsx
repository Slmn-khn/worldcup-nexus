"use client";

// Vault archive controls: a black hairline panel holding search/select/sort
// controls, an optional result count, and rectangular active-filter labels.
// Horizontal at desktop, stacked at mobile. Entirely URL-driven.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { atlas, eyebrowSx, tabularNums } from "@/theme/tokens";
import VaultSearchInput from "./VaultSearchInput";
import VaultSelect from "./VaultSelect";
import VaultActiveFilters, { type ActiveFilterItem } from "./VaultActiveFilters";
import type { FilterOptionDto } from "@/server/queries/types";

export type VaultFilterField =
  | {
      kind: "search";
      param?: string;
      label?: string;
      placeholder: string;
    }
  | {
      kind: "select";
      param: string;
      label: string;
      options: FilterOptionDto[];
      allLabel?: string;
    };

type VaultFilterBarProps = {
  /** Uppercase panel label, e.g. "Archive Controls". */
  label?: string;
  fields: VaultFilterField[];
  /** Rectangular active-filter labels (server page supplies display values). */
  active?: ActiveFilterItem[];
  /** Filtered result count; shown with total when both provided. */
  resultCount?: number;
  totalCount?: number;
  resultNoun?: string;
};

export default function VaultFilterBar({
  label = "Archive Controls",
  fields,
  active = [],
  resultCount,
  totalCount,
  resultNoun = "results",
}: VaultFilterBarProps) {
  return (
    <Box
      sx={{
        border: `1px solid ${atlas.border}`,
        bgcolor: atlas.surfaceSoft,
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 2,
          mb: 2,
        }}
      >
        <Typography component="p" sx={{ ...eyebrowSx, color: atlas.textMuted }}>
          {label}
        </Typography>
        {resultCount !== undefined ? (
          <Typography
            component="p"
            sx={{
              ...eyebrowSx,
              ...tabularNums,
              fontSize: "0.66rem",
              color: atlas.textSecondary,
              whiteSpace: "nowrap",
            }}
            aria-live="polite"
          >
            {resultCount.toLocaleString("en-US")}
            {totalCount !== undefined
              ? ` / ${totalCount.toLocaleString("en-US")}`
              : ""}{" "}
            {resultNoun}
          </Typography>
        ) : null}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          flexWrap: { md: "wrap" },
          gap: 2,
          alignItems: { md: "flex-end" },
        }}
      >
        {fields.map((field) =>
          field.kind === "search" ? (
            <VaultSearchInput
              key={field.param ?? "q"}
              param={field.param}
              label={field.label}
              placeholder={field.placeholder}
            />
          ) : (
            <VaultSelect
              key={field.param}
              param={field.param}
              label={field.label}
              options={field.options}
              allLabel={field.allLabel}
            />
          ),
        )}
      </Box>

      <VaultActiveFilters items={active} />
    </Box>
  );
}

export type { FilterOptionDto, ActiveFilterItem };
