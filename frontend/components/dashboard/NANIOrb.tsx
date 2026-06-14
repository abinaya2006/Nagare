"use client";

import { motion } from "framer-motion";

interface NANIOrbProps {
  onClick: () => void;
  isOpen: boolean;
}

/**
 * NANI's physical presence on the dashboard: a small orb that breathes
 * gently and occasionally pulses, tucked in the bottom-right corner. Clicking
 * it opens the NANI sidebar.
 */
export default function NANIOrb({ onClick, isOpen }: NANIOrbProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="Open NANI, your AI companion"
      aria-expanded={isOpen}
      className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-lavender via-cloud to-sky shadow-glow-nani sm:bottom-8 sm:right-8"
      animate={{ scale: [1, 1.06, 1], opacity: isOpen ? 0 : 1 }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      whileHover={{ scale: 1.12, boxShadow: "0 0 42px rgba(232,225,255,1)" }}
      whileTap={{ scale: 0.95 }}
      style={{ pointerEvents: isOpen ? "none" : "auto" }}
    >
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-white/40 animate-pulse-glow"
      />
      <motion.span
        aria-hidden="true"
        className="relative h-7 w-7 rounded-full bg-white/80"
        animate={{ scale: [1, 1.18, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="sr-only">NANI - what are we untangling today?</span>
    </motion.button>
  );
}
