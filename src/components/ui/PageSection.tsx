// PageSection — consistent vertical rhythm for a band of content, with an
// optional soft hairline divider top and/or bottom. Server-safe.

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { nexusBorders } from "@/theme/visualTokens";

type PageSectionProps = {
  id?: string;
  children: React.ReactNode;
  dividerTop?: boolean;
  dividerBottom?: boolean;
  sx?: SxProps<Theme>;
};

export default function PageSection({
  id,
  children,
  dividerTop = false,
  dividerBottom = false,
  sx,
}: PageSectionProps) {
  return (
    <Box
      component="section"
      id={id}
      sx={{
        py: { xs: 5, md: 7 },
        scrollMarginTop: 88,
        ...(dividerTop ? { borderTop: nexusBorders.soft } : null),
        ...(dividerBottom ? { borderBottom: nexusBorders.soft } : null),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
