import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import Link from "@/components/Link";
import { siteConfig } from "@/lib/site";
import { atlas, eyebrowSx } from "@/theme/tokens";

const BROWSE_LINKS = siteConfig.navLinks.filter(({ href }) =>
  ["/tournaments", "/matches", "/countries", "/players"].includes(href),
);
const DATA_LINKS = siteConfig.navLinks.filter(({ href }) =>
  ["/records", "/explorer", "/sources", "/about"].includes(href),
);

function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string }[];
}) {
  return (
    <Box component="nav" aria-label={heading}>
      <Typography
        variant="overline"
        component="p"
        sx={{ ...eyebrowSx, color: atlas.textMuted, mb: 1.5 }}
      >
        {heading}
      </Typography>
      <Stack spacing={1}>
        {links.map(({ label, href }) => (
          <Typography
            key={href}
            component={Link}
            href={href}
            variant="body2"
            sx={{
              color: "text.secondary",
              width: "fit-content",
              "&:hover": { color: "primary.main" },
              transition: "color 150ms ease",
            }}
          >
            {label}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
}

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: `1px solid ${atlas.border}`,
        bgcolor: atlas.deepNavy,
        mt: "auto",
      }}
    >
      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 8 }, pb: 4 }}>
        <Box
          sx={{
            display: "grid",
            gap: { xs: 4, md: 6 },
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "minmax(0, 1.6fr) 1fr 1fr",
            },
          }}
        >
          <Box sx={{ maxWidth: 380 }}>
            <Stack
              direction="row"
              spacing={1.25}
              sx={{ alignItems: "center", mb: 1.5 }}
            >
              <Box
                aria-hidden
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: atlas.goldTint,
                  border: `1px solid ${atlas.goldBorder}`,
                }}
              >
                <EmojiEventsRoundedIcon
                  sx={{ color: "primary.main", fontSize: 18 }}
                />
              </Box>
              <Typography
                variant="h6"
                component="p"
                sx={{
                  color: "text.primary",
                  fontFamily: atlas.fontDisplay,
                  fontWeight: 700,
                  fontSize: "1.05rem",
                }}
              >
                WorldCup{" "}
                <Box component="span" sx={{ color: "primary.main" }}>
                  Atlas
                </Box>
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {siteConfig.description}
            </Typography>
          </Box>
          <FooterColumn heading="Browse" links={BROWSE_LINKS} />
          <FooterColumn heading="Data" links={DATA_LINKS} />
        </Box>

        <Box
          sx={{
            mt: { xs: 5, md: 6 },
            pt: 3,
            borderTop: `1px solid ${atlas.border}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: atlas.textMuted, display: "block" }}
          >
            {siteConfig.disclaimer}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: atlas.textMuted, display: "block", mt: 0.5 }}
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
        </Box>
      </Container>
    </Box>
  );
}
