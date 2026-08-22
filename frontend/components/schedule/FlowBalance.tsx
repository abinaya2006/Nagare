"use client";

import { motion } from "framer-motion";
interface FlowBalanceProps {
  score: number;
  isLoading?: boolean;
}
export default function FlowBalance({
  score,
  isLoading = false,
}: FlowBalanceProps) {
  const state = score < 30 ? "dry" : score > 85 ? "turbulent" : "balanced";
  const color =
    state === "dry" ? "#82C4F8" : state === "turbulent" ? "#FF8B6B" : "#4ECDC4";

  return (
    <div className="flex flex-col items-end gap-1">
      <span
        className="text-[11px] uppercase tracking-widest"
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        Flow Balance
      </span>
      <motion.span
        key={score}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[22px] font-semibold"
        style={{ color, textShadow: `0 0 20px ${color}40` }}
      >
        {score}%
      </motion.span>
      {/* River bar */}
      <div
        className="relative h-[7px] w-[160px] overflow-hidden rounded-full"
        style={{ background: "rgba(255,255,255,0.07)" }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}, #7C6FCD)`,
            boxShadow: `0 0 10px ${color}60`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
        />
        {/* Shimmer */}
        <motion.div
          className="absolute inset-y-0 w-12 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
          }}
          animate={{ x: [-48, 200] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 1,
          }}
        />
      </div>
    </div>
  );
}
