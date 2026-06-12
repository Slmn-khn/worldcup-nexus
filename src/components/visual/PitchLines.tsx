// Subtle stadium-pitch line atmosphere: a faint centre circle and halfway
// line rendered with pure CSS gradients. Server-safe, very low opacity,
// pointer-events disabled.

import Box from "@mui/material/Box";

export default function PitchLines() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        opacity: 0.35,
        // Halfway line + faint horizontal mowing stripes, tinted with a
        // whisper of pitch green for stadium atmosphere.
        backgroundImage:
          "linear-gradient(to right, transparent calc(50% - 1px), rgba(163, 230, 53, 0.06) calc(50% - 1px), rgba(163, 230, 53, 0.06) calc(50% + 1px), transparent calc(50% + 1px)), " +
          "repeating-linear-gradient(to bottom, transparent 0px, transparent 79px, rgba(203, 213, 225, 0.02) 79px, rgba(203, 213, 225, 0.02) 80px)",
        // Centre circle.
        "&::after": {
          content: '""',
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 380,
          height: 380,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          border: "1px solid rgba(163, 230, 53, 0.07)",
        },
      }}
    />
  );
}
