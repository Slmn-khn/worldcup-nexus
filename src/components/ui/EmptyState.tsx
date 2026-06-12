import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SportsSoccerRoundedIcon from "@mui/icons-material/SportsSoccerRounded";
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
        borderRadius: 3,
        px: 4,
        py: 6,
        textAlign: "center",
        background: atlas.cardGradient,
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 44,
          height: 44,
          mx: "auto",
          mb: 2,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: atlas.surface2,
          border: `1px solid ${atlas.border}`,
          color: atlas.textMuted,
        }}
      >
        <SportsSoccerRoundedIcon sx={{ fontSize: 22 }} />
      </Box>
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
