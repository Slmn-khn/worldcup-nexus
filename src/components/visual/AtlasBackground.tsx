// Subtle atmospheric background: a restrained gold light source with a faint
// cyan counter-light and a soft vignette. Pure CSS, server-safe,
// pointer-events disabled so it never blocks interaction or harms contrast.

import Box from "@mui/material/Box";

export default function AtlasBackground({
  variant = "hero",
}: {
  variant?: "hero" | "section";
}) {
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        background:
          variant === "hero"
            ? "radial-gradient(ellipse 75% 60% at 72% -12%, rgba(244, 201, 93, 0.1), transparent 68%), " +
              "radial-gradient(ellipse 50% 45% at -5% 60%, rgba(56, 189, 248, 0.06), transparent 70%), " +
              "radial-gradient(ellipse 120% 60% at 50% 115%, rgba(2, 6, 14, 0.55), transparent 70%)"
            : "radial-gradient(ellipse 70% 70% at 80% -20%, rgba(244, 201, 93, 0.06), transparent 70%)",
      }}
    />
  );
}
