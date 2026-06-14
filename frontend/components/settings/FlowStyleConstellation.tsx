"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FLOW_STYLE_INFO, type FlowStyle } from "@/types/settings";

interface FlowStyleConstellationProps {
  value: FlowStyle | null;
  onChange: (style: FlowStyle) => void;
}

const STYLES = Object.keys(FLOW_STYLE_INFO) as FlowStyle[];

/**
 * Question 2 - flow style, displayed as floating constellation cards.
 * Selecting one gently glows it and reveals a short line of lore.
 */
export default function FlowStyleConstellation({ value, onChange }: FlowStyleConstellationProps) {
  return (
    <div className="glass rounded-glass p-5 sm:p-6">
      <h2 className="font-display text-lg font-medium text-ink">Flow Style Constellation</h2>
      <p className="mb-4 text-xs text-ink-soft">Which shape does your work tend to take?</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {STYLES.map((style, i) => {
          const isSelected = value === style;
          return (
            <motion.button
              key={style}
              type="button"
              onClick={() => onChange(style)}
              aria-pressed={isSelected}
              className={`rounded-2xl px-3 py-4 text-center text-sm font-medium transition ${
                isSelected
                  ? "bg-white/70 text-ink shadow-glow-lav"
                  : "bg-white/35 text-ink-soft hover:bg-white/50"
              }`}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
            >
              {FLOW_STYLE_INFO[style].label}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {value && FLOW_STYLE_INFO[value] && (
          <motion.p
            key={value}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="mt-4 font-display text-sm italic text-ink-soft"
          >
            &ldquo;{FLOW_STYLE_INFO[value].lore}&rdquo;

          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
