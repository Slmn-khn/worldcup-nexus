import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";

type MatchCardProps = {
  title: string;
  tournament: string;
  score: string;
  stage: string;
  summary?: string;
  href?: string;
};

export default function MatchCard({
  title,
  tournament,
  score,
  stage,
  summary,
  href = "/matches",
}: MatchCardProps) {
  return (
    <Card
      sx={{
        height: "100%",
        transition:
          "border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease",
        "&:focus-within": {
          borderColor: "primary.main",
          boxShadow: "0 10px 32px rgba(244, 201, 93, 0.14)",
        },
        "&:hover": {
          borderColor: "primary.main",
          transform: "translateY(-3px)",
          boxShadow: "0 10px 32px rgba(244, 201, 93, 0.14)",
        },
      }}
    >
      <CardActionArea
        component={Link}
        href={href}
        sx={{ height: "100%", alignItems: "stretch" }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            <Chip
              label={stage}
              size="small"
              sx={{
                bgcolor: "rgba(244, 201, 93, 0.12)",
                color: "primary.main",
                fontWeight: 700,
              }}
            />
            <Chip
              label={tournament}
              size="small"
              variant="outlined"
              sx={{ color: "text.secondary", borderColor: "divider" }}
            />
          </Stack>
          <Typography
            variant="h6"
            component="p"
            sx={{ color: "text.primary", mb: 0.5 }}
          >
            {title}
          </Typography>
          <Typography
            variant="h5"
            component="p"
            sx={{ color: "primary.main", fontWeight: 700, mb: 1.5 }}
          >
            {score}
          </Typography>
          {summary ? (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {summary}
            </Typography>
          ) : null}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
