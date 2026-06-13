"use client";

import { motion } from "framer-motion";
import StarNode from "./StarNode";
import type { ConstellationProgress } from "@/hooks/useConstellationProgress";

interface ConstellationProps {
  progress: ConstellationProgress;
  onSelect: (progress: ConstellationProgress) => void;
}

const GLOW_BY_MEANING: Record<string, string> = {
  Creativity: "#E8E1FF",
  Execution: "#FFE8D6",
  Learning: "#AFC8FF",
  Curiosity: "#DDEEFF",
  Consistency: "#FFF4C7",
  Planning: "#AFC8FF",
  Transformation: "#FFE8D6",
};

/**
 * A cluster of stars that, once enough Flow Energy has gathered, connect
 * into a named constellation with its own quiet glow and a label inviting
 * the user to read its lore.
 */
export default function Constellation({ progress, onSelect }: ConstellationProps) {
  const { constellation, revealedStarCount, revealedConnections, unlocked } = progress;
  const glowColor = GLOW_BY_MEANING[constellation.meaning] ?? "#FFF4C7";

  if (revealedStarCount === 0) return null;

  const dxs = constellation.stars.map((s) => s.dx);
  const dys = constellation.stars.map((s) => s.dy);
  const pad = 60;
  const minX = Math.min(...dxs) - pad;
  const maxX = Math.max(...dxs) + pad;
  const minY = Math.min(...dys) - pad;
  const maxY = Math.max(...dys) + pad;
  const svgWidth = maxX - minX;
  const svgHeight = maxY - minY;

  return (
    <div>
      {/* Soft halo once unlocked */}
      {unlocked && (
        <motion.div
          aria-hidden="true"
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]"
          style={{
            left: constellation.center.x,
            top: constellation.center.y,
            width: 360,
            height: 360,
            backgroundColor: `${glowColor}55`,
          }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Connection lines */}
      {revealedConnections.length > 0 && (
        <svg
          aria-hidden="true"
          className="absolute"
          style={{
            left: constellation.center.x + minX,
            top: constellation.center.y + minY,
            width: svgWidth,
            height: svgHeight,
            overflow: "visible",
          }}
        >
          {revealedConnections.map(([a, b], i) => {
            const starA = constellation.stars[a];
            const starB = constellation.stars[b];
            return (
              <motion.line
                key={`${a}-${b}`}
                x1={starA.dx - minX}
                y1={starA.dy - minY}
                x2={starB.dx - minX}
                y2={starB.dy - minY}
                stroke="#FFFFFF"
                strokeOpacity={0.55}
                strokeWidth={1.5}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.55 }}
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

      {/* Label */}
      {unlocked && (
        <motion.button
          type="button"
          onClick={() => onSelect(progress)}
          className="absolute -translate-x-1/2 rounded-full px-3 py-1 font-display text-xs italic text-ink/80 backdrop-blur-sm transition hover:text-ink"
          style={{
            left: constellation.center.x,
            top: constellation.center.y - 100,
            backgroundColor: "rgba(255,255,255,0.35)",
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
