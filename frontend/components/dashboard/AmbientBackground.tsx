"use client";

import { motion } from "framer-motion";

/**
 * Fixed, full-viewport backdrop: soft gradient base plus large blurred
 * "light blobs" that drift slowly to give the dashboard a living, breathing
 * quality without ever feeling busy.
 */
export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-sky via-cloud to-lavender"
    >
      <motion.div
        className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-lavender/60 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/4 -right-40 h-[32rem] w-[32rem] rounded-full bg-peach/50 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10rem] left-1/4 h-[26rem] w-[26rem] rounded-full bg-gold/50 blur-3xl"
        animate={{ x: [0, 25, 0], y: [0, -25, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-1/3 h-[22rem] w-[22rem] rounded-full bg-sky/70 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, -15, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Soft vignette so foreground glass surfaces stay legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/30" />
    </div>
  );
}
