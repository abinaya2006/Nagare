"use client";

import { motion } from "framer-motion";

interface StarNodeProps {
  x: number;
  y: number;
  size: number;
  onClick?: () => void;
  label?: string;
  glowColor?: string;
}

/**
 * A single star: a soft glowing point of light that pulses slowly. Stars are
 * placed in absolute world coordinates so they stay put as the sky pans and
 * zooms around them.
 */
export default function StarNode({ x, y, size, onClick, label, glowColor = "#FFF4C7" }: StarNodeProps) {
  const diameter = 6 + size * 6;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label ? `${label} star` : "Star"}
      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full"
      style={{
        left: x,
        top: y,
        width: diameter,
        height: diameter,
        backgroundColor: "#FFFFFF",
        boxShadow: `0 0 ${10 * size}px ${4 * size}px ${glowColor}66`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0.7, 1, 0.7], scale: 1 }}
      transition={{
        opacity: { duration: 3 + size, repeat: Infinity, ease: "easeInOut" },
        scale: { type: "spring", stiffness: 120, damping: 14 },
      }}
      whileHover={{ scale: 1.6 }}
      whileTap={{ scale: 1.3 }}
    />
  );
}
