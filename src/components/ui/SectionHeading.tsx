import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

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
  );
}
