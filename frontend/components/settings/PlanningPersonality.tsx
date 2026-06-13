"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  PLANNING_PERSONALITY_INFO,
  type PlanningPersonality,
} from "@/types/settings";

interface PlanningPersonalityProps {
  value: PlanningPersonality | null;
  onChange: (personality: PlanningPersonality) => void;
}

const PERSONALITIES = Object.keys(PLANNING_PERSONALITY_INFO) as PlanningPersonality[];

/**
 * Question 7 - planning personality, shown as gently floating memory cards.
 * The selected card stays illuminated rather than "checked".
 */
export default function PlanningPersonality({ value, onChange }: PlanningPersonalityProps) {
  return (
    <div className="glass rounded-glass p-5 sm:p-6">
      <h2 className="font-display text-lg font-medium text-ink">Planning Personality</h2>
      <p className="mb-4 text-xs text-ink-soft">Which of these feels most like you?</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PERSONALITIES.map((personality, i) => {
          const selected = value === personality;
          return (
            <motion.button
              key={personality}
              type="button"
              onClick={() => onChange(personality)}
              aria-pressed={selected}
              className={`rounded-2xl px-4 py-4 text-left transition ${
                selected ? "bg-white/70 text-ink shadow-glow-lav" : "bg-white/35 text-ink-soft hover:bg-white/50"
              }`}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 7 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
            >
              <p className="text-sm font-medium">{PLANNING_PERSONALITY_INFO[personality].label}</p>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {value && (
          <motion.p
            key={value}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="mt-4 font-display text-sm italic text-ink-soft"
          >
            &ldquo;{PLANNING_PERSONALITY_INFO[value].lore}&rdquo;
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
