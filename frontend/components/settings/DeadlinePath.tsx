"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  DEADLINE_PATH_INFO,
  type DeadlineRelationship,
} from "@/types/settings";

interface DeadlinePathProps {
  value: DeadlineRelationship | null;
  onChange: (relationship: DeadlineRelationship) => void;
}

const PATHS = Object.keys(DEADLINE_PATH_INFO) as DeadlineRelationship[];

/**
 * Question 6 - the user's relationship with deadlines, shown as four
 * pathways branching from a single point. The chosen path glows; NANI uses
 * it to shape how it schedules things later.
 */
export default function DeadlinePath({ value, onChange }: DeadlinePathProps) {
  return (
    <div className="glass rounded-glass p-5 sm:p-6">
      <h2 className="font-display text-lg font-medium text-ink">Deadline Relationship</h2>
      <p className="mb-4 text-xs text-ink-soft">How do deadlines usually find you?</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PATHS.map((path) => {
          const selected = value === path;
          return (
            <motion.button
              key={path}
              type="button"
              onClick={() => onChange(path)}
              aria-pressed={selected}
              whileHover={{ y: -3 }}
              className={`rounded-2xl border px-3 py-4 text-center text-sm font-medium transition ${
                selected
                  ? "border-white/80 bg-white/70 text-ink shadow-glow-lav"
                  : "border-white/40 bg-white/30 text-ink-soft hover:bg-white/50"
              }`}
            >
              {DEADLINE_PATH_INFO[path].label}
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
            &ldquo;{DEADLINE_PATH_INFO[value].lore}&rdquo;
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
