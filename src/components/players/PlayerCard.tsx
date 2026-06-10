import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";

type PlayerCardProps = {
  name: string;
  country: string;
  summary: string;
  href?: string;
};

export default function PlayerCard({
  name,
  country,
  summary,
  href = "/players",
}: PlayerCardProps) {
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
            spacing={1.5}
            sx={{ mb: 1.5, alignItems: "center" }}
          >
            <Avatar
              sx={{
                bgcolor: "#142338",
                color: "primary.main",
                border: "1px solid",
                borderColor: "divider",
                fontWeight: 700,
              }}
            >
              {name.charAt(0)}
            </Avatar>
            <Stack>
              <Typography
                variant="h6"
                component="p"
                sx={{ color: "text.primary", lineHeight: 1.3 }}
              >
                {name}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {country}
              </Typography>
            </Stack>
          </Stack>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {summary}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
