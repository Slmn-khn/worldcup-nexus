"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import { usePathname } from "next/navigation";
import Link from "@/components/Link";
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
        bgcolor: "rgba(5, 10, 18, 0.85)",
        backgroundImage: "none",
        backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${atlas.border}`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            minHeight: { md: 68 },
            flexWrap: { xs: "wrap", md: "nowrap" },
            gap: { xs: 0.5, md: 3 },
            py: { xs: 1, md: 0 },
          }}
        >
          <Stack
            component={Link}
            href="/"
            aria-label="WorldCup Atlas home"
            direction="row"
            spacing={1.25}
            sx={{ flexShrink: 0, alignItems: "center" }}
          >
            <Box
              aria-hidden
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: atlas.goldTint,
                border: `1px solid ${atlas.goldBorder}`,
              }}
            >
              <EmojiEventsRoundedIcon
                sx={{ color: "primary.main", fontSize: 19 }}
              />
            </Box>
            <Typography
              variant="h6"
              component="span"
              sx={{
                color: "text.primary",
                fontFamily: atlas.fontDisplay,
                fontWeight: 700,
                fontSize: "1.05rem",
                letterSpacing: "-0.01em",
              }}
            >
              WorldCup{" "}
              <Box component="span" sx={{ color: "primary.main" }}>
                Atlas
              </Box>
            </Typography>
          </Stack>
          <Box
            component="nav"
            aria-label="Primary"
            sx={{
              display: "flex",
              gap: { xs: 0.25, md: 0.5 },
              ml: { md: "auto" },
              width: { xs: "100%", md: "auto" },
              overflowX: "auto",
              pb: { xs: 0.5, md: 0 },
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
              // Edge fade signals horizontal scroll on small screens.
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
                    px: 1.5,
                    py: 0.75,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    color: active ? "text.primary" : "text.secondary",
                    transition: "color 150ms ease",
                    "&:hover": { color: "text.primary" },
                    // Single active treatment: gold underline bar.
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      left: 12,
                      right: 12,
                      bottom: 2,
                      height: 2,
                      borderRadius: 1,
                      bgcolor: active ? "primary.main" : "transparent",
                      transition: "background-color 150ms ease",
                    },
                  }}
                >
                  {label}
                </Box>
              );
            })}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
