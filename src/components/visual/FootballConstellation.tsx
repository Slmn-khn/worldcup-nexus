"use client";

// Football constellation — the WorldCup Atlas visual signature. Football
// history rendered as glowing constellation nodes (countries, matches,
// tournaments, players as connected data points) over the dark stadium sky.
//
// Deliberately NOT a particle effect: every variant is a hand-crafted,
// deterministic constellation (optionally jittered by a seeded PRNG), so the
// same layout renders on server and client and reads as mapped history
// rather than random decoration.
//
// Decorative only: aria-hidden, pointer-events none, very low opacity.
// Animation is opacity pulses on node halos plus one slow drift of the whole
// constellation (lines move with their nodes). Reduced motion renders the
// same constellation fully static at slightly lower opacity.

import Box from "@mui/material/Box";
import { motion, useReducedMotion } from "motion/react";
import { atlas } from "@/theme/tokens";

const MotionG = motion.g;
const MotionCircle = motion.circle;

type Variant = "hero" | "records" | "match" | "explorer" | "subtle";
type Intensity = "low" | "medium" | "high";

type NodeDef = {
  x: number;
  y: number;
  r: number;
  color: string;
  /** Halo slowly pulses (a few per variant, never all). */
  pulse?: boolean;
  /** Hidden below the md breakpoint to keep mobile at 5–8 nodes. */
  desktopOnly?: boolean;
};

type Layout = {
  nodes: NodeDef[];
  /** Index pairs into `nodes`. Edges touching a desktopOnly node hide with it. */
  edges: [number, number][];
  /** Node indices connected to the central ball node (when shown). */
  ballEdges: number[];
  ball: { x: number; y: number };
  lineColor: string;
};

const GOLD = atlas.gold;
const CYAN = atlas.cyan;
const GREEN = atlas.green;

