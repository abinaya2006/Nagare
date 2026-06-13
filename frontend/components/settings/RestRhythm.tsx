"use client";

import { useRef } from "react";
import { motion, useMotionValue } from "framer-motion";
import {
  BREAK_PREFERENCE_INFO,
  BREAK_PREFERENCE_ORDER,
  type BreakPreference,
} from "@/types/settings";

interface RestRhythmProps {
  value: BreakPreference;
  onChange: (preference: BreakPreference) => void;
}

/**
 * Question 10 - break preferences, shown as checkpoints along a gentle
 * timeline. Dragging the marker to a checkpoint sets how often Nagare
 * suggests pausing.
 */
export default function RestRhythm({ value, onChange }: RestRhythmProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);

  const selectedIndex = BREAK_PREFERENCE_ORDER.indexOf(value);
  const leftPercent = BREAK_PREFERENCE_INFO[value].position;

  const handleDragEnd = () => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const currentLeft = (leftPercent / 100) * rect.width + dragX.get();
    const ratio = Math.min(Math.max(currentLeft / rect.width, 0), 1) * 100;

    let nearest: BreakPreference = BREAK_PREFERENCE_ORDER[0];
    let smallestDiff = Infinity;
    BREAK_PREFERENCE_ORDER.forEach((pref) => {
      const diff = Math.abs(BREAK_PREFERENCE_INFO[pref].position - ratio);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        nearest = pref;
      }
    });

    onChange(nearest);
    dragX.set(0);
  };

  return (
    <div className="glass rounded-glass p-5 sm:p-6">
      <h2 className="font-display text-lg font-medium text-ink">Rest Rhythm</h2>
      <p className="mb-6 text-xs text-ink-soft">How often does your mind like to come up for air?</p>

      <div ref={trackRef} className="relative h-1.5 w-full rounded-full bg-white/40">
        {BREAK_PREFERENCE_ORDER.map((pref) => (
          <span
            key={pref}
            className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70"
            style={{ left: `${BREAK_PREFERENCE_INFO[pref].position}%` }}
            aria-hidden="true"
          />
        ))}

        <motion.div
          drag="x"
          dragMomentum={false}
          dragElastic={0.15}
          dragConstraints={trackRef}
          onDragEnd={handleDragEnd}
          style={{ x: dragX, left: `${leftPercent}%` }}
          animate={{ left: `${leftPercent}%` }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full bg-white shadow-glow-lav active:cursor-grabbing"
          role="slider"
          aria-valuenow={selectedIndex}
          aria-valuemin={0}
          aria-valuemax={BREAK_PREFERENCE_ORDER.length - 1}
          aria-valuetext={BREAK_PREFERENCE_INFO[value].label}
          tabIndex={0}
        />
      </div>

      <div className="mt-4 flex justify-between text-[11px] text-ink-soft">
        {BREAK_PREFERENCE_ORDER.map((pref) => (
          <span key={pref} className={value === pref ? "font-semibold text-ink" : ""}>
            {BREAK_PREFERENCE_INFO[pref].label}
          </span>
        ))}
      </div>
    </div>
  );
}
