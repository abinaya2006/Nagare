"use client";

import { motion } from "framer-motion";

interface GenerateFlowButtonProps {
  loading: boolean;
  onClick: () => void;
}

export default function GenerateFlowButton({
  loading,
  onClick,
}: GenerateFlowButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      className="relative flex items-center gap-2 overflow-hidden rounded-full px-4 py-2.5 text-[13px] font-medium text-white"
      style={{
        background: "linear-gradient(135deg, #7C6FCD, #9B7EE8)",
        boxShadow: "0 4px 20px rgba(124,111,205,0.35)",
        border: "none",
        cursor: loading ? "default" : "pointer",
        fontFamily: "inherit",
      }}
      whileHover={
        !loading ? { y: -1, boxShadow: "0 6px 28px rgba(124,111,205,0.5)" } : {}
      }
      whileTap={!loading ? { scale: 0.97 } : {}}
      animate={loading ? { opacity: [1, 0.7, 1] } : { opacity: 1 }}
      transition={
        loading ? { duration: 1.4, repeat: Infinity } : { duration: 0.2 }
      }
    >
      {/* Shimmer on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
        }}
        animate={{ x: ["-100%", "200%"] }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 1.2,
        }}
      />
      <span>{loading ? "✨" : "✨"}</span>
      <span className="relative z-10">
        {loading ? "Flowing..." : "Generate Flow"}
      </span>
    </motion.button>
  );
}
