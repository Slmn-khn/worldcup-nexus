"use client";

import { createTheme } from "@mui/material/styles";
import { atlas } from "./tokens";
import { nexusColors, nexusGradients } from "./visualTokens";

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "dark",
    primary: {
      main: atlas.gold,
      light: atlas.goldStrong,
      contrastText: atlas.black,
    },
    secondary: {
      main: nexusColors.cyan,
      light: nexusColors.cyanStrong,
      contrastText: atlas.black,
    },
    background: {
      default: atlas.black,
      paper: atlas.surface1,
    },
    text: {
      primary: atlas.textPrimary,
      secondary: atlas.textSecondary,
    },
    divider: atlas.border,
    error: {
      main: atlas.cardRed,
    },
    warning: {
      main: atlas.yellow,
    },
    success: {
      main: atlas.pitchGreen,
    },
  },
  typography: {
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    // Display voice: condensed uppercase 700 — the "stamped" archive voice.
    h1: {
      fontFamily: atlas.fontDisplay,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.01em",
      lineHeight: 0.98,
    },
    h2: {
      fontFamily: atlas.fontDisplay,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.01em",
      lineHeight: 1.02,
    },
    h3: {
      fontFamily: atlas.fontDisplay,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.015em",
      lineHeight: 1.1,
    },
    h4: {
      fontFamily: atlas.fontDisplay,
      fontWeight: 700,
      letterSpacing: "0.015em",
      lineHeight: 1.15,
    },
    h5: {
      fontFamily: atlas.fontDisplay,
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h6: {
      fontFamily: atlas.fontDisplay,
      fontWeight: 600,
      letterSpacing: "0.02em",
      lineHeight: 1.25,
    },
    // Body voice: Inter Light — the "engineered" voice.
    body1: {
      fontSize: "1rem",
      fontWeight: 300,
      lineHeight: 1.55,
    },
    body2: {
      fontSize: "0.9rem",
      fontWeight: 300,
      lineHeight: 1.55,
    },
    subtitle1: {
      fontWeight: 400,
    },
    subtitle2: {
      fontWeight: 600,
    },
    overline: {
      fontSize: "0.75rem",
      fontWeight: 700,
      letterSpacing: "0.125em",
      lineHeight: 1.5,
    },
    caption: {
      fontSize: "0.78rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      fontSize: "0.875rem",
      textTransform: "uppercase",
      fontWeight: 700,
      letterSpacing: "0.11em",
    },
  },
  shape: {
    // Gentle rounding across inputs/cards/menus for the neon look. Components
    // that intentionally stay square still override to 0.
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: nexusColors.background,
          // App-wide deep-blue canvas with cyan/gold glow near the top.
          background: nexusGradients.page,
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          color: atlas.textPrimary,
          minHeight: "100vh",
        },
        a: {
          color: "inherit",
          textDecoration: "none",
        },
        "::selection": {
          backgroundColor: atlas.goldTint,
          color: atlas.textPrimary,
        },
        // Visible keyboard focus for every interactive element without
        // affecting mouse users.
        "a:focus-visible, button:focus-visible, [tabindex]:focus-visible": {
          outline: `2px solid ${atlas.goldStrong}`,
          outlineOffset: "2px",
        },
        "@media (prefers-reduced-motion: reduce)": {
          html: {
            scrollBehavior: "auto",
          },
          "*": {
            scrollBehavior: "auto !important",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: atlas.surface1,
          backgroundImage: "none",
          border: `1px solid ${atlas.border}`,
          boxShadow: "none",
          borderRadius: 14,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 0,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingInline: 28,
          minHeight: 48,
          boxShadow: "none",
          transition:
            "background-color 150ms ease, border-color 150ms ease, color 150ms ease",
          "&.MuiButton-sizeSmall": {
            minHeight: 38,
            paddingInline: 18,
            fontSize: "0.78rem",
          },
          // Primary action: white fill, black label — the Vault CTA.
          "&.MuiButton-containedPrimary": {
            backgroundColor: atlas.textPrimary,
            color: atlas.black,
            "&:hover": {
              backgroundColor: atlas.goldStrong,
            },
          },
          // Outline: transparent with white hairline.
          "&.MuiButton-outlined": {
            borderColor: atlas.textPrimary,
            color: atlas.textPrimary,
            "&:hover": {
              borderColor: atlas.goldStrong,
              color: atlas.goldStrong,
              backgroundColor: "transparent",
            },
          },
          "&.MuiButton-text:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.06)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
        sizeSmall: {
          fontSize: "0.7rem",
          height: 22,
        },
        outlined: {
          borderColor: atlas.border,
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: {
          fontSize: "0.78rem",
        },
        separator: {
          color: atlas.textMuted,
          marginLeft: 6,
          marginRight: 6,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: atlas.gold,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "uppercase",
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: atlas.textSecondary,
          "&.Mui-selected": {
            color: atlas.goldStrong,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 400,
          "&.Mui-focused": {
            color: atlas.textPrimary,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: atlas.surface1,
          borderRadius: 8,
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: nexusColors.cyan,
            borderWidth: 1,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: atlas.borderStrong,
          },
        },
        notchedOutline: {
          borderColor: atlas.border,
          transition: "border-color 150ms ease",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 10,
          border: `1px solid ${atlas.border}`,
          backgroundColor: atlas.surfaceSoft,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: atlas.border,
        },
        head: {
          textTransform: "uppercase",
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: atlas.textMuted,
        },
      },
    },
  },
});

export default theme;
