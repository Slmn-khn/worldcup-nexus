import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { atlas, eyebrowSx, glowPanelSx, tabularNums } from "@/theme/tokens";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon?: React.ReactNode;
};

/** Number-first data panel: the value is the hero, the label is an eyebrow. */
export default function StatCard({
  label,
  value,
  helper,
  icon,
}: StatCardProps) {
  return (
    <Card sx={glowPanelSx}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 1.25, alignItems: "center" }}
        >
          {icon ? (
            <Box
              sx={{
                display: "inline-flex",
                color: "primary.main",
                fontSize: 18,
              }}
            >
              {icon}
            </Box>
          ) : null}
          <Typography
            variant="overline"
            component="p"
            sx={{ ...eyebrowSx, color: atlas.textMuted }}
          >
            {label}
          </Typography>
        </Stack>
        <Typography
          variant="h3"
          component="p"
          sx={{
            ...tabularNums,
            color: "text.primary",
            fontSize: { xs: "1.9rem", md: "2.4rem" },
            lineHeight: 1.1,
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
