"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "dark",
    primary: {
      main: "#F4C95D",
      contrastText: "#06111F",
    },
    secondary: {
      main: "#1F7A4D",
    },
    background: {
      default: "#06111F",
      paper: "#0E1A2A",
    },
    text: {
      primary: "#F8FAFC",
      secondary: "#CBD5E1",
    },
    divider: "#253449",
    error: {
      main: "#EF4444",
    },
    warning: {
      main: "#FACC15",
    },
    success: {
      main: "#22C55E",
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
          backgroundColor: "#06111F",
          color: "#F8FAFC",
        },
        a: {
          color: "inherit",
          textDecoration: "none",
        },
        // Visible keyboard focus for every interactive element (links,
        // buttons, card action areas) without affecting mouse users.
        "a:focus-visible, button:focus-visible, [tabindex]:focus-visible": {
          outline: "2px solid #F4C95D",
          outlineOffset: "2px",
          borderRadius: "4px",
        },
        // Reduced-motion fallback for CSS-driven motion. JS animations are
        // handled by MotionConfig reducedMotion="user".
        "@media (prefers-reduced-motion: reduce)": {
          "*": {
            scrollBehavior: "auto !important",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid #253449",
          boxShadow: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
          transition:
            "background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease",
          "&.MuiButton-containedPrimary:hover": {
            boxShadow: "0 6px 24px rgba(244, 201, 93, 0.28)",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: "#F4C95D",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700,
          color: "#CBD5E1",
          "&.Mui-selected": {
            color: "#F4C95D",
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#0E1A2A",
        },
        notchedOutline: {
          borderColor: "#253449",
        },
      },
    },
  },
});

export default theme;
