"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface PersonalizeButtonProps {
  onSave: () => Promise<boolean>;
}

/**
 * The bottom-right action that commits every choice on this page. Pressing
 * it gathers the world's particles inward for a moment - "NANI is
 * recalibrating your world" - before settling back into place.
 */
export default function PersonalizeButton({ onSave }: PersonalizeButtonProps) {
  const [phase, setPhase] = useState<"idle" | "saving" | "done">("idle");

  const particles = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    return { id: i, x: Math.cos(angle) * 180, y: Math.sin(angle) * 180 };
  });

  const handleClick = async () => {
    if (phase !== "idle") return;
    setPhase("saving");
    const success = await onSave();
    setPhase(success ? "done" : "idle");
    if (success) {
      setTimeout(() => setPhase("idle"), 1800);
    }
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={phase !== "idle"}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-lavender via-cloud to-sky px-5 py-3 text-sm font-medium text-ink shadow-glow-lav transition hover:shadow-glow-nani sm:bottom-8 sm:right-8"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        <Sparkles size={16} aria-hidden="true" />
        Personalize My Flow
      </motion.button>

      <AnimatePresence>
        {phase !== "idle" && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-white/50 backdrop-blur-sm" />

            <div className="relative">
              {phase === "saving" &&
                particles.map((p) => (
                  <motion.span
                    key={p.id}
                    className="absolute h-2 w-2 rounded-full bg-lavglow"
                    style={{ left: p.x, top: p.y }}
                    initial={{ opacity: 0.8 }}
                    animate={{ left: 0, top: 0, opacity: 0 }}
                    transition={{ duration: 1.4, ease: "easeIn" }}
                  />
                ))}

              <motion.div
                className="glass-strong relative z-10 w-[min(85vw,360px)] -translate-x-1/2 -translate-y-1/2 rounded-glass p-6 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                {phase === "saving" ? (
                  <>
                    <motion.div
                      className="mx-auto mb-3 h-10 w-10 rounded-full bg-gradient-to-br from-white via-lavender to-sky shadow-glow-lav"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <p className="font-display text-sm italic text-ink">
                      NANI is recalibrating your world.
                    </p>
                  </>
                ) : (
                  <p className="font-display text-sm italic text-ink">
                    Your sky has settled into its new shape.
                  </p>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
