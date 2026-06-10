// Subtle atmospheric background: layered radial gradients (gold trophy glow
// + green pitch glow) behind hero/section content. Pure CSS, server-safe,
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
            ? "radial-gradient(ellipse 80% 60% at 70% -10%, rgba(244, 201, 93, 0.14), transparent 70%), " +
              "radial-gradient(ellipse 60% 50% at 15% 110%, rgba(31, 122, 77, 0.16), transparent 70%), " +
              "radial-gradient(ellipse 40% 35% at 95% 70%, rgba(244, 201, 93, 0.05), transparent 70%)"
            : "radial-gradient(ellipse 70% 70% at 80% -20%, rgba(244, 201, 93, 0.08), transparent 70%)",
      }}
    />
  );
}
