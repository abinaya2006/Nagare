"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MILESTONE_COPY } from "@/lib/world-data";

interface DiscoveryRevealProps {
  milestone: number | null;
  onDismiss: () => void;
}

/**
 * A full-screen cinematic moment that plays when a major milestone is
 * reached: soft particles burst outward, the sky brightens for a moment,
 * and a short message marks what's changed.
 */
export default function DiscoveryReveal({ milestone, onDismiss }: DiscoveryRevealProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const angle = (i / 28) * Math.PI * 2;
        const distance = 160 + Math.random() * 220;
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          size: 2 + Math.random() * 4,
          delay: Math.random() * 0.3,
        };
      }),
    []
  );

  const copy = milestone ? MILESTONE_COPY[milestone] : null;

  return (
    <AnimatePresence>
      {milestone && copy && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          role="status"
          aria-live="polite"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-[#FCFCFF]/80 via-[#E8E1FF]/70 to-[#AFC8FF]/70 backdrop-blur-md"
            onClick={onDismiss}
          />

          {/* Particle burst */}
          <div className="relative">
            {particles.map((p) => (
              <motion.span
                key={p.id}
                className="absolute rounded-full bg-white"
                style={{ width: p.size, height: p.size, left: 0, top: 0 }}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{ x: p.x, y: p.y, opacity: [0, 1, 0] }}
                transition={{ duration: 2.4, delay: p.delay, ease: "easeOut" }}
              />
            ))}

            {/* Glowing core */}
            <motion.div
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white blur-2xl"
              initial={{ width: 0, height: 0, opacity: 0 }}
              animate={{ width: 220, height: 220, opacity: 0.9 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />

            {/* Message */}
            <motion.div
              className="glass-strong relative z-10 w-[min(90vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-glass p-6 text-center sm:p-8"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
            >
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-ink-soft">
                {milestone} thoughts settled
              </p>
              <h2 className="font-display text-2xl font-medium italic text-ink">{copy.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/80">{copy.body}</p>
              <button
                type="button"
                onClick={onDismiss}
                className="mt-6 rounded-full bg-white/60 px-5 py-2.5 text-sm font-medium text-ink shadow-glass transition hover:shadow-glow-lav"
              >
                Continue drifting
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
