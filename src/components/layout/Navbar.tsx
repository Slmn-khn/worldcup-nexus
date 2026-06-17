"use client";

import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { usePathname } from "next/navigation";
import Link from "@/components/Link";
import VaultStripe from "@/components/vault/VaultStripe";
import { siteConfig } from "@/lib/site";
import { atlas } from "@/theme/tokens";
import { atlasBorders } from "@/theme/visualTokens";

const NAV_LINKS = siteConfig.navLinks;

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function BrandWordmark({ size = "1.15rem" }: { size?: string }) {
  return (
    <Typography
      component="span"
      sx={{
        fontFamily: atlas.fontDisplay,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "0.04em",
        color: atlas.textPrimary,
        lineHeight: 1.1,
      }}
    >
      {/* Exact brand casing — no text-transform on the wordmark. */}
      WORLDCUP{" "}
      <Box component="span" sx={{ color: atlas.gold }}>
        Nexus
      </Box>
    </Typography>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  // Each drawer link closes the menu on click (see onClick below), and the
  // Drawer closes on backdrop/Esc via onClose — so no route-change effect is
  // needed to keep the menu in sync.

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(4, 12, 22, 0.72)",
        backgroundImage: "none",
        backdropFilter: "blur(16px) saturate(140%)",
        borderBottom: `1px solid ${atlasBorders.soft}`,
      }}
    >
      <Box
        sx={{
          maxWidth: 1440,
          mx: "auto",
          width: "100%",
          px: { xs: 2.5, sm: 4, md: 6 },
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 56, md: 64 },
            gap: 2,
          }}
        >
          <Stack
            component={Link}
            href="/"
            aria-label="WORLDCUP Nexus home"
            sx={{ flexShrink: 0 }}
          >
            <BrandWordmark />
            <VaultStripe width={44} sx={{ mt: 0.5, height: "3px" }} />
          </Stack>

          {/* Desktop nav — inline links from md up. */}
          <Box
            component="nav"
            aria-label="Primary"
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 2.5,
              ml: "auto",
            }}
          >
            {NAV_LINKS.map(({ label, href }) => {
              const active = isActive(pathname, href);
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

          {/* Mobile menu button — hamburger below md. */}
          <IconButton
            edge="end"
            aria-label="Open navigation menu"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              ml: "auto",
              color: atlas.textPrimary,
              borderRadius: 0,
            }}
          >
            <MenuRoundedIcon />
          </IconButton>
        </Toolbar>
      </Box>

      {/* Mobile navigation drawer — full-height black sheet, hairline rows,
          zero radius, uppercase labels with an active stripe marker. */}
      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: "min(86vw, 360px)",
              bgcolor: atlas.black,
              backgroundImage: "none",
              borderLeft: `1px solid ${atlas.border}`,
            },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Drawer header: stripe accent, brand, close. */}
          <Box sx={{ px: 2.5, pt: 2, pb: 2 }}>
            <VaultStripe width={44} sx={{ mb: 1.5, height: "3px" }} />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <BrandWordmark />
              <IconButton
                aria-label="Close navigation menu"
                onClick={() => setMenuOpen(false)}
                sx={{ color: atlas.textPrimary, borderRadius: 0, mr: -1 }}
              >
                <CloseRoundedIcon />
              </IconButton>
            </Box>
          </Box>

          <Box
            component="nav"
            aria-label="Primary"
            sx={{ borderTop: `1px solid ${atlas.border}` }}
          >
            {NAV_LINKS.map(({ label, href }) => {
              const active = isActive(pathname, href);
              return (
                <Box
                  key={href}
                  component={Link}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    minHeight: 52,
                    px: 2.5,
                    borderBottom: `1px solid ${atlas.border}`,
                    // Active marker: a left identity stripe, not a pill fill.
                    borderLeft: "3px solid",
                    borderLeftColor: active ? atlas.gold : "transparent",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    letterSpacing: "0.11em",
                    textTransform: "uppercase",
                    color: active ? atlas.textPrimary : atlas.textSecondary,
                    transition: "color 150ms ease, background-color 150ms ease",
                    "&:hover": {
                      color: atlas.textPrimary,
                      bgcolor: atlas.surfaceSoft,
                    },
                  }}
                >
                  {label}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
}
