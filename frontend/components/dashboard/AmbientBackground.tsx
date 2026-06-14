"use client";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

export default function AmbientBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (isDark) {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0d0a1e 0%, #07051a 40%, #0a0620 70%, #0d0b26 100%)" }}
      >
        {/* Deep space nebula blobs — very muted, dark-on-dark */}
        <motion.div
          className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full blur-3xl"
          style={{ background: "rgba(100,80,200,0.08)" }}
          animate={{ x: [0, 35, 0], y: [0, 28, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/4 -right-40 h-[32rem] w-[32rem] rounded-full blur-3xl"
          style={{ background: "rgba(60,40,160,0.07)" }}
          animate={{ x: [0, -28, 0], y: [0, 38, 0] }}
          transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-10rem] left-1/4 h-[26rem] w-[26rem] rounded-full blur-3xl"
          style={{ background: "rgba(130,80,200,0.06)" }}
          animate={{ x: [0, 22, 0], y: [0, -22, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/3 h-[22rem] w-[22rem] rounded-full blur-3xl"
          style={{ background: "rgba(50,80,180,0.06)" }}
          animate={{ x: [0, -18, 0], y: [0, -14, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Subtle stars */}
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: 1 + Math.random() * 1.5,
              height: 1 + Math.random() * 1.5,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.15 + Math.random() * 0.3,
            }}
            animate={{ opacity: [0.1, 0.5, 0.1] }}
            transition={{ duration: 3 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 6, ease: "easeInOut" }}
          />
        ))}
      </div>
    );
  }

  // ── Light mode: Inside Out palette — soft warm emotional tones, not plain white ──
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{
        // Warm cream base — not white, feels like memory/nostalgia
        background: "linear-gradient(150deg, #F5F0FF 0%, #EEF6FF 35%, #FFF8F0 65%, #F8F4FF 100%)",
      }}
    >
      {/* Joy — warm golden blob */}
      <motion.div
        className="absolute -top-32 -left-24 h-[30rem] w-[30rem] rounded-full blur-3xl"
        style={{ background: "rgba(255,220,100,0.18)" }}
        animate={{ x: [0, 38, 0], y: [0, 28, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Sadness — soft blue */}
      <motion.div
        className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: "rgba(160,200,255,0.2)" }}
        animate={{ x: [0, -28, 0], y: [0, 35, 0] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Calm — lavender */}
      <motion.div
        className="absolute bottom-[-8rem] left-1/3 h-[26rem] w-[26rem] rounded-full blur-3xl"
        style={{ background: "rgba(200,185,255,0.2)" }}
        animate={{ x: [0, 22, 0], y: [0, -22, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Wonder — rose/peach */}
      <motion.div
        className="absolute top-1/2 left-1/4 h-[20rem] w-[20rem] rounded-full blur-3xl"
        style={{ background: "rgba(255,190,160,0.15)" }}
        animate={{ x: [0, -18, 0], y: [0, -18, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Subtle grain — keeps it from feeling flat */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 60% 20%, rgba(255,248,230,0.4) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}
