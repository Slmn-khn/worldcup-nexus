import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FadeIn from "@/components/motion/FadeIn";

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  /** Optional element rendered to the right of the heading, e.g. a "View all" link. */
  action?: React.ReactNode;
};

export default function SectionHeading({
  title,
  subtitle,
  action,
}: SectionHeadingProps) {
  return (
    <FadeIn y={14}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 3, alignItems: "flex-end", justifyContent: "space-between" }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              color: "text.primary",
              fontSize: { xs: "1.5rem", md: "1.9rem" },
              // Short gold→cyan accent rule under every section title.
              "&::after": {
                content: '""',
                display: "block",
                width: 48,
                height: 3,
                mt: 1,
                borderRadius: 1,
                background:
                  "linear-gradient(90deg, #F4C95D, rgba(34, 211, 238, 0.7))",
              },
            }}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", mt: 0.75, maxWidth: 640 }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
      </Stack>
    </FadeIn>
  );
}
