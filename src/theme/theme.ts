"use client";

import { createTheme } from "@mui/material/styles";
import { atlas } from "./tokens";

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "dark",
    primary: {
      main: atlas.gold,
      dark: atlas.goldSoft,
      contrastText: atlas.deepNavy,
    },
    // Single data/interaction accent.
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
      paper: atlas.surface1,
    },
    text: {
      primary: atlas.textPrimary,
      secondary: atlas.textSecondary,
    },
    divider: atlas.border,
    error: {
      main: atlas.red,
    },
    warning: {
      main: atlas.yellow,
    },
    success: {
      main: atlas.green,
      contrastText: atlas.deepNavy,
    },
  },
  typography: {
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    // Display face: modern technical sans for headings and big numbers.
    h1: {
      fontFamily: atlas.fontDisplay,
      fontWeight: 700,
      letterSpacing: "-0.03em",
      lineHeight: 1.05,
    },
    h2: {
      fontFamily: atlas.fontDisplay,
      fontWeight: 700,
      letterSpacing: "-0.02em",
      lineHeight: 1.1,
    },
    h3: {
      fontFamily: atlas.fontDisplay,
      fontWeight: 700,
      letterSpacing: "-0.015em",
      lineHeight: 1.15,
    },
    h4: {
      fontFamily: atlas.fontDisplay,
      fontWeight: 700,
      letterSpacing: "-0.01em",
      lineHeight: 1.2,
    },
    h5: {
      fontFamily: atlas.fontDisplay,
      fontWeight: 600,
    },
    h6: {
      fontFamily: atlas.fontDisplay,
      fontWeight: 600,
      letterSpacing: "0",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.9rem",
      lineHeight: 1.55,
    },
    overline: {
      fontSize: "0.7rem",
      fontWeight: 700,
      letterSpacing: "0.14em",
      lineHeight: 1.6,
    },
    caption: {
      fontSize: "0.78rem",
      lineHeight: 1.5,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: "0.01em",
    },
  },
  shape: {
    borderRadius: 12,
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
          backgroundColor: atlas.goldTint,
          color: atlas.textPrimary,
        },
        // Visible keyboard focus for every interactive element without
        // affecting mouse users.
        "a:focus-visible, button:focus-visible, [tabindex]:focus-visible": {
          outline: `2px solid ${atlas.gold}`,
          outlineOffset: "2px",
          borderRadius: "4px",
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
          border: `1px solid ${atlas.border}`,
          boxShadow: atlas.shadowSm,
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          paddingInline: 18,
          transition:
            "background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, color 180ms ease",
          "&.MuiButton-containedPrimary": {
            boxShadow: atlas.shadowSm,
          },
          "&.MuiButton-containedPrimary:hover": {
            backgroundColor: atlas.goldSoft,
            boxShadow: atlas.shadowMd,
          },
          "&.MuiButton-outlined": {
            borderColor: atlas.borderStrong,
            color: atlas.textPrimary,
          },
          "&.MuiButton-outlined:hover": {
            borderColor: atlas.gold,
            backgroundColor: "rgba(244, 201, 93, 0.06)",
          },
          "&.MuiButton-text:hover": {
            backgroundColor: "rgba(248, 250, 252, 0.05)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 7,
        },
        sizeSmall: {
          fontSize: "0.72rem",
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
          fontSize: "0.8rem",
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
          textTransform: "none",
          fontWeight: 600,
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
          backgroundColor: atlas.surface1,
          borderRadius: 8,
          transition: "box-shadow 180ms ease",
          "&.Mui-focused": {
            boxShadow: `0 0 0 3px ${atlas.cyanSoft}`,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: atlas.cyan,
            borderWidth: 1,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: atlas.borderStrong,
          },
        },
        notchedOutline: {
          borderColor: atlas.border,
          transition: "border-color 180ms ease",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: atlas.border,
        },
      },
    },
  },
});

export default theme;
