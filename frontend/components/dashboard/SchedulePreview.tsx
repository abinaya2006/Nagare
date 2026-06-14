"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Loader2 } from "lucide-react";
import type { ScheduleBlock } from "@/types";

interface SchedulePreviewProps {
  initialFlow: ScheduleBlock[];
}

/**
 * Floating ribbon card showing the AI's recommended flow for the day, with
 * a gentle "Generate New Flow" action that calls the schedule API.
 */
export default function SchedulePreview({ initialFlow }: SchedulePreviewProps) {
  const [flow, setFlow] = useState<ScheduleBlock[]>(initialFlow);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/schedule/generate", { method: "POST" });
      if (!res.ok) throw new Error("Could not generate a new flow");
      const data = await res.json();
      if (Array.isArray(data?.flow)) {
        setFlow(data.flow);
      }
    } catch {
      setError("The new flow drifted away before it arrived. Try again in a moment.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      className="glass mx-auto w-full max-w-3xl rounded-glass px-5 py-5 sm:px-8 sm:py-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-lg font-medium text-ink">Today&apos;s Recommended Flow</h2>
          <p className="text-xs text-ink-soft">A calm rhythm for the hours ahead.</p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-lavender to-sky px-4 py-2.5 text-sm font-medium text-ink shadow-glass transition hover:shadow-glow-lav disabled:opacity-70"
        >
          {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
          {isGenerating ? "Gathering thoughts…" : "Generate New Flow"}
        </button>
      </div>

      <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
        <AnimatePresence mode="popLayout">
          {flow.map((block, i) => (
            <motion.div
              key={block.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex min-w-[150px] flex-shrink-0 flex-col gap-1 rounded-2xl bg-white/55 px-4 py-3 shadow-sm backdrop-blur-sm"
            >
              <span className="text-xs font-semibold text-ink-soft">{block.time}</span>
              <span className="text-sm font-medium text-ink">{block.label}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {error && <p className="mt-3 text-xs text-coral-glow">{error}</p>}
    </motion.div>
  );
}
