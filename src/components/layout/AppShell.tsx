import Box from "@mui/material/Box";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PageTransition from "@/components/motion/PageTransition";
import { nexusColors, nexusBackgrounds } from "@/theme/visualTokens";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        // App-wide canvas: solid deep-navy fallback + subtle brand texture under
        // a strong dark overlay. Scroll attachment on mobile (fixed is janky);
        // fixed on desktop for a parallax-free static glow. Decorative only —
        // the overlay keeps all content readable if the image is absent.
        backgroundColor: nexusColors.background,
        backgroundImage: nexusBackgrounds.pageWithImage,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: { xs: "scroll", md: "fixed" },
        backgroundRepeat: "no-repeat",
      }}
    >
      <Navbar />
      <Box
        component="main"
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <PageTransition>{children}</PageTransition>
      </Box>
      <Footer />
    </Box>
  );
}
