"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ScheduleSlot } from "@/types/schedule";

interface FlowPreviewProps {
  slots: ScheduleSlot[];
  regenerating: boolean;
  onRegenerate: () => void;
}

export default function FlowPreview({
  slots,
  regenerating,
  onRegenerate,
}: FlowPreviewProps) {
  return (
    <div
      className="mb-6 rounded-2xl p-4"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span
          className="text-[11px] uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          Today's Recommended Flow
        </span>
        <button
          onClick={onRegenerate}
          disabled={regenerating}
          className="rounded-lg px-2.5 py-1 text-[11.5px] transition-all"
          style={{
            color: "#7C6FCD",
            border: "1px solid rgba(124,111,205,0.3)",
            background: regenerating ? "rgba(124,111,205,0.1)" : "none",
          }}
        >
          {regenerating ? "..." : "↺ Regenerate"}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {(slots ?? []).map((slot, i) => (
            <motion.div
              key={slot.time + slot.task}
              initial={{ opacity: 0, scale: 0.85, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{
                delay: i * 0.05,
                type: "spring",
                stiffness: 300,
                damping: 24,
              }}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span
                className="text-[11px]"
                style={{ color: "rgba(255,255,255,0.28)" }}
              >
                {slot.time}
              </span>
              <span
                className="text-[12px]"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                {slot.task}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
