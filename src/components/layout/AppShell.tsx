import Box from "@mui/material/Box";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PageTransition from "@/components/motion/PageTransition";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
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
