// PageShell — consistent centered max-width + horizontal padding for any page,
// on the app-wide deep-blue canvas (the body gradient shows through). Optional
// `framed` mode wraps content in the soft rounded archive frame used on the
// homepage. Server-safe.

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { nexusBorders, nexusRadius } from "@/theme/visualTokens";

type PageShellProps = {
  children: React.ReactNode;
  /** Wrap content in the rounded, soft-bordered archive frame on md+. */
  framed?: boolean;
  maxWidth?: number;
  sx?: SxProps<Theme>;
};

export default function PageShell({
  children,
  framed = false,
  maxWidth = 1280,
  sx,
}: PageShellProps) {
  const inner = framed ? (
    <Box
      sx={{
        borderRadius: { xs: `${nexusRadius.lg}px`, md: `${nexusRadius.xl}px` },
        border: { md: nexusBorders.soft },
        background: {
          md: "linear-gradient(180deg, rgba(8,20,32,0.5) 0%, rgba(3,12,22,0.28) 100%)",
        },
        boxShadow: { md: "0 40px 120px rgba(0,0,0,0.5)" },
        px: { xs: 0, md: 4, lg: 6 },
        overflow: "hidden",
      }}
    >
      {children}
    </Box>
  ) : (
    children
  );

  return (
    <Box
      sx={{
        maxWidth,
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, md: 4 },
        ...sx,
      }}
    >
      {inner}
    </Box>
  );
}
