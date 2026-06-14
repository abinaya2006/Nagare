"use client";

import { motion } from "framer-motion";
import { Feather } from "lucide-react";

interface FlowEnergyTrackerProps {
  completedTasks: number;
  starFragments: number;
  onAddEnergy: () => void;
}

/**
 * A quiet readout of the world's only currency: Flow Energy. No bars, no
 * counters racing toward a goal - just a soft glow that grows, and a gentle
 * sense of how close the next change is.
 */
export default function FlowEnergyTracker({ completedTasks, starFragments, onAddEnergy }: FlowEnergyTrackerProps) {
  const toNextStar = (5 - (completedTasks % 5)) % 5 || 5;
  const glowScale = 0.9 + Math.min(starFragments / 100, 1) * 0.6;

  return (
    <div className="glass pointer-events-auto w-[min(90vw,300px)] rounded-glass p-5">
      <div className="flex items-center gap-3">
        <motion.div
          aria-hidden="true"
          className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-white via-[#FFF4C7] to-[#FFE8D6]"
          style={{ boxShadow: "0 0 24px rgba(255, 244, 199, 0.7)" }}
          animate={{ scale: [glowScale * 0.95, glowScale, glowScale * 0.95] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <div>
          <p className="font-display text-sm italic text-ink">Flow Energy</p>
          <p className="text-xs text-ink-soft">{starFragments} star fragments gathered</p>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-ink-soft">
        {toNextStar === 5
          ? "A new star is taking shape right now."
          : `${toNextStar} more settled thought${toNextStar === 1 ? "" : "s"} until a new star appears.`}
      </p>

      <button
        type="button"
        onClick={onAddEnergy}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-white/55 px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-white/75 hover:shadow-glow-lav"
      >
        <Feather size={14} aria-hidden="true" />
        Settle a thought
      </button>
    </div>
  );
}
