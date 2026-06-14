"use client";

import { motion } from "framer-motion";
import StarNode from "./StarNode";
import type { ConstellationProgress } from "@/hooks/useConstellationProgress";

interface ConstellationProps {
  progress: ConstellationProgress;
  onSelect: (progress: ConstellationProgress) => void;
}

// Glow colors tuned for a dark sky — soft, not harsh
const GLOW_BY_MEANING: Record<string, string> = {
  Creativity:     "#c4b5fd", // soft violet
  Execution:      "#fcd34d", // warm gold
  Learning:       "#93c5fd", // sky blue
  Curiosity:      "#a5f3fc", // aqua
  Consistency:    "#fde68a", // pale gold
  Planning:       "#bfdbfe", // ice blue
  Transformation: "#f9a8d4", // rose
};

export default function Constellation({ progress, onSelect }: ConstellationProps) {
  const { constellation, revealedStarCount, revealedConnections, unlocked } = progress;
  const glowColor = GLOW_BY_MEANING[constellation.meaning] ?? "#fde68a";

  if (revealedStarCount === 0) return null;

  const dxs = constellation.stars.map((s) => s.dx);
  const dys = constellation.stars.map((s) => s.dy);
  const pad = 60;
  const minX = Math.min(...dxs) - pad;
  const maxX = Math.max(...dxs) + pad;
  const minY = Math.min(...dys) - pad;
  const maxY = Math.max(...dys) + pad;
  const svgWidth  = maxX - minX;
  const svgHeight = maxY - minY;

  return (
    <div>
      {/* Soft halo once unlocked */}
      {unlocked && (
        <motion.div
          aria-hidden="true"
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px]"
          style={{
            left: constellation.center.x,
            top:  constellation.center.y,
            width: 320,
            height: 320,
            backgroundColor: `${glowColor}18`,
          }}
          animate={{ opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Connection lines */}
      {revealedConnections.length > 0 && (
        <svg
          aria-hidden="true"
          className="absolute"
          style={{
            left:   constellation.center.x + minX,
            top:    constellation.center.y + minY,
            width:  svgWidth,
            height: svgHeight,
            overflow: "visible",
          }}
        >
          {revealedConnections.map(([a, b], i) => {
            const starA = constellation.stars[a];
            const starB = constellation.stars[b];
            if (!starA || !starB) return null;
            return (
              <motion.line
                key={`${a}-${b}`}
                x1={starA.dx - minX} y1={starA.dy - minY}
                x2={starB.dx - minX} y2={starB.dy - minY}
                stroke={glowColor}
                strokeOpacity={0.35}
                strokeWidth={1}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.35 }}
                transition={{ duration: 1.4, delay: i * 0.15, ease: "easeInOut" }}
              />
            );
          })}
        </svg>
      )}

      {/* Stars */}
      {constellation.stars.slice(0, revealedStarCount).map((star, i) => (
        <StarNode
          key={i}
          x={constellation.center.x + star.dx}
          y={constellation.center.y + star.dy}
          size={star.size}
          glowColor={glowColor}
          label={constellation.name}
          onClick={() => onSelect(progress)}
        />
      ))}

      {/* Name label — appears when unlocked */}
      {unlocked && (
        <motion.button
          type="button"
          onClick={() => onSelect(progress)}
          className="absolute -translate-x-1/2 rounded-full px-3 py-1 font-display text-xs italic backdrop-blur-sm transition"
          style={{
            left: constellation.center.x,
            top:  constellation.center.y - 110,
            background: "rgba(10,14,40,0.55)",
            border: `1px solid ${glowColor}30`,
            color: glowColor,
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {constellation.name}
        </motion.button>
      )}
    </div>
  );
}
