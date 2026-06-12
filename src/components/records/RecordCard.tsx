import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { glowPanelSx } from "@/theme/tokens";

type RecordCardProps = {
  title: string;
  value: string;
  description: string;
};

export default function RecordCard({
  title,
  value,
  description,
}: RecordCardProps) {
  return (
    <Card
      sx={{
        ...glowPanelSx,
        position: "relative",
        // Cyan data edge light along the top of the panel.
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background:
            "linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.4), rgba(244, 201, 93, 0.35), transparent)",
          pointerEvents: "none",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="overline"
          sx={{
            color: "text.secondary",
            letterSpacing: "0.12em",
            display: "block",
            mb: 1,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h4"
          component="p"
          sx={{
            color: "primary.main",
            fontSize: { xs: "1.6rem", md: "1.9rem" },
            mb: 1,
          }}
        >
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}
