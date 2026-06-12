import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FadeIn from "@/components/motion/FadeIn";
import { eyebrowSx } from "@/theme/tokens";

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  /** Small-caps label above the title, e.g. "Leaderboards". */
  eyebrow?: string;
  /** Optional element rendered to the right of the heading, e.g. a "View all" link. */
  action?: React.ReactNode;
};

export default function SectionHeading({
  title,
  subtitle,
  eyebrow,
  action,
}: SectionHeadingProps) {
  return (
    <FadeIn y={14}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 3.5, alignItems: "flex-end", justifyContent: "space-between" }}
      >
        <Box>
          {eyebrow ? (
            <Typography
              variant="overline"
              component="p"
              sx={{ ...eyebrowSx, color: "primary.main", mb: 0.75 }}
            >
              {eyebrow}
            </Typography>
          ) : null}
          <Typography
            variant="h3"
            component="h2"
            sx={{
              color: "text.primary",
              fontSize: { xs: "1.4rem", md: "1.7rem" },
              // Short gold rule anchors the section without decoration noise.
              "&::after": {
                content: '""',
                display: "block",
                width: 32,
                height: 2,
                mt: 1.25,
                borderRadius: 1,
                bgcolor: "primary.main",
              },
            }}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 1.25, maxWidth: 620 }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {action ? <Box sx={{ flexShrink: 0, pb: 0.5 }}>{action}</Box> : null}
      </Stack>
    </FadeIn>
  );
}
