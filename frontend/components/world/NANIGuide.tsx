"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NANI_WORLD_LINES } from "@/lib/world-data";

interface NANIGuideProps {
  onOpenChat?: () => void;
}

/**
 * NANI's presence inside the Constellation World: a small drifting light
 * that occasionally offers a quiet observation. Never instructive, never a
 * nudge to "do more" - just companionship.
 */
export default function NANIGuide({ onOpenChat }: NANIGuideProps) {
  const [lineIndex, setLineIndex] = useState<number | null>(null);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;

    const showLine = () => {
      setLineIndex(Math.floor(Math.random() * NANI_WORLD_LINES.length));
      hideTimer = setTimeout(() => setLineIndex(null), 7000);
    };

    const interval = setInterval(showLine, 18000);
    const firstShow = setTimeout(showLine, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(firstShow);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-28 left-6 z-30 flex items-end gap-3 sm:bottom-10 sm:left-10">
      <AnimatePresence>
        {lineIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="glass pointer-events-auto max-w-[230px] rounded-2xl px-4 py-3 text-sm text-ink/85"
          >
            {NANI_WORLD_LINES[lineIndex]}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={onOpenChat}
        aria-label="NANI is nearby - open chat"
        className="pointer-events-auto relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white via-lavender to-sky shadow-glow-nani"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.1 }}
      >
        <motion.span
          aria-hidden="true"
          className="h-5 w-5 rounded-full bg-white/90"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.button>
    </div>
  );
}
