"use client";

// Cinematic homepage hero (Checkpoint 7C): layered gradient atmosphere,
// pitch lines, floating glow orbs with scroll parallax, and a staggered
// entrance for the headline, copy, CTAs, and search. Client component by
// design — it renders static copy only (no data fetching).

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion, useReducedMotion } from "motion/react";
import Link from "@/components/Link";
import PageContainer from "@/components/layout/PageContainer";
import GlobalSearch from "@/components/ui/GlobalSearch";
import AtlasBackground from "@/components/visual/AtlasBackground";
import PitchLines from "@/components/visual/PitchLines";
import HeroOrb from "@/components/visual/HeroOrb";
import FootballConstellation from "@/components/visual/FootballConstellation";
import ParallaxLayer from "@/components/motion/ParallaxLayer";

const MotionBox = motion.create(Box);

export default function HomeHero() {
  const reducedMotion = useReducedMotion();

  const entrance = (delay: number) => ({
    initial: { opacity: 0, y: reducedMotion ? 0 : 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, delay, ease: [0.21, 0.65, 0.36, 1] as const },
  });

  return (
    <Box
      sx={{
        position: "relative",
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "#050A12",
        overflow: "hidden",
      }}
    >
      <AtlasBackground variant="hero" />
      <PitchLines />
      <FootballConstellation variant="hero" intensity="medium" showBallNode />
      <ParallaxLayer
        drift={60}
        sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <HeroOrb size={420} color="gold" sx={{ top: -140, right: "8%" }} />
        <HeroOrb
          size={320}
          color="cyan"
          duration={20}
          sx={{ bottom: -150, left: "2%" }}
        />
      </ParallaxLayer>

      <PageContainer sx={{ position: "relative", py: { xs: 8, md: 12 } }}>
        <MotionBox {...entrance(0)}>
          <Typography
            variant="overline"
            sx={{
              color: "primary.main",
              letterSpacing: "0.2em",
              display: "block",
              mb: 2,
            }}
          >
            The Football Archive
          </Typography>
        </MotionBox>
        <MotionBox {...entrance(0.08)}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2.25rem", sm: "3rem", md: "3.75rem" },
              maxWidth: 820,
              mb: 2.5,
            }}
          >
            Explore the Complete History of the World Cup
          </Typography>
        </MotionBox>
        <MotionBox {...entrance(0.16)}>
          <Typography
            variant="h6"
            component="p"
            sx={{
              color: "text.secondary",
              fontWeight: 400,
              maxWidth: 640,
              mb: 4,
            }}
          >
            Every tournament, nation, player, match, goal, and penalty in one
            independent historical archive.
          </Typography>
        </MotionBox>
        <MotionBox {...entrance(0.24)}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 7 }}
          >
            <Button
              component={Link}
              href="/tournaments"
              variant="contained"
              size="large"
            >
              Explore Tournaments
            </Button>
            <Button
              component={Link}
              href="/records"
              variant="outlined"
              size="large"
            >
              View Records
            </Button>
          </Stack>
        </MotionBox>
        <MotionBox {...entrance(0.32)}>
          <Box sx={{ maxWidth: 720 }}>
            <GlobalSearch />
          </Box>
        </MotionBox>
      </PageContainer>
    </Box>
  );
}
