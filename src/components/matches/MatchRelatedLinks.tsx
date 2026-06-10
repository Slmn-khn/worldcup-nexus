import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Link from "@/components/Link";
import type { MatchDetailDto } from "@/server/queries/types";

export default function MatchRelatedLinks({
  match,
}: {
  match: MatchDetailDto;
}) {
  const links = [
    {
      label: `${match.tournamentYear} tournament`,
      href: `/tournaments/${match.tournamentYear}`,
    },
    match.homeCountry !== null
      ? {
          label: match.homeCountry.name,
          href: `/countries/${match.homeCountry.slug}`,
        }
      : null,
    match.awayCountry !== null
      ? {
          label: match.awayCountry.name,
          href: `/countries/${match.awayCountry.slug}`,
        }
      : null,
  ].filter((link): link is { label: string; href: string } => link !== null);

  return (
    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
      {links.map((link) => (
        <Button
          key={link.href}
          component={Link}
          href={link.href}
          variant="outlined"
          size="small"
          endIcon={<ArrowForwardRoundedIcon />}
          sx={{
            color: "text.primary",
            borderColor: "divider",
            "&:hover": { borderColor: "primary.main", color: "primary.main" },
          }}
        >
          {link.label}
        </Button>
      ))}
    </Box>
  );
}
