"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { WORLD_SIZE } from "@/lib/world-data";

/**
 * The base of the Constellation World: a vast dreamlike twilight sky.
 * Sized to the full world canvas so it pans and zooms along with everything
 * else. Background stars twinkle gently; nebula glows drift very slowly.
 */
export default function EmotionalSky() {
  const backgroundStars = useMemo(
    () =>
      Array.from({ length: 160 }, (_, i) => ({
        id: i,
        x: Math.random() * WORLD_SIZE.width,
        y: Math.random() * WORLD_SIZE.height,
        size: 1 + Math.random() * 2,
        delay: Math.random() * 6,
        duration: 4 + Math.random() * 5,
      })),
    []
  );

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{ width: WORLD_SIZE.width, height: WORLD_SIZE.height }}
    >
      {/* Base twilight gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#AFC8FF] via-[#E8E1FF] to-[#FCFCFF]" />

      {/* Slow-drifting nebula glows */}
      <motion.div
        className="absolute h-[44rem] w-[44rem] rounded-full bg-[#FFE8D6]/40 blur-[120px]"
        style={{ left: WORLD_SIZE.width * 0.18, top: WORLD_SIZE.height * 0.12 }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 60, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute h-[40rem] w-[40rem] rounded-full bg-[#FFF4C7]/40 blur-[120px]"
        style={{ left: WORLD_SIZE.width * 0.62, top: WORLD_SIZE.height * 0.42 }}
        animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
        transition={{ duration: 70, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute h-[42rem] w-[42rem] rounded-full bg-[#E8E1FF]/50 blur-[130px]"
        style={{ left: WORLD_SIZE.width * 0.32, top: WORLD_SIZE.height * 0.68 }}
        animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
        transition={{ duration: 65, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute h-[38rem] w-[38rem] rounded-full bg-[#AFC8FF]/35 blur-[130px]"
        style={{ left: WORLD_SIZE.width * 0.84, top: WORLD_SIZE.height * 0.1 }}
        animate={{ x: [0, -30, 0], y: [0, 35, 0] }}
        transition={{ duration: 55, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Twinkling background stars - distant, decorative */}
      {backgroundStars.map((star) => (
        <motion.span
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{ left: star.x, top: star.y, width: star.size, height: star.size }}
          animate={{ opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: star.duration, repeat: Infinity, delay: star.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
