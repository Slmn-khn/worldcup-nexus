"use client";

import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import theme from "@/theme/theme";
import MotionProvider from "@/components/motion/MotionProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MotionProvider>{children}</MotionProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
