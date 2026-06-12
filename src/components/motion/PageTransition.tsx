"use client";

// Lightweight entrance for route content (opacity + small rise), keyed by
// pathname so each navigation gets a fresh, fast reveal. Deliberately not a
// full exit/enter route transition — no layout risk, no blocking.

import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import { motion } from "motion/react";

const MotionBox = motion.create(Box);

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <MotionBox
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.21, 0.65, 0.36, 1] }}
      sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
    >
      {children}
    </MotionBox>
  );
}
