// LoadingState — themed loading indicator (cyan spinner + message) on the
// deep-blue canvas. Server-safe; used by route loading.tsx and inline.

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import { nexusColors } from "@/theme/visualTokens";

type LoadingStateProps = {
  message?: string;
  /** Center within a tall viewport band (route-level loading). */
  fullPage?: boolean;
  sx?: SxProps<Theme>;
};

export default function LoadingState({
  message = "Loading the archive…",
  fullPage = false,
  sx,
}: LoadingStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        py: fullPage ? 16 : 8,
        ...sx,
      }}
    >
      <CircularProgress
        size={32}
        thickness={4}
        sx={{ color: nexusColors.cyan }}
      />
      <Typography variant="body2" sx={{ color: nexusColors.textSecondary }}>
        {message}
      </Typography>
    </Box>
  );
}