// All layouts share a 1000×600 viewBox (preserveAspectRatio slice covers the
// container on any aspect ratio).
const LAYOUTS: Record<Variant, Layout> = {
  // Most visible: history spread across the whole sky, ball node center-right.
  hero: {
    nodes: [
      { x: 120, y: 140, r: 4, color: GOLD, pulse: true },
      { x: 240, y: 90, r: 3, color: CYAN },
      { x: 360, y: 170, r: 3.5, color: GOLD, pulse: true, desktopOnly: true },
      { x: 480, y: 80, r: 3, color: GREEN },
      { x: 590, y: 150, r: 4, color: CYAN, pulse: true },
      { x: 820, y: 100, r: 4, color: GOLD, pulse: true },
      { x: 920, y: 200, r: 3, color: CYAN, desktopOnly: true },
      { x: 150, y: 420, r: 3.5, color: GREEN, desktopOnly: true },
      { x: 300, y: 500, r: 4, color: CYAN, pulse: true },
      { x: 450, y: 430, r: 3, color: GOLD, desktopOnly: true },
      { x: 620, y: 480, r: 4, color: GOLD, pulse: true },
      { x: 780, y: 400, r: 3, color: GREEN, desktopOnly: true },
      { x: 880, y: 520, r: 3.5, color: CYAN, desktopOnly: true },
      { x: 60, y: 300, r: 3, color: CYAN, desktopOnly: true },
    ],
    edges: [
      [0, 1],
      [1, 3],
      [3, 4],
      [8, 10],
      [1, 2],
      [2, 3],
      [5, 6],
      [7, 8],
      [9, 10],
      [10, 11],
      [11, 12],
      [13, 0],
      [7, 13],
      [9, 4],
    ],
    ballEdges: [4, 5, 10],
    ball: { x: 720, y: 290 },
    lineColor: GOLD,
  },
  // Connected achievement stars: a gold arc rising left to right.
  records: {
    nodes: [
      { x: 100, y: 450, r: 4, color: GOLD, pulse: true },
      { x: 220, y: 360, r: 3, color: GOLD },
      { x: 340, y: 290, r: 4, color: GOLD, pulse: true },
      { x: 470, y: 250, r: 3, color: GOLD },
      { x: 600, y: 230, r: 4.5, color: GOLD, pulse: true },
      { x: 730, y: 260, r: 3, color: GOLD, desktopOnly: true },
      { x: 850, y: 330, r: 3.5, color: GOLD, desktopOnly: true },
      { x: 300, y: 120, r: 3, color: CYAN, desktopOnly: true },
      { x: 520, y: 100, r: 4, color: GOLD, pulse: true, desktopOnly: true },
      { x: 740, y: 120, r: 3, color: CYAN, desktopOnly: true },
      { x: 920, y: 180, r: 3, color: GREEN, desktopOnly: true },
      { x: 160, y: 200, r: 3, color: GOLD, desktopOnly: true },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [7, 8],
      [8, 9],
      [9, 10],
      [11, 7],
      [2, 7],
      [4, 8],
    ],
    ballEdges: [4],
    ball: { x: 600, y: 230 },
    lineColor: GOLD,
  },
  // Two team clusters joined through a single pitch-green node — the
  // scoreline as the connecting star.
  match: {
    nodes: [
      { x: 140, y: 200, r: 4, color: GOLD, pulse: true },
      { x: 250, y: 140, r: 3, color: GOLD },
      { x: 220, y: 320, r: 3.5, color: GOLD, desktopOnly: true },
      { x: 340, y: 240, r: 4, color: GOLD, pulse: true },
      { x: 120, y: 400, r: 3, color: GOLD, desktopOnly: true },
      { x: 860, y: 200, r: 4, color: CYAN, pulse: true },
      { x: 750, y: 140, r: 3, color: CYAN },
      { x: 780, y: 320, r: 3.5, color: CYAN, desktopOnly: true },
      { x: 660, y: 240, r: 4, color: CYAN, pulse: true },
      { x: 880, y: 400, r: 3, color: CYAN, desktopOnly: true },
      { x: 500, y: 280, r: 4.5, color: GREEN, pulse: true },
    ],
    edges: [
      [0, 1],
      [1, 3],
      [3, 10],
      [8, 10],
      [6, 8],
      [5, 6],
      [0, 2],
      [2, 3],
      [4, 2],
      [5, 7],
      [7, 8],
      [9, 7],
    ],
    ballEdges: [10],
    ball: { x: 500, y: 280 },
    lineColor: CYAN,
  },
  // Data-network feel: loose grid rows, cyan-heavy.
  explorer: {
    nodes: [
      { x: 100, y: 120, r: 3, color: CYAN },
      { x: 320, y: 100, r: 4, color: CYAN, pulse: true },
      { x: 540, y: 130, r: 3, color: CYAN },
      { x: 760, y: 90, r: 4, color: CYAN, pulse: true, desktopOnly: true },
      { x: 940, y: 150, r: 3, color: CYAN, desktopOnly: true },
      { x: 180, y: 300, r: 4, color: CYAN, pulse: true },
      { x: 420, y: 280, r: 3.5, color: GOLD },
      { x: 660, y: 310, r: 3, color: CYAN, desktopOnly: true },
      { x: 880, y: 300, r: 3, color: GREEN, desktopOnly: true },
      { x: 100, y: 480, r: 3, color: GREEN, desktopOnly: true },
      { x: 340, y: 500, r: 3, color: CYAN, desktopOnly: true },
      { x: 580, y: 470, r: 4, color: CYAN, pulse: true },
      { x: 820, y: 490, r: 3, color: GOLD, desktopOnly: true },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [0, 5],
      [5, 6],
      [6, 1],
      [6, 11],
      [2, 11],
      [2, 3],
      [3, 4],
      [6, 7],
      [7, 8],
      [4, 8],
      [5, 9],
      [9, 10],
      [10, 11],
      [11, 12],
      [12, 8],
      [7, 3],
      [10, 6],
    ],
    ballEdges: [6],
    ball: { x: 420, y: 280 },
    lineColor: CYAN,
  },
  // Barely-there decorative layer for quieter surfaces.
  subtle: {
    nodes: [
      { x: 150, y: 150, r: 3, color: GOLD },
      { x: 400, y: 100, r: 3, color: CYAN, desktopOnly: true },
      { x: 650, y: 160, r: 3.5, color: GOLD, pulse: true },
      { x: 900, y: 120, r: 3, color: CYAN, desktopOnly: true },
      { x: 250, y: 450, r: 3.5, color: CYAN, pulse: true },
      { x: 550, y: 480, r: 3, color: GREEN },
      { x: 800, y: 430, r: 3, color: GOLD, desktopOnly: true },
      { x: 80, y: 350, r: 3, color: CYAN },
    ],
    edges: [
      [0, 2],
      [0, 7],
      [7, 4],
      [4, 5],
      [2, 3],
      [1, 2],
      [5, 6],
      [6, 3],
      [1, 0],
    ],
    ballEdges: [],
    ball: { x: 500, y: 300 },
    lineColor: CYAN,
  },
};

