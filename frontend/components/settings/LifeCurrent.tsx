"use client";

import { motion } from "framer-motion";
import {
  LIFE_CURRENT_INFO,
  LIFE_CURRENT_ORDER,
  type LifeCurrentLevel,
} from "@/types/settings";

interface LifeCurrentProps {
  value: LifeCurrentLevel;
  onChange: (level: LifeCurrentLevel) => void;
}

const WIDTH_PERCENT: Record<LifeCurrentLevel, string> = {
  "mostly-free": "25%",
  "moderately-busy": "50%",
  "very-busy": "75%",
  "pure-chaos": "100%",
};

/**
 * Question 5 - "How packed is your average day?" The river itself widens
 * (and quickens) as life gets busier.
 */
export default function LifeCurrent({ value, onChange }: LifeCurrentProps) {
  return (
    <div className="glass rounded-glass p-5 sm:p-6">
      <h2 className="font-display text-lg font-medium text-ink">Life Current</h2>
      <p className="mb-4 text-xs text-ink-soft">How packed is your average day?</p>

      <div className="relative mb-5 h-10 w-full overflow-hidden rounded-full bg-white/30">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky via-lavender to-peach"
          animate={{ width: WIDTH_PERCENT[value] }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-white/40"
          animate={{ width: WIDTH_PERCENT[value] }}
          style={{ mixBlendMode: "soft-light" }}
          initial={false}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {LIFE_CURRENT_ORDER.map((level) => {
          const info = LIFE_CURRENT_INFO[level];
          const selected = value === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              aria-pressed={selected}
              className={`rounded-2xl px-3 py-3 text-left transition ${
                selected ? "bg-white/65 shadow-glow-lav" : "bg-white/30 hover:bg-white/45"
              }`}
            >
              <p className="text-sm font-medium text-ink">{info.label}</p>
              <p className="text-xs text-ink-soft">{info.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
