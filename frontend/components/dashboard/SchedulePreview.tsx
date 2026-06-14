"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Loader2 } from "lucide-react";
import { useSchedule } from "@/hooks/useSchedule";

export default function SchedulePreview() {
  const { slots, generateFlow, isLoading } = useSchedule();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try { await generateFlow(); }
    catch { setError("The flow drifted away before it arrived. Try again in a moment."); }
    finally { setIsGenerating(false); }
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
          disabled={isGenerating || isLoading}
          className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-ink shadow-glass transition hover:shadow-glow-lav disabled:opacity-70"
          style={{
            background: "linear-gradient(135deg, var(--lavender), var(--river-blue))",
          }}
        >
          {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
          {isGenerating ? "Gathering thoughts…" : "Generate New Flow"}
        </button>
      </div>

      <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
        {isLoading && <p className="text-xs text-ink-soft">Loading your flow…</p>}
        <AnimatePresence mode="popLayout">
          {!isLoading && slots.map((slot, i) => (
            <motion.div
              key={slot.taskId ?? i}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex min-w-[150px] flex-shrink-0 flex-col gap-1 rounded-2xl px-4 py-3 shadow-sm"
              style={{
                background: "var(--bg-overlay)",
                border: "1px solid var(--border-soft)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span className="text-xs font-semibold text-ink-soft">{slot.time}</span>
              <span className="text-sm font-medium text-ink">{slot.task}</span>
              <span className="text-xs text-ink-soft">{slot.duration}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {!isLoading && slots.length === 0 && (
          <p className="text-xs text-ink-soft">No flow yet. Hit &quot;Generate New Flow&quot; to begin.</p>
        )}
      </div>
      {error && <p className="mt-3 text-xs" style={{ color: "var(--priority-critical)" }}>{error}</p>}
    </motion.div>
  );
}
