"use client";

// Reveals each direct child with staggered timing — used for card grids and
// lists. The container itself carries the layout `sx` (e.g. display: grid),
// and every child is wrapped in a full-height motion item so grid/flex
// layouts are preserved. Reduced motion → opacity-only.

import * as React from "react";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { motion, useReducedMotion } from "motion/react";

const MotionBox = motion.create(Box);

type StaggerContainerProps = {
  children: React.ReactNode;
  /** Layout styles for the container (grid templates, gaps, …). */
  sx?: SxProps<Theme>;
  /** Seconds between each child's reveal. */
  stagger?: number;
};

export default function StaggerContainer({
  children,
  sx,
  stagger = 0.06,
}: StaggerContainerProps) {
  const reducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.21, 0.65, 0.36, 1] as const },
    },
  };

  return (
    <MotionBox
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      sx={sx}
    >
      {React.Children.map(children, (child) => (
        <MotionBox variants={itemVariants} sx={{ height: "100%", minWidth: 0 }}>
          {child}
        </MotionBox>
      ))}
    </MotionBox>
  );
}