const INTENSITY_OPACITY: Record<Intensity, number> = {
  low: 0.5,
  medium: 0.75,
  high: 1,
};

// Deterministic PRNG (mulberry32) so a seed jitters the layout identically
// on server and client — Math.random would cause hydration mismatches.
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedToNumber(seed: string | number): number {
  if (typeof seed === "number") return Math.floor(seed);
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (Math.imul(hash, 31) + seed.charCodeAt(i)) | 0;
  }
  return hash;
}

/** Pentagon path centered on the origin, for the football seam pattern. */
function pentagonPath(radius: number): string {
  const points = Array.from({ length: 5 }, (_, i) => {
    const angle = (-90 + i * 72) * (Math.PI / 180);
    return `${(Math.cos(angle) * radius).toFixed(2)},${(Math.sin(angle) * radius).toFixed(2)}`;
  });
  return `M${points.join("L")}Z`;
}

function BallNode({
  x,
  y,
  animated,
}: {
  x: number;
  y: number;
  animated: boolean;
}) {
  const seams = Array.from({ length: 5 }, (_, i) => {
    const angle = (-90 + i * 72) * (Math.PI / 180);
    return {
      x1: (Math.cos(angle) * 6).toFixed(2),
      y1: (Math.sin(angle) * 6).toFixed(2),
      x2: (Math.cos(angle) * 13).toFixed(2),
      y2: (Math.sin(angle) * 13).toFixed(2),
    };
  });

  const halo = animated ? (
    <MotionCircle
      r={30}
      fill={GOLD}
      animate={{ opacity: [0.06, 0.14, 0.06] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />
  ) : (
    <circle r={30} fill={GOLD} opacity={0.08} />
  );

  return (
    <g transform={`translate(${x} ${y})`}>
      {halo}
      <circle
        r={14}
        fill={atlas.surface}
        stroke={GOLD}
        strokeWidth={1.2}
        opacity={0.9}
      />
      <path d={pentagonPath(6)} fill={GOLD} opacity={0.75} />
      {seams.map((seam, i) => (
        <line
          key={i}
          x1={seam.x1}
          y1={seam.y1}
          x2={seam.x2}
          y2={seam.y2}
          stroke={GOLD}
          strokeWidth={0.8}
          opacity={0.5}
        />
      ))}
    </g>
  );
}

function ConstellationNode({
  node,
  index,
  animated,
}: {
  node: NodeDef;
  index: number;
  animated: boolean;
}) {
  const haloRadius = node.r * 2.8;
  const halo =
    animated && node.pulse ? (
      <MotionCircle
        cx={node.x}
        cy={node.y}
        r={haloRadius}
        fill={node.color}
        animate={{ opacity: [0.12, 0.32, 0.12] }}
        transition={{
          duration: 4.5 + (index % 3) * 1.5,
          delay: (index % 5) * 0.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ) : (
      <circle
        cx={node.x}
        cy={node.y}
        r={haloRadius}
        fill={node.color}
        opacity={0.16}
      />
    );

  return (
    <>
      {halo}
      <circle cx={node.x} cy={node.y} r={node.r} fill={node.color} opacity={0.85} />
    </>
  );
}

type FootballConstellationProps = {
  variant?: Variant;
  intensity?: Intensity;
  /** Deterministically jitters node positions so instances differ. */
  seed?: string | number;
  showBallNode?: boolean;
};

export default function FootballConstellation({
  variant = "subtle",
  intensity = "medium",
  seed,
  showBallNode = variant === "hero",
}: FootballConstellationProps) {
  const reducedMotion = useReducedMotion();
  const animated = !reducedMotion;
  const layout = LAYOUTS[variant];

  // Jitter node positions with the seeded PRNG (same result on every render).
  const rand = mulberry32(seedToNumber(seed ?? variant));
  const nodes = layout.nodes.map((node) => ({
    ...node,
    x: node.x + (rand() * 2 - 1) * 16,
    y: node.y + (rand() * 2 - 1) * 12,
  }));

  // Edges touching a desktopOnly node hide with it below md.
  const isDesktopEdge = ([a, b]: [number, number]) =>
    Boolean(nodes[a].desktopOnly || nodes[b].desktopOnly);
  const mobileEdges = layout.edges.filter((edge) => !isDesktopEdge(edge));
  const desktopEdges = layout.edges.filter(isDesktopEdge);
  const mobileNodes = nodes
    .map((node, index) => ({ node, index }))
    .filter(({ node }) => !node.desktopOnly);
  const desktopNodes = nodes
    .map((node, index) => ({ node, index }))
    .filter(({ node }) => node.desktopOnly);

  const rootOpacity =
    INTENSITY_OPACITY[intensity] *
    (variant === "subtle" ? 0.6 : 1) *
    (reducedMotion ? 0.8 : 1);

  const renderEdge = ([a, b]: [number, number]) => (
    <line
      key={`${a}-${b}`}
      x1={nodes[a].x}
      y1={nodes[a].y}
      x2={nodes[b].x}
      y2={nodes[b].y}
      stroke={layout.lineColor}
      strokeWidth={1}
      opacity={0.13}
    />
  );

  const constellation = (
    <>
      {/* Connecting lines */}
      <g>{mobileEdges.map(renderEdge)}</g>
      <Box component="g" sx={{ display: { xs: "none", md: "block" } }}>
        {desktopEdges.map(renderEdge)}
      </Box>
      {showBallNode ? (
        <g>
          {layout.ballEdges.map((index) => (
            <line
              key={`ball-${index}`}
              x1={layout.ball.x}
              y1={layout.ball.y}
              x2={nodes[index].x}
              y2={nodes[index].y}
              stroke={layout.lineColor}
              strokeWidth={1}
              opacity={0.13}
            />
          ))}
        </g>
      ) : null}

      {/* Nodes */}
      {mobileNodes.map(({ node, index }) => (
        <ConstellationNode
          key={index}
          node={node}
          index={index}
          animated={animated}
        />
      ))}
      <Box component="g" sx={{ display: { xs: "none", md: "block" } }}>
        {desktopNodes.map(({ node, index }) => (
          <ConstellationNode
            key={index}
            node={node}
            index={index}
            animated={animated}
          />
        ))}
      </Box>

      {showBallNode ? (
        <BallNode x={layout.ball.x} y={layout.ball.y} animated={animated} />
      ) : null}
    </>
  );

  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        opacity: rootOpacity,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        style={{ display: "block" }}
      >
        {animated ? (
          // One slow drift of the whole constellation: lines and nodes move
          // together, so the sky breathes without the geometry detaching.
          <MotionG
            animate={{ y: [0, -10, 0], x: [0, 6, 0] }}
            transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
          >
            {constellation}
          </MotionG>
        ) : (
          <g>{constellation}</g>
        )}
      </svg>
    </Box>
  );
}
