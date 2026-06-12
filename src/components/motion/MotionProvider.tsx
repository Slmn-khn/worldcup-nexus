"use client";

// App-wide motion configuration. reducedMotion="user" makes Motion respect
// the OS prefers-reduced-motion setting automatically (transform/layout
// animations are skipped; opacity and color still transition).

import { MotionConfig } from "motion/react";

export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
