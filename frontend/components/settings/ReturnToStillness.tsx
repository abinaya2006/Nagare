"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon } from "lucide-react";

interface ReturnToStillnessProps {
  onLogout: () => Promise<void>;
  isLoggedOut: boolean;
}

/**
 * Instead of a harsh "Log Out" button, a quiet invitation to step away.
 * The screen fades, particles drift off, and NANI promises to keep watch.
 */
export default function ReturnToStillness({ onLogout, isLoggedOut }: ReturnToStillnessProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 1.5,
  }));

  const handleClick = async () => {
    setIsLeaving(true);
    await onLogout();
  };

  return (
    <>
      <div className="glass flex flex-col items-center gap-3 rounded-glass p-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h2 className="font-display text-lg font-medium text-ink">Return To Stillness</h2>
          <p className="text-xs text-ink-soft">Step away for a while. Your world will hold its shape.</p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          className="flex items-center gap-2 rounded-full bg-white/55 px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-white/75 hover:shadow-glow-lav"
        >
          <Moon size={15} aria-hidden="true" />
          Return To Stillness
        </button>
      </div>

      <AnimatePresence>
        {isLeaving && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-[#FCFCFF]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          >
            {particles.map((p) => (
              <motion.span
                key={p.id}
                className="absolute h-1.5 w-1.5 rounded-full bg-lavglow"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                initial={{ opacity: 0.7 }}
                animate={{ y: -120, opacity: 0 }}
                transition={{ duration: 4, delay: p.delay, ease: "easeOut" }}
              />
            ))}

            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: isLoggedOut ? 1 : 0.6, scale: 1 }}
              transition={{ duration: 1.4, delay: 0.4 }}
            >
              <p className="font-display text-lg italic text-ink-soft">
                &ldquo;I&apos;ll keep the stars safe until you return.&rdquo;
              </p>
              {isLoggedOut && (
                <Link
                  href="/dashboard"
                  className="mt-6 inline-block rounded-full bg-white/60 px-5 py-2.5 text-sm font-medium text-ink shadow-glass transition hover:shadow-glow-lav"
                >
                  Drift back in
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
