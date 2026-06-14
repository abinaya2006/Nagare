"use client";

import { useRef } from "react";
import { motion, useMotionValue } from "framer-motion";
import {
  CIRCADIAN_COLORS,
  CIRCADIAN_LABELS,
  CIRCADIAN_NANI_LINES,
  type CircadianPeriod,
} from "@/types/settings";

interface CircadianRiverProps {
  value: CircadianPeriod;
  onChange: (period: CircadianPeriod) => void;
}

const PERIODS: CircadianPeriod[] = ["morning", "afternoon", "evening", "night"];

/**
 * Question 1 - "When does your brain feel like its superhero version?"
 * A flowing river of color the user drags a glowing orb along. The river
 * itself shifts hue toward whichever period is selected.
 */
export default function CircadianRiver({ value, onChange }: CircadianRiverProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);

  const selectedIndex = PERIODS.indexOf(value);
  const leftPercent = (selectedIndex + 0.5) * 25;

  const handleDragEnd = () => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const currentLeft = (leftPercent / 100) * rect.width + dragX.get();
    const ratio = Math.min(Math.max(currentLeft / rect.width, 0), 1);
    const index = Math.min(PERIODS.length - 1, Math.floor(ratio * PERIODS.length));
    onChange(PERIODS[index]);
    dragX.set(0);
  };

  return (
    <div className="glass rounded-glass p-5 sm:p-6">
      <h2 className="font-display text-lg font-medium text-ink">The Circadian River</h2>
      <p className="text-xs text-ink-soft">When does your brain feel like its superhero version?</p>

      <div
        ref={trackRef}
        className="relative mt-6 h-3 w-full overflow-visible rounded-full"
        style={{
          background: `linear-gradient(90deg, ${CIRCADIAN_COLORS.morning}, ${CIRCADIAN_COLORS.afternoon}, ${CIRCADIAN_COLORS.evening}, ${CIRCADIAN_COLORS.night})`,
        }}
      >
        {/* Segment click targets */}
        <div className="absolute inset-0 flex">
          {PERIODS.map((period) => (
            <button
              key={period}
              type="button"
              aria-label={CIRCADIAN_LABELS[period]}
              aria-pressed={value === period}
              onClick={() => onChange(period)}
              className="h-full flex-1"
            />
          ))}
        </div>

        {/* Glowing orb */}
        <motion.div
          drag="x"
          dragMomentum={false}
          dragElastic={0.15}
          dragConstraints={trackRef}
          onDragEnd={handleDragEnd}
          style={{ x: dragX, left: `${leftPercent}%` }}
          animate={{ left: `${leftPercent}%` }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full bg-white shadow-glow-lav active:cursor-grabbing"
          role="slider"
          aria-valuenow={selectedIndex}
          aria-valuemin={0}
          aria-valuemax={3}
          aria-valuetext={CIRCADIAN_LABELS[value]}
          tabIndex={0}
        />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1 text-center text-xs text-ink-soft">
        {PERIODS.map((period) => (
          <span key={period} className={value === period ? "font-semibold text-ink" : ""}>
            {CIRCADIAN_LABELS[period]}
          </span>
        ))}
      </div>

      <p className="mt-4 font-display text-sm italic text-ink-soft">
        &ldquo;{CIRCADIAN_NANI_LINES[value]}&rdquo;
      </p>
    </div>
  );
}
