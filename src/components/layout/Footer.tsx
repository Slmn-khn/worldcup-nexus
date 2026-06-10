import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";

const FOOTER_LINKS = [
  { label: "Sources", href: "/sources" },
  { label: "About", href: "/about" },
  { label: "Records", href: "/records" },
  { label: "Explorer", href: "/explorer" },
];

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        mt: "auto",
      }}
    >
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
          }}
        >
          <Box>
            <Typography
              variant="h6"
              component="p"
              sx={{
                color: "text.primary",
                fontFamily: "var(--font-serif), Georgia, serif",
              }}
            >
              WorldCup{" "}
              <Box component="span" sx={{ color: "primary.main" }}>
                Atlas
              </Box>
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 0.5 }}
            >
              An independent historical archive of the FIFA World Cup.
            </Typography>
          </Box>
          <Stack direction="row" spacing={3}>
            {FOOTER_LINKS.map(({ label, href }) => (
              <Typography
                key={href}
                component={Link}
                href={href}
                variant="body2"
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "primary.main" },
                  transition: "color 150ms ease",
                }}
              >
                {label}
              </Typography>
            ))}
          </Stack>
        </Stack>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", display: "block", mt: 4 }}
        >
          WorldCup Atlas is not affiliated with FIFA.
        </Typography>
      </Container>
    </Box>
  );
}
