// FilterPanel — consistent wrapper for page filter controls. A DataPanel with an
// "Archive controls" label and an optional result count, holding the page's
// existing filter inputs unchanged. Server-safe.

import DataPanel from "./DataPanel";
import type { SxProps, Theme } from "@mui/material/styles";

type FilterPanelProps = {
  children: React.ReactNode;
  label?: string;
  /** e.g. "12 / 30 tournaments". */
  resultCount?: React.ReactNode;
  sx?: SxProps<Theme>;
};

export default function FilterPanel({
  children,
  label = "Archive controls",
  resultCount,
  sx,
}: FilterPanelProps) {
  return (
    <DataPanel label={label} meta={resultCount} sx={sx}>
      {children}
    </DataPanel>
  );
}
