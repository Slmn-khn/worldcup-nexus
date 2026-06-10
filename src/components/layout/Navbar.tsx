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

const NAV_LINKS = [
  { label: "Tournaments", href: "/tournaments" },
  { label: "Countries", href: "/countries" },
  { label: "Players", href: "/players" },
  { label: "Matches", href: "/matches" },
  { label: "Records", href: "/records" },
  { label: "Explorer", href: "/explorer" },
  { label: "Sources", href: "/sources" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(6, 17, 31, 0.88)",
        backgroundImage: "none",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            flexWrap: { xs: "wrap", md: "nowrap" },
            gap: { xs: 0.5, md: 3 },
            py: { xs: 1, md: 0 },
          }}
        >
          <Stack
            component={Link}
            href="/"
            direction="row"
            spacing={1}
            sx={{
              flexShrink: 0,
              alignItems: "center",
              "&:hover .brand-gold": { color: "#C9A13F" },
            }}
          >
            <EmojiEventsRoundedIcon sx={{ color: "primary.main" }} />
            <Typography
              variant="h6"
              component="span"
              sx={{
                color: "text.primary",
                fontFamily: "var(--font-serif), Georgia, serif",
              }}
            >
              WorldCup{" "}
              <Box
                component="span"
                className="brand-gold"
                sx={{ color: "primary.main" }}
              >
                Atlas
              </Box>
            </Typography>
          </Stack>
          <Box
            component="nav"
            aria-label="Primary"
            sx={{
              display: "flex",
              gap: 0.5,
              ml: { md: "auto" },
              width: { xs: "100%", md: "auto" },
              overflowX: "auto",
              pb: { xs: 0.5, md: 0 },
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
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
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 1,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    color: active ? "primary.main" : "text.secondary",
                    bgcolor: active ? "rgba(244, 201, 93, 0.1)" : "transparent",
                    transition: "color 150ms ease, background-color 150ms ease",
                    "&:hover": {
                      color: "text.primary",
                      bgcolor: "rgba(248, 250, 252, 0.06)",
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
