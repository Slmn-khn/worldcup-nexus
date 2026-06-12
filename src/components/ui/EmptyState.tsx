import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { atlas } from "@/theme/tokens";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        border: `1px solid ${atlas.border}`,
        bgcolor: atlas.surfaceSoft,
        px: 4,
        py: 6,
        textAlign: "center",
      }}
    >
      <Typography
        variant="h6"
        component="p"
        sx={{
          color: atlas.textPrimary,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          mb: 1,
        }}
      >
        {title}
      </Typography>
      {description ? (
        <Typography
          variant="body2"
          sx={{ color: atlas.textMuted, maxWidth: 480, mx: "auto" }}
        >
          {description}
        </Typography>
      ) : null}
      {action ? <Box sx={{ mt: 3 }}>{action}</Box> : null}
    </Box>
  );
}
