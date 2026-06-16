// Status chip for a fixture. Rectangular, uppercase, hairline — matches the
// Vault control voice. Gold marks the only "live" emphasis; nothing is filled.

import Chip from "@mui/material/Chip";
import { atlas, eyebrowSx } from "@/theme/tokens";
import type { FixtureStatusValue } from "@/server/fixtures/types";

type StatusStyle = { label: string; color: string; borderColor: string };

const STATUS_STYLES: Record<FixtureStatusValue, StatusStyle> = {
  SCHEDULED: {
    label: "Scheduled",
    color: atlas.textMuted,
    borderColor: atlas.border,
  },
  LIVE: { label: "Live", color: atlas.goldStrong, borderColor: atlas.goldBorder },
  HALF_TIME: {
    label: "Half-time",
    color: atlas.yellow,
    borderColor: "rgba(250, 204, 21, 0.45)",
  },
  FINISHED: {
    label: "Full-time",
    color: atlas.bodyStrong,
    borderColor: atlas.borderStrong,
  },
  POSTPONED: {
    label: "Postponed",
    color: atlas.red,
    borderColor: "rgba(217, 41, 62, 0.45)",
  },
  CANCELLED: {
    label: "Cancelled",
    color: atlas.red,
    borderColor: "rgba(217, 41, 62, 0.45)",
  },
  UNKNOWN: { label: "TBC", color: atlas.textMuted, borderColor: atlas.border },
};

export default function FixtureStatusChip({
  status,
}: {
  status: FixtureStatusValue;
}) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.UNKNOWN;
  const isLive = status === "LIVE";
  return (
    <Chip
      label={style.label}
      size="small"
      sx={{
        ...eyebrowSx,
        fontSize: "0.6rem",
        height: 22,
        borderRadius: 0,
        bgcolor: "transparent",
        color: style.color,
        border: "1px solid",
        borderColor: style.borderColor,
        "& .MuiChip-label": { px: 1 },
        ...(isLive
          ? {
              // A single quiet dot before the label, the only live emphasis.
              "&::before": {
                content: '""',
                display: "inline-block",
                width: 6,
                height: 6,
                ml: 1,
                borderRadius: "50%",
                bgcolor: atlas.goldStrong,
              },
            }
          : null),
      }}
    />
  );
}
