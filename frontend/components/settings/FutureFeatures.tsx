"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";

const FEATURES = [
  "Focus Music Integration",
  "Reflection Journal",
  "AI Weekly Insights",
  "Team Constellations",
  "Shared Worlds",
];

/**
 * "Beyond The Horizon" - a glimpse of what's still out there, gently
 * locked. Framed as anticipation, not as a paywall.
 */
export default function FutureFeatures() {
  return (
    <div className="glass rounded-glass p-5 sm:p-6">
      <h2 className="font-display text-lg font-medium text-ink">Beyond The Horizon</h2>
      <p className="mb-4 text-xs text-ink-soft">A few more shapes are still forming, out past the fog.</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature}
            className="flex items-center gap-2 rounded-2xl bg-white/25 px-4 py-3 text-sm text-ink-soft"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
          >
            <Lock size={14} aria-hidden="true" />
            {feature}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
