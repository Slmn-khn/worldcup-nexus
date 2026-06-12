"use client";

// Subtle scroll parallax for hero/background decoration. Transform/opacity
// only (GPU-friendly); completely static for reduced-motion users.

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

const MotionBox = motion.create(Box);

// Scroll distance (px) over which the parallax ranges interpolate.
const SCROLL_SPAN = 800;

type ParallaxLayerProps = {
  children: React.ReactNode;
  /** Pixels the layer drifts vertically over the scroll span (legacy alias for yRange). */
  drift?: number;
  /** [from, to] vertical offset in px across the scroll span. */
  yRange?: [number, number];
  /** [from, to] horizontal offset in px across the scroll span. */
  xRange?: [number, number];
  /** [from, to] opacity across the scroll span. */
  opacityRange?: [number, number];
  sx?: SxProps<Theme>;
};

export default function ParallaxLayer({
  children,
  drift = 60,
  yRange,
  xRange,
  opacityRange,
  sx,
}: ParallaxLayerProps) {
  const reducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const resolvedYRange = yRange ?? [0, drift];
  const y = useTransform(scrollY, [0, SCROLL_SPAN], resolvedYRange);
  const x = useTransform(scrollY, [0, SCROLL_SPAN], xRange ?? [0, 0]);
  const opacity = useTransform(
    scrollY,
    [0, SCROLL_SPAN],
    opacityRange ?? [1, 1],
  );

  if (reducedMotion) {
    return <Box sx={sx}>{children}</Box>;
  }
  return (
    <MotionBox style={{ y, x, opacity }} sx={sx}>
      {children}
    </MotionBox>
  );
}
