import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

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
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 2,
        px: 4,
        py: 6,
        textAlign: "center",
        bgcolor: "background.paper",
      }}
    >
      <Typography
        variant="h6"
        component="p"
        sx={{ color: "text.primary", mb: 0.75 }}
      >
        {title}
      </Typography>
      {description ? (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", maxWidth: 480, mx: "auto" }}
        >
          {description}
        </Typography>
      ) : null}
      {action ? <Box sx={{ mt: 2.5 }}>{action}</Box> : null}
    </Box>
  );
}
