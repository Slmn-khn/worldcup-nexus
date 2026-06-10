import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";

type CountryCardProps = {
  name: string;
  flagEmoji?: string;
  summary: string;
  href?: string;
};

export default function CountryCard({
  name,
  flagEmoji,
  summary,
  href = "/countries",
}: CountryCardProps) {
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
            sx={{ mb: 1, alignItems: "center" }}
          >
            {flagEmoji ? (
              <Typography
                component="span"
                sx={{ fontSize: "1.6rem", lineHeight: 1 }}
                aria-hidden
              >
                {flagEmoji}
              </Typography>
            ) : null}
            <Typography
              variant="h6"
              component="p"
              sx={{ color: "text.primary" }}
            >
              {name}
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {summary}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
