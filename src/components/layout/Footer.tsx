import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import { siteConfig } from "@/lib/site";

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
            alignItems: { xs: "flex-start", md: "flex-start" },
          }}
        >
          <Box sx={{ maxWidth: 360 }}>
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
              {siteConfig.description}
            </Typography>
          </Box>
          <Box
            component="nav"
            aria-label="Footer"
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, auto)" },
              columnGap: { xs: 3, sm: 4 },
              rowGap: 1,
            }}
          >
            {siteConfig.navLinks.map(({ label, href }) => (
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
          </Box>
        </Stack>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", display: "block", mt: 4 }}
        >
          {siteConfig.disclaimer}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", display: "block", mt: 0.5 }}
        >
          Data attribution and license details are available on the{" "}
          <Typography
            component={Link}
            href="/sources"
            variant="caption"
            sx={{ color: "primary.main" }}
          >
            Sources
          </Typography>{" "}
          page.
        </Typography>
      </Container>
    </Box>
  );
}
