// HomeSection — shared vertical rhythm + optional hairline divider for the
// homepage content shell. The centered max-width and the rounded frame live on
// the page shell (src/app/page.tsx); this just spaces each band consistently.

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { atlasBorders } from "@/theme/visualTokens";

type HomeSectionProps = {
  id?: string;
  children: React.ReactNode;
  /** Soft hairline above the section to separate bands inside the frame. */
  divider?: boolean;
  sx?: SxProps<Theme>;
};

export default function HomeSection({
  id,
  children,
  divider = false,
  sx,
}: HomeSectionProps) {
  return (
    <Box
      component="section"
      id={id}
      sx={{
        py: { xs: 5, md: 8 },
        scrollMarginTop: 88,
        ...(divider ? { borderTop: `1px solid ${atlasBorders.soft}` } : null),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
