"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { WORLD_SIZE } from "@/lib/world-data";

export default function EmotionalSky() {
  const backgroundStars = useMemo(
    () =>
      Array.from({ length: 220 }, (_, i) => ({
        id: i,
        x: Math.random() * WORLD_SIZE.width,
        y: Math.random() * WORLD_SIZE.height,
        size: 0.8 + Math.random() * 2.2,
        delay: Math.random() * 8,
        duration: 3 + Math.random() * 6,
      })),
    []
  );

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{ width: WORLD_SIZE.width, height: WORLD_SIZE.height }}
    >
      {/* ── Deep night sky base ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(175deg, #05081a 0%, #0d1230 30%, #111840 55%, #1a1235 80%, #0a0d1f 100%)",
        }}
      />

      {/* ── Nebula glows — muted purples/blues on dark ── */}
      <motion.div
        className="absolute rounded-full blur-[140px]"
        style={{
          width: 700, height: 700,
          left: WORLD_SIZE.width * 0.12,
          top: WORLD_SIZE.height * 0.08,
          background: "radial-gradient(circle, rgba(100,80,200,0.22) 0%, transparent 70%)",
        }}
        animate={{ x: [0, 55, 0], y: [0, 35, 0] }}
        transition={{ duration: 65, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full blur-[160px]"
        style={{
          width: 650, height: 650,
          left: WORLD_SIZE.width * 0.55,
          top: WORLD_SIZE.height * 0.35,
          background: "radial-gradient(circle, rgba(60,100,190,0.18) 0%, transparent 70%)",
        }}
        animate={{ x: [0, -45, 0], y: [0, 45, 0] }}
        transition={{ duration: 72, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full blur-[150px]"
        style={{
          width: 680, height: 680,
          left: WORLD_SIZE.width * 0.28,
          top: WORLD_SIZE.height * 0.62,
          background: "radial-gradient(circle, rgba(130,70,180,0.2) 0%, transparent 70%)",
        }}
        animate={{ x: [0, 38, 0], y: [0, -38, 0] }}
        transition={{ duration: 68, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full blur-[130px]"
        style={{
          width: 600, height: 600,
          left: WORLD_SIZE.width * 0.78,
          top: WORLD_SIZE.height * 0.08,
          background: "radial-gradient(circle, rgba(50,80,160,0.15) 0%, transparent 70%)",
        }}
        animate={{ x: [0, -28, 0], y: [0, 30, 0] }}
        transition={{ duration: 58, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* warm gold wisp far right */}
      <motion.div
        className="absolute rounded-full blur-[160px]"
        style={{
          width: 500, height: 500,
          left: WORLD_SIZE.width * 0.88,
          top: WORLD_SIZE.height * 0.55,
          background: "radial-gradient(circle, rgba(180,140,60,0.1) 0%, transparent 70%)",
        }}
        animate={{ x: [0, -20, 0], y: [0, 25, 0] }}
        transition={{ duration: 80, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Twinkling background stars ── */}
      {backgroundStars.map((star) => (
        <motion.span
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            background: star.id % 7 === 0
              ? "rgba(255,240,200,0.9)"   // warm gold
              : star.id % 5 === 0
              ? "rgba(180,200,255,0.85)"  // cool blue
              : "rgba(255,255,255,0.9)",  // white
          }}
          animate={{ opacity: [0.15, 0.85, 0.15] }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
