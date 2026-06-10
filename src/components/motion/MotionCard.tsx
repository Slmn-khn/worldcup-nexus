"use client";

// Interactive lift wrapper for clickable cards. Hover/tap use spring
// transforms; reduced-motion users keep only the CSS color/border
// transitions defined on the cards themselves (MotionConfig + the guard
// here skip the transforms).

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { motion, useReducedMotion } from "motion/react";

const MotionBox = motion.create(Box);

type MotionCardProps = {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
};

export default function MotionCard({ children, sx }: MotionCardProps) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) {
    return <Box sx={{ height: "100%", ...sx }}>{children}</Box>;
  }
  return (
    <MotionBox
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      sx={{ height: "100%", ...sx }}
    >
      {children}
    </MotionBox>
  );
}
