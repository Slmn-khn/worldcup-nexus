// Guidelines + example panel shown beside the feedback form. Presentational
// and server-safe (no client state).

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import GlowCard from "@/components/ui/GlowCard";
import NeonChip from "@/components/ui/NeonChip";
import { atlasColors } from "@/theme/visualTokens";

const GUIDELINES = [
  "Be specific — what you saw, where, and what you expected.",
  "Be respectful.",
  "Do not share private personal information.",
  "Include the page or match if reporting a data issue.",
  "Feedback is reviewed before any action is taken.",
];

const GOOD_EXAMPLES = [
  "The 2022 Argentina vs France final penalty score looks wrong on this page.",
  "Can you add a penalty shootout filter to Records?",
  "The country flag for Curaçao is not showing correctly.",
];

const AVOID_EXAMPLES = [
  "Spam links",
  "Abuse or insults",
  "Private phone numbers",
  "Unrelated promotions",
];

export default function FeedbackGuidelines() {
  return (
    <Stack spacing={3}>
      <GlowCard sx={{ p: { xs: 2.5, md: 3 } }}>
        <NeonChip accent="cyan" label="Before you send" />
        <Stack
          component="ul"
          spacing={1.25}
          sx={{ pl: 0, m: 0, mt: 2, listStyle: "none" }}
        >
          {GUIDELINES.map((item) => (
            <Box
              key={item}
              component="li"
              sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}
            >
              <Box
                aria-hidden
                sx={{
                  mt: "9px",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  flexShrink: 0,
                  bgcolor: atlasColors.cyan,
                  boxShadow: `0 0 10px 1px ${atlasColors.cyan}`,
                }}
              />
              <Typography
                variant="body2"
                sx={{ color: atlasColors.textSecondary }}
              >
                {item}
              </Typography>
            </Box>
          ))}
        </Stack>
      </GlowCard>

      <GlowCard sx={{ p: { xs: 2.5, md: 3 } }}>
        <NeonChip accent="gold" label="Helpful examples" />
        <Stack spacing={1.25} sx={{ mt: 2 }}>
          {GOOD_EXAMPLES.map((example) => (
            <Box
              key={example}
              sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}
            >
              <CheckCircleOutlineRoundedIcon
                fontSize="small"
                sx={{ color: atlasColors.green, mt: "2px", flexShrink: 0 }}
              />
              <Typography
                variant="body2"
                sx={{ color: atlasColors.textSecondary, fontStyle: "italic" }}
              >
                “{example}”
              </Typography>
            </Box>
          ))}
        </Stack>

        <Typography
          sx={{
            mt: 3,
            mb: 1,
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: atlasColors.textMuted,
          }}
        >
          Please avoid
        </Typography>
        <Stack spacing={1}>
          {AVOID_EXAMPLES.map((item) => (
            <Box
              key={item}
              sx={{ display: "flex", gap: 1.25, alignItems: "center" }}
            >
              <BlockRoundedIcon
                fontSize="small"
                sx={{ color: atlasColors.red, flexShrink: 0 }}
              />
              <Typography
                variant="body2"
                sx={{ color: atlasColors.textSecondary }}
              >
                {item}
              </Typography>
            </Box>
          ))}
        </Stack>
      </GlowCard>
    </Stack>
  );
}
