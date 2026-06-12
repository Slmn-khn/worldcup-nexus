import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import { formatNumber } from "@/lib/format";
import { glowPanelSx, interactiveCardSx } from "@/theme/tokens";
import type { RecordItemDto } from "@/server/queries/types";

/** Highlighted #1 record (e.g. most goals by a player). Real data only. */
export default function RecordStatCard({
  title,
  item,
}: {
  title: string;
  item: RecordItemDto;
}) {
  const content = (
    <CardContent sx={{ p: 2.5 }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 0.75, alignItems: "baseline" }}
      >
        <Typography
          variant="caption"
          component="span"
          aria-label="Record holder, ranked first"
          sx={{
            color: "#22D3EE",
            fontWeight: 700,
            letterSpacing: "0.08em",
            lineHeight: 1.4,
          }}
        >
          №1
        </Typography>
        <Typography
          variant="overline"
          sx={{
            color: "text.secondary",
            letterSpacing: "0.12em",
            lineHeight: 1.4,
          }}
        >
          {title}
        </Typography>
      </Stack>
      <Typography
        variant="h4"
        component="p"
        sx={{
          color: "primary.main",
          fontSize: { xs: "1.5rem", md: "1.8rem" },
          lineHeight: 1.2,
        }}
      >
        {item.label}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.75 }}>
        {formatNumber(item.value)}
        {item.detail !== null ? ` · ${item.detail}` : ""}
      </Typography>
    </CardContent>
  );

  if (item.href !== null) {
    return (
      <Card sx={interactiveCardSx}>
        <CardActionArea
          component={Link}
          href={item.href}
          sx={{ height: "100%", alignItems: "stretch" }}
        >
          {content}
        </CardActionArea>
      </Card>
    );
  }
  return <Card sx={glowPanelSx}>{content}</Card>;
}
