import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import { formatNumber } from "@/lib/format";
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
      <Typography
        variant="overline"
        sx={{
          color: "text.secondary",
          letterSpacing: "0.12em",
          display: "block",
          mb: 0.75,
        }}
      >
        {title}
      </Typography>
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
          href={item.href}
          sx={{ height: "100%", alignItems: "stretch" }}
        >
          {content}
        </CardActionArea>
      </Card>
    );
  }
  return <Card sx={{ height: "100%" }}>{content}</Card>;
}
