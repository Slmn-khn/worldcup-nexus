import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

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
        height: "100%",
        transition: "border-color 200ms ease, box-shadow 200ms ease",
        "&:hover": {
          borderColor: "rgba(244, 201, 93, 0.4)",
          boxShadow: "0 6px 24px rgba(6, 17, 31, 0.5)",
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
