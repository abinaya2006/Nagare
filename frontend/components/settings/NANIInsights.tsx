"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface NANIInsightsProps {
  insights: string[];
}

/**
 * A sticky panel where NANI quietly reflects back what it's noticed,
 * updating as preferences change. Never instructive - just observant.
 */
export default function NANIInsights({ insights }: NANIInsightsProps) {
  return (
    <div className="glass sticky top-6 rounded-glass p-5 sm:p-6">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={16} className="text-lavglow" aria-hidden="true" />
        <h2 className="font-display text-lg font-medium text-ink">NANI Notices</h2>
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <motion.p
            key={insight}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="rounded-2xl bg-white/45 px-4 py-3 text-sm leading-relaxed text-ink/85"
          >
            {insight}
          </motion.p>
        ))}
      </div>
    </div>
  );
}
