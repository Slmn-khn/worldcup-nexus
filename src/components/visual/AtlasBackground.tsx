// Cinematic atmospheric background: layered radial gradients (trophy-gold
// glow, electric-cyan data light, pitch-green energy, and a rare purple
// depth pass) behind hero/section content. Pure CSS, server-safe,
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
            ? "radial-gradient(ellipse 80% 60% at 70% -10%, rgba(244, 201, 93, 0.13), transparent 70%), " +
              "radial-gradient(ellipse 55% 45% at -5% 30%, rgba(34, 211, 238, 0.08), transparent 70%), " +
              "radial-gradient(ellipse 60% 50% at 15% 110%, rgba(163, 230, 53, 0.07), transparent 70%), " +
              "radial-gradient(ellipse 45% 40% at 95% 75%, rgba(139, 92, 246, 0.07), transparent 70%)"
            : "radial-gradient(ellipse 70% 70% at 80% -20%, rgba(244, 201, 93, 0.07), transparent 70%), " +
              "radial-gradient(ellipse 50% 50% at 5% 110%, rgba(34, 211, 238, 0.05), transparent 70%)",
      }}
    />
  );
}
