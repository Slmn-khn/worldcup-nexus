import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";

type TournamentCardProps = {
  year: number;
  host: string;
  winner: string;
  runnerUp: string;
  finalScore: string;
  summary: string;
  href?: string;
};

export default function TournamentCard({
  year,
  host,
  winner,
  runnerUp,
  finalScore,
  summary,
  href = "/tournaments",
}: TournamentCardProps) {
  return (
    <Card
      sx={{
        height: "100%",
        transition: "border-color 150ms ease, transform 150ms ease",
        "&:hover": {
          borderColor: "primary.main",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardActionArea
        component={Link}
        href={href}
        sx={{ height: "100%", alignItems: "stretch" }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction="row"
            sx={{
              mb: 1.5,
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="h3"
              component="p"
              sx={{ color: "primary.main", fontSize: "2rem" }}
            >
              {year}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Host: {host}
            </Typography>
          </Stack>
          <Box
            sx={{
              bgcolor: "#142338",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              px: 2,
              py: 1.25,
              mb: 1.5,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "text.primary", fontWeight: 700 }}
            >
              {winner} {finalScore} {runnerUp}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Final
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {summary}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
