"use client";

import { motion } from "framer-motion";
import { DISTRACTION_LABELS, type Distraction } from "@/types/settings";

interface DistractionStormProps {
  value: Distraction[];
  onToggle: (distraction: Distraction) => void;
}

const DISTRACTIONS = Object.keys(DISTRACTION_LABELS) as Distraction[];

/**
 * Question 4 - distractions, shown as drifting clouds. Tapping a cloud
 * darkens it slightly, like a little weather system forming over that part
 * of the day.
 */
export default function DistractionStorm({ value, onToggle }: DistractionStormProps) {
  return (
    <div className="glass rounded-glass p-5 sm:p-6">
      <h2 className="font-display text-lg font-medium text-ink">Distraction Storm</h2>
      <p className="mb-4 text-xs text-ink-soft">What tends to drift in and pull focus away?</p>

      <div className="flex flex-wrap gap-3">
        {DISTRACTIONS.map((distraction, i) => {
          const selected = value.includes(distraction);
          return (
            <motion.button
              key={distraction}
              type="button"
              onClick={() => onToggle(distraction)}
              aria-pressed={selected}
              className={`rounded-full px-4 py-2 text-sm transition ${
                selected ? "bg-ink/70 text-cloud shadow-inner" : "bg-white/45 text-ink-soft hover:bg-white/65"
              }`}
              animate={{ y: [0, -5, 0], x: [0, i % 2 === 0 ? 4 : -4, 0] }}
              transition={{ duration: 8 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
            >
              {DISTRACTION_LABELS[distraction]}
            </motion.button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-ink-soft">
        {value.length === 0
          ? "Clear skies, for now."
          : "A quiet weather report - nothing to fix, just to notice."}
      </p>
    </div>
  );
}
