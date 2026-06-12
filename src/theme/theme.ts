"use client";

import { createTheme } from "@mui/material/styles";
import { atlas } from "./tokens";

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "dark",
    primary: {
      main: atlas.gold,
      contrastText: atlas.deepNavy,
    },
    // Interaction / active-UI accent (search focus, data panels).
    secondary: {
      main: atlas.cyan,
      contrastText: atlas.deepNavy,
    },
    info: {
      main: atlas.cyan,
      contrastText: atlas.deepNavy,
    },
    background: {
      default: atlas.bgBase,
      paper: atlas.surface,
    },
    text: {
      primary: atlas.textPrimary,
      secondary: atlas.textSecondary,
    },
    divider: atlas.border,
    error: {
      main: "#EF4444",
    },
    warning: {
      main: "#FACC15",
    },
    // Positive stats / pitch energy.
    success: {
      main: atlas.green,
      contrastText: atlas.deepNavy,
    },
  },
  typography: {
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    h1: {
      fontFamily: "var(--font-serif), Georgia, serif",
      fontWeight: 700,
      letterSpacing: "-0.04em",
    },
    h2: {
      fontFamily: "var(--font-serif), Georgia, serif",
      fontWeight: 700,
      letterSpacing: "-0.03em",
    },
    h3: {
      fontFamily: "var(--font-serif), Georgia, serif",
      fontWeight: 700,
    },
    h4: {
      fontFamily: "var(--font-serif), Georgia, serif",
      fontWeight: 700,
    },
    button: {
      textTransform: "none",
      fontWeight: 700,
      letterSpacing: "0.02em",
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: atlas.bgBase,
          color: atlas.textPrimary,
        },
        a: {
          color: "inherit",
          textDecoration: "none",
        },
        "::selection": {
          backgroundColor: atlas.goldGlow,
          color: atlas.textPrimary,
        },
        // Visible keyboard focus for every interactive element (links,
        // buttons, card action areas) without affecting mouse users.
        "a:focus-visible, button:focus-visible, [tabindex]:focus-visible": {
          outline: `2px solid ${atlas.gold}`,
          outlineOffset: "2px",
          borderRadius: "4px",
        },
        // Inputs announce focus with the interaction accent instead.
        "input:focus-visible, textarea:focus-visible": {
          outline: "none",
        },
        // Reduced-motion fallback for CSS-driven motion. JS animations are
        // handled by MotionConfig reducedMotion="user".
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
          background: atlas.cardGradient,
          backgroundImage: atlas.cardGradient,
          border: `1px solid ${atlas.goldBorder}`,
          boxShadow: "0 10px 30px rgba(2, 8, 20, 0.35)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
          transition:
            "background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease, color 200ms ease",
          "&.MuiButton-containedPrimary:hover": {
            boxShadow: `0 6px 28px ${atlas.goldGlow}`,
          },
          "&.MuiButton-outlined:hover": {
            boxShadow: `0 0 18px rgba(34, 211, 238, 0.14)`,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
        outlined: {
          borderColor: atlas.border,
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
          textTransform: "none",
          fontWeight: 700,
          color: atlas.textSecondary,
          "&.Mui-selected": {
            color: atlas.gold,
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
          "&.Mui-focused": {
            color: atlas.cyan,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: atlas.surface,
          transition: "box-shadow 200ms ease",
          "&.Mui-focused": {
            boxShadow: `0 0 0 1px ${atlas.cyan}, 0 0 20px rgba(34, 211, 238, 0.12)`,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: atlas.cyan,
            borderWidth: 1,
          },
        },
        notchedOutline: {
          borderColor: atlas.border,
        },
      },
    },
  },
});

export default theme;
