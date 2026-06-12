import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import VaultStripe from "@/components/vault/VaultStripe";
import { siteConfig } from "@/lib/site";
import { atlas, eyebrowSx } from "@/theme/tokens";

const ARCHIVE_LINKS = siteConfig.navLinks.filter(({ href }) =>
  ["/tournaments", "/matches", "/countries", "/players"].includes(href),
);
const DATA_LINKS = siteConfig.navLinks.filter(({ href }) =>
  ["/records", "/explorer"].includes(href),
);
const ABOUT_LINKS = siteConfig.navLinks.filter(({ href }) =>
  ["/sources", "/about"].includes(href),
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
        component="p"
        sx={{ ...eyebrowSx, color: atlas.textMuted, mb: 2 }}
      >
        {heading}
      </Typography>
      <Stack spacing={1.25}>
        {links.map(({ label, href }) => (
          <Typography
            key={href}
            component={Link}
            href={href}
            variant="body2"
            sx={{
              color: atlas.textSecondary,
              width: "fit-content",
              transition: "color 150ms ease",
              "&:hover": { color: atlas.textPrimary },
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
        bgcolor: atlas.black,
        mt: "auto",
      }}
    >
      <Box
        sx={{
          maxWidth: 1440,
          mx: "auto",
          px: { xs: 2.5, sm: 4, md: 6 },
          pt: { xs: 6, md: 8 },
          pb: 0,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gap: { xs: 5, md: 6 },
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "minmax(0, 1.6fr) 1fr 1fr 1fr",
            },
          }}
        >
          {/* Brand block */}
          <Box sx={{ maxWidth: 360 }}>
            <Typography
              component="p"
              sx={{
                fontFamily: atlas.fontDisplay,
                fontWeight: 700,
                fontSize: "1.3rem",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: atlas.textPrimary,
              }}
            >
              WorldCup{" "}
              <Box component="span" sx={{ color: atlas.gold }}>
                Atlas
              </Box>
            </Typography>
            <VaultStripe width={56} sx={{ mt: 1, mb: 2.5 }} />
            <Typography variant="body2" sx={{ color: atlas.textSecondary }}>
              {siteConfig.description}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: atlas.textMuted, mt: 1.5 }}
            >
              {siteConfig.disclaimer}
            </Typography>
          </Box>
          <FooterColumn heading="Archive" links={ARCHIVE_LINKS} />
          <FooterColumn heading="Data" links={DATA_LINKS} />
          <FooterColumn heading="About" links={ABOUT_LINKS} />
        </Box>

        {/* Bottom attribution row */}
        <Box
          sx={{
            mt: { xs: 6, md: 8 },
            py: 3,
            borderTop: `1px solid ${atlas.border}`,
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            justifyContent: "space-between",
          }}
        >
          <Typography variant="caption" sx={{ color: atlas.textMuted }}>
            Historical data:{" "}
            <Typography
              component={Link}
              href="/sources"
              variant="caption"
              sx={{
                color: atlas.textSecondary,
                "&:hover": { color: atlas.textPrimary },
              }}
            >
              Fjelstul World Cup Database (CC-BY-SA 4.0)
            </Typography>
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: atlas.textMuted, letterSpacing: "0.08em" }}
          >
            An independent archive · not affiliated with FIFA
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
