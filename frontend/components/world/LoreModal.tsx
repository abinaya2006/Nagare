"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkle } from "lucide-react";
import type { ConstellationProgress } from "@/hooks/useConstellationProgress";

interface LoreModalProps {
  progress: ConstellationProgress | null;
  onClose: () => void;
}

/**
 * A gentle glass modal that reveals a constellation's name, meaning, and
 * short poetic lore once it has been unlocked. Locked constellations offer
 * only a quiet hint - the mystery is part of the experience.
 */
export default function LoreModal({ progress, onClose }: LoreModalProps) {
  return (
    <AnimatePresence>
      {progress && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lore-modal-title"
            initial={{ opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 18 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="glass-strong relative z-10 w-full max-w-md rounded-glass p-6 sm:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-2 text-ink-soft transition hover:bg-white/50 hover:text-ink"
            >
              <X size={18} />
            </button>

            <div className="mb-2 flex items-center gap-2 text-ink-soft">
              <Sparkle size={14} />
              <p className="text-xs uppercase tracking-[0.2em]">
                {progress.unlocked ? progress.constellation.meaning : "Still forming"}
              </p>
            </div>

            <h2 id="lore-modal-title" className="font-display text-2xl font-medium italic text-ink">
              {progress.unlocked ? progress.constellation.name : "An unfinished shape"}
            </h2>

            <div className="mt-5 space-y-3 text-sm leading-relaxed text-ink/80">
              {progress.unlocked ? (
                progress.constellation.lore.map((line, i) => <p key={i}>{line}</p>)
              ) : (
                <>
                  <p>
                    A few stars have gathered here, but the shape they&apos;re forming
                    isn&apos;t clear yet.
                  </p>
                  <p className="text-ink-soft">
                    Keep settling thoughts, and this constellation will reveal itself.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between text-xs text-ink-soft">
              <span>
                {progress.revealedStarCount} of {progress.constellation.stars.length} stars visible
              </span>
              {progress.unlocked && <span>Discovered</span>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
