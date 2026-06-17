// ErrorState — a centered, themed error/not-found card with a title, message,
// and an actions slot (retry / back links). Presentational and server-safe; the
// caller supplies the action buttons so it works in both client error
// boundaries and server not-found pages.

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import GlowCard from "@/components/ui/GlowCard";
import { nexusColors } from "@/theme/visualTokens";

type ErrorStateProps = {
  title: string;
  description?: React.ReactNode;
  /** Optional large display code, e.g. "404". */
  code?: string;
  /** Action buttons (NeonButton / Link buttons). */
  actions?: React.ReactNode;
};

export default function ErrorState({
  title,
  description,
  code,
  actions,
}: ErrorStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
        py: { xs: 8, md: 14 },
      }}
    >
      <GlowCard
        variant="glass"
        sx={{
          maxWidth: 520,
          width: "100%",
          textAlign: "center",
          px: { xs: 3, md: 5 },
          py: { xs: 4, md: 6 },
        }}
      >
        {code ? (
          <Typography
            component="p"
            sx={{
              fontFamily: "var(--font-display), system-ui, sans-serif",
              fontWeight: 700,
              fontSize: { xs: "3rem", md: "4rem" },
              lineHeight: 1,
              color: nexusColors.goldStrong,
              textShadow: "0 0 28px rgba(244,201,93,0.4)",
              mb: 1.5,
            }}
          >
            {code}
          </Typography>
        ) : null}
        <Typography
          variant="h5"
          component="h1"
          sx={{ color: nexusColors.textPrimary, mb: 1.5 }}
        >
          {title}
        </Typography>
        {description ? (
          <Typography
            variant="body2"
            sx={{ color: nexusColors.textSecondary, maxWidth: 420, mx: "auto" }}
          >
            {description}
          </Typography>
        ) : null}
        {actions ? (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ mt: 3.5, justifyContent: "center" }}
          >
            {actions}
          </Stack>
        ) : null}
      </GlowCard>
    </Box>
  );
}
