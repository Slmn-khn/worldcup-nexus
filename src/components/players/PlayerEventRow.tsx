import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";

export type PlayerEventRowProps = {
  matchSlug: string;
  matchLabel: string;
  tournamentYear: number;
  /** Minute label like "90+3'" or null. */
  minuteLabel: string | null;
  /** Chip shown for the event kind (e.g. card type, Subbed In). */
  chip?: { label: string; color: string; background: string };
  /** Trailing detail, e.g. "vs Italy · group stage". */
  detail: string | null;
};

/** Shared compact row for player event lists; links to the match page. */
export default function PlayerEventRow({
  matchSlug,
  matchLabel,
  tournamentYear,
  minuteLabel,
  chip,
  detail,
}: PlayerEventRowProps) {
  return (
    <Box
      component={Link}
      href={`/matches/${matchSlug}`}
      sx={{
        display: "grid",
        gridTemplateColumns: chip
          ? { xs: "44px 48px auto 1fr", md: "56px 48px 150px 1fr auto" }
          : { xs: "44px 48px 1fr", md: "56px 48px 1fr auto" },
        alignItems: "center",
        gap: { xs: 1, md: 2 },
        px: 2,
        py: 1.25,
        borderBottom: "1px solid",
        borderColor: "divider",
        transition: "background-color 120ms ease",
        "&:hover": { bgcolor: "rgba(248, 250, 252, 0.04)" },
        "&:last-of-type": { borderBottom: "none" },
      }}
    >
      <Typography
        variant="caption"
        sx={{ color: "primary.main", fontWeight: 700 }}
      >
        {tournamentYear}
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {minuteLabel ?? "—"}
      </Typography>
      {chip ? (
        <Chip
          label={chip.label}
          size="small"
          sx={{
            bgcolor: chip.background,
            color: chip.color,
            fontWeight: 700,
            justifySelf: "start",
            display: { xs: "none", md: "inline-flex" },
          }}
        />
      ) : null}
      <Typography variant="body2" sx={{ color: "text.primary" }}>
        {matchLabel}
        {chip ? (
          <Box
            component="span"
            sx={{ color: "text.secondary", display: { md: "none" } }}
          >
            {" "}
            · {chip.label}
          </Box>
        ) : null}
      </Typography>
      {detail !== null ? (
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            display: { xs: "none", md: "block" },
            textAlign: "right",
          }}
        >
          {detail}
        </Typography>
      ) : null}
    </Box>
  );
}

/** Bordered container for stacked PlayerEventRow items. */
export function PlayerEventRowGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 0,
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      {children}
    </Box>
  );
}
