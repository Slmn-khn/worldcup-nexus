// Success confirmation shown after a feedback submission is accepted.
// Presentational — the parent (client form) supplies the reset handler.

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import GlowCard from "@/components/ui/GlowCard";
import NeonButton from "@/components/ui/NeonButton";
import Link from "@/components/Link";
import { atlasColors } from "@/theme/visualTokens";

type FeedbackSuccessStateProps = {
  onReset: () => void;
};

export default function FeedbackSuccessState({
  onReset,
}: FeedbackSuccessStateProps) {
  return (
    <GlowCard variant="cyan" sx={{ p: { xs: 3, md: 5 }, textAlign: "center" }}>
      <Box
        sx={{
          display: "inline-flex",
          mb: 2,
          color: atlasColors.green,
        }}
      >
        <CheckCircleRoundedIcon sx={{ fontSize: 56 }} />
      </Box>
      <Typography
        variant="h3"
        sx={{
          color: atlasColors.textPrimary,
          fontSize: { xs: "1.8rem", md: "2.2rem" },
        }}
      >
        Thanks for helping improve WORLDCUP Nexus
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: atlasColors.textSecondary,
          mt: 1.5,
          maxWidth: 520,
          mx: "auto",
        }}
      >
        Your feedback has been received and will be reviewed. Submissions are
        private and read by a person before any action is taken.
      </Typography>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ mt: 4, justifyContent: "center" }}
      >
        <NeonButton neon="cyan" onClick={onReset}>
          Send more feedback
        </NeonButton>
        <NeonButton neon="outline" component={Link} href="/">
          Back to home
        </NeonButton>
      </Stack>
    </GlowCard>
  );
}
