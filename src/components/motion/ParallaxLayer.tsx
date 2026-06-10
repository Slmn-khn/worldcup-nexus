"use client";

// Subtle scroll parallax for hero/background decoration. Transform-only
// (GPU-friendly); completely static for reduced-motion users.

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

const MotionBox = motion.create(Box);

type ParallaxLayerProps = {
  children: React.ReactNode;
  /** Pixels the layer drifts over the first 800px of scroll (negative = up). */
  drift?: number;
  sx?: SxProps<Theme>;
};

export default function ParallaxLayer({
  children,
  drift = 60,
  sx,
}: ParallaxLayerProps) {
  const reducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, drift]);

  if (reducedMotion) {
    return <Box sx={sx}>{children}</Box>;
  }
  return (
    <MotionBox style={{ y }} sx={sx}>
      {children}
    </MotionBox>
  );
}
