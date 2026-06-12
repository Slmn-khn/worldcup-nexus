"use client";

// Decorative floating glow orb for the homepage hero. Slow, subtle,
// transform/opacity only; completely static for reduced-motion users.

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { motion, useReducedMotion } from "motion/react";

const MotionBox = motion.create(Box);

const ORB_GLOWS = {
  gold: "radial-gradient(circle, rgba(244, 201, 93, 0.13) 0%, transparent 65%)",
  green:
    "radial-gradient(circle, rgba(34, 197, 94, 0.09) 0%, transparent 65%)",
  cyan: "radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 65%)",
} as const;

type HeroOrbProps = {
  size?: number;
  color?: keyof typeof ORB_GLOWS;
  /** Seconds for one float cycle. */
  duration?: number;
  sx?: SxProps<Theme>;
};

export default function HeroOrb({
  size = 320,
  color = "gold",
  duration = 14,
  sx,
}: HeroOrbProps) {
  const reducedMotion = useReducedMotion();
  const glow = ORB_GLOWS[color];

  const base: SxProps<Theme> = {
    position: "absolute",
    width: size,
    height: size,
    borderRadius: "50%",
    background: glow,
    pointerEvents: "none",
    filter: "blur(2px)",
    ...sx,
  };

  if (reducedMotion) {
    return <Box aria-hidden sx={base} />;
  }
  return (
    <MotionBox
      aria-hidden
      animate={{ y: [0, -18, 0], opacity: [0.8, 1, 0.8] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
      sx={base}
    />
  );
}
