"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { usePathname } from "next/navigation";
import Link from "@/components/Link";
import VaultStripe from "@/components/vault/VaultStripe";
import { siteConfig } from "@/lib/site";
import { atlas } from "@/theme/tokens";

const NAV_LINKS = siteConfig.navLinks;

export default function Navbar() {
  const pathname = usePathname();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(0, 0, 0, 0.92)",
        backgroundImage: "none",
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${atlas.border}`,
      }}
    >
      <Box sx={{ maxWidth: 1440, mx: "auto", width: "100%", px: { xs: 2.5, sm: 4, md: 6 } }}>
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 56, md: 64 },
            flexWrap: { xs: "wrap", md: "nowrap" },
            gap: { xs: 0.5, md: 4 },
            py: { xs: 1, md: 0 },
          }}
        >
          <Stack
            component={Link}
            href="/"
            aria-label="WorldCup Atlas home"
            sx={{ flexShrink: 0 }}
          >
            <Typography
              component="span"
              sx={{
                fontFamily: atlas.fontDisplay,
                fontWeight: 700,
                fontSize: "1.15rem",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: atlas.textPrimary,
                lineHeight: 1.1,
              }}
            >
              WorldCup{" "}
              <Box component="span" sx={{ color: atlas.gold }}>
                Atlas
              </Box>
            </Typography>
            <VaultStripe width={44} sx={{ mt: 0.5, height: "3px" }} />
          </Stack>
          <Box
            component="nav"
            aria-label="Primary"
            sx={{
              display: "flex",
              gap: { xs: 1.5, md: 2.5 },
              ml: { md: "auto" },
              width: { xs: "100%", md: "auto" },
              overflowX: "auto",
              pb: { xs: 0.5, md: 0 },
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
              maskImage: {
                xs: "linear-gradient(to right, black 92%, transparent)",
                md: "none",
              },
            }}
          >
            {NAV_LINKS.map(({ label, href }) => {
              const active =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Box
                  key={href}
                  component={Link}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  sx={{
                    position: "relative",
                    py: 0.75,
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    letterSpacing: "0.11em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    color: active ? atlas.textPrimary : atlas.textMuted,
                    transition: "color 150ms ease",
                    "&:hover": { color: atlas.textPrimary },
                    // Active marker: 2px white underline (category-tab style).
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: 2,
                      bgcolor: active ? atlas.textPrimary : "transparent",
                    },
                  }}
                >
                  {label}
                </Box>
              );
            })}
          </Box>
        </Toolbar>
      </Box>
    </AppBar>
  );
}
