"use client";

// Reveals children with a gentle fade + rise when they enter the viewport.
// Server-rendered children pass straight through. Reduced-motion users get
// opacity-only (no transform), handled by useReducedMotion.

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { motion, useReducedMotion } from "motion/react";

const MotionBox = motion.create(Box);

type FadeInProps = {
  children: React.ReactNode;
  /** Seconds before the reveal starts. */
  delay?: number;
  /** Initial vertical offset in px. */
  y?: number;
  /** Animate only the first time the element enters the viewport. */
  once?: boolean;
  /** Seconds the reveal takes. */
  duration?: number;
  sx?: SxProps<Theme>;
};

export default function FadeIn({
  children,
  delay = 0,
  y = 18,
  once = true,
  duration = 0.55,
  sx,
}: FadeInProps) {
  const reducedMotion = useReducedMotion();
  return (
    <MotionBox
      initial={{ opacity: 0, y: reducedMotion ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "0px 0px -60px 0px" }}
      transition={{ duration, delay, ease: [0.21, 0.65, 0.36, 1] }}
      sx={sx}
    >
      {children}
    </MotionBox>
  );
}
