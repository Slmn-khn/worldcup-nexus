import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon?: React.ReactNode;
};

export default function StatCard({
  label,
  value,
  helper,
  icon,
}: StatCardProps) {
  return (
    <Card sx={{ height: "100%", bgcolor: "background.paper" }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 1.5, alignItems: "center" }}
        >
          {icon ? (
            <Box
              sx={{
                display: "inline-flex",
                color: "primary.main",
                fontSize: 20,
              }}
            >
              {icon}
            </Box>
          ) : null}
          <Typography
            variant="overline"
            sx={{
              color: "text.secondary",
              letterSpacing: "0.12em",
              lineHeight: 1.4,
            }}
          >
            {label}
          </Typography>
        </Stack>
        <Typography
          variant="h4"
          component="p"
          sx={{
            color: "primary.main",
            fontSize: { xs: "1.75rem", md: "2.1rem" },
          }}
        >
          {value}
        </Typography>
        {helper ? (
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", display: "block", mt: 0.75 }}
          >
            {helper}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}
