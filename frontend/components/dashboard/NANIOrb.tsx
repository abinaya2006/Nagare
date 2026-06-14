"use client";
import { motion } from "framer-motion";

interface NANIOrbProps {
  onClick: () => void;
  isOpen: boolean;
}

export default function NANIOrb({ onClick, isOpen }: NANIOrbProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="Open NANI, your AI companion"
      aria-expanded={isOpen}
      className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-purple-400 to-blue-400 shadow-glow-nani sm:bottom-8 sm:right-8"
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

      {/* Wind chime SVG */}
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        fill="none"
        className="relative h-6 w-6"
        animate={{ rotate: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Top bar */}
        <rect x="6" y="4" width="20" height="2.5" rx="1.25" fill="white" opacity="0.9" />
        {/* Hanging strings */}
        <line x1="10" y1="6.5" x2="10" y2="13" stroke="white" strokeWidth="1.2" opacity="0.7" />
        <line x1="16" y1="6.5" x2="16" y2="15" stroke="white" strokeWidth="1.2" opacity="0.7" />
        <line x1="22" y1="6.5" x2="22" y2="13" stroke="white" strokeWidth="1.2" opacity="0.7" />
        {/* Chime tubes */}
        <rect x="8" y="13" width="4" height="8" rx="2" fill="white" opacity="0.85" />
        <rect x="14" y="15" width="4" height="10" rx="2" fill="white" opacity="0.95" />
        <rect x="20" y="13" width="4" height="7" rx="2" fill="white" opacity="0.85" />
        {/* Clapper */}
        <motion.circle
          cx="16"
          cy="27"
          r="2"
          fill="white"
          opacity="0.9"
          animate={{ x: [-2, 2, -2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Clapper string */}
        <motion.line
          x1="16" y1="25" x2="16" y2="27"
          stroke="white" strokeWidth="1" opacity="0.6"
          animate={{ x1: [-2, 2, -2], x2: [-2, 2, -2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>

      <span className="sr-only">NANI - what are we untangling today?</span>
    </motion.button>
  );
}
