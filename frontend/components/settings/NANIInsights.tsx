"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useNaniHealth } from "@/hooks/useNANIHealth";

interface NANIInsightsProps {
  insights: string[];
}

export default function NANIInsights({ insights }: NANIInsightsProps) {
  const { state, refresh } = useNaniHealth();

  const isHealthy = state === "healthy";
  const isLoading = state === "loading";

  return (
    <div className="glass sticky top-6 rounded-glass p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-lavglow" aria-hidden="true" />
          <h2 className="font-display text-lg font-medium text-ink">NANI Notices</h2>
        </div>

        <button
          type="button"
          onClick={refresh}
          className={`h-2.5 w-2.5 rounded-full transition-all duration-500 ${
            isHealthy
              ? "bg-white shadow-[0_0_10px_3px_rgba(255,255,255,0.75)]"
              : isLoading
                ? "bg-white/60 animate-pulse"
                : "bg-black/80 ring-1 ring-white/20"
          }`}
          title={
            isLoading
              ? "Checking NANI status"
              : isHealthy
                ? "NANI is active"
                : "NANI has an issue"
          }
          aria-label={
            isLoading
              ? "Checking NANI status"
              : isHealthy
                ? "NANI is active"
                : "NANI has an issue"
          }
        />
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