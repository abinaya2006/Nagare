"use client";

import { motion } from "framer-motion";

interface FlowRiverProps {
  /** how many islands are in this segment */
  count: number;
}

/** Animated light-stream connector drawn between task islands */
export function FlowRiver({ count }: FlowRiverProps) {
  if (count < 2) return null;
  return (
    <div className="flex justify-center">
      <div
        className="relative flex flex-col items-center"
        style={{ height: 28 }}
      >
        <motion.div
          className="w-px rounded-full"
          style={{
            height: 28,
            background:
              "linear-gradient(180deg, rgba(78,205,196,0.35), transparent)",
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* travelling dot */}
        <motion.div
          className="absolute top-0 h-1.5 w-1.5 rounded-full"
          style={{ background: "#4ECDC4", boxShadow: "0 0 6px #4ECDC4" }}
          animate={{ y: [0, 24] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 0.6,
          }}
        />
      </div>
    </div>
  );
}

/** Break pool between time segments */
export function BreakPool({
  label = "break",
  duration = "30m",
}: {
  label?: string;
  duration?: string;
}) {
  return (
    <div className="flex justify-center py-2">
      <motion.div
        className="flex flex-col items-center justify-center rounded-full"
        style={{
          width: 76,
          height: 76,
          background:
            "radial-gradient(circle at 40% 40%, rgba(78,205,196,0.14) 0%, rgba(78,205,196,0.04) 60%, transparent 100%)",
          border: "1px solid rgba(78,205,196,0.14)",
        }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-[10px]" style={{ color: "rgba(78,205,196,0.6)" }}>
          {label}
        </span>
        <span className="text-[11px] font-medium" style={{ color: "#4ECDC4" }}>
          {duration}
        </span>
      </motion.div>
    </div>
  );
}

/** Glowing deadline lighthouse */
export function DeadlineLighthouse({
  title,
  deadline,
}: {
  title: string;
  deadline: string;
}) {
  return (
    <div className="flex justify-center py-3">
      <motion.div
        className="flex items-center gap-2.5 rounded-full px-4 py-2"
        style={{
          background: "rgba(244,197,106,0.07)",
          border: "1px solid rgba(244,197,106,0.2)",
        }}
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(244,197,106,0)",
            "0 0 20px rgba(244,197,106,0.2)",
            "0 0 0 0 rgba(244,197,106,0)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <span style={{ fontSize: 17 }}>🔆</span>
        <div>
          <div
            className="text-[10px] uppercase tracking-widest"
            style={{ color: "rgba(244,197,106,0.45)" }}
          >
            Deadline ahead
          </div>
          <div className="text-[11.5px]" style={{ color: "#F4C56A" }}>
            {title} — {deadline}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
