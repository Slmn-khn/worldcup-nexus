import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { atlas, eyebrowSx, glowPanelSx, tabularNums } from "@/theme/tokens";

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
    <Card sx={glowPanelSx}>
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="overline"
          component="p"
          sx={{ ...eyebrowSx, color: atlas.textMuted, mb: 1 }}
        >
          {title}
        </Typography>
        <Typography
          variant="h4"
          component="p"
          sx={{
            ...tabularNums,
            color: "primary.main",
            fontSize: { xs: "1.45rem", md: "1.7rem" },
            lineHeight: 1.25,
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
