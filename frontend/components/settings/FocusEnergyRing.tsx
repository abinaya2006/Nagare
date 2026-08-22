"use client";

import { useRef } from "react";
import { motion, useMotionValue } from "framer-motion";
import {
  FOCUS_DURATION_LABELS,
  FOCUS_DURATION_ORDER,
  type FocusDuration,
} from "@/types/settings";

interface FocusEnergyRingProps {
  value: FocusDuration;
  onChange: (duration: FocusDuration) => void;
}

const RADII = [34, 52, 70, 88, 106];
const SIZE = 240;
const CENTER = SIZE / 2;

/**
 * Question 3 - focus duration, shown as an expanding ring of energy. The
 * handle drags outward (less focus capacity) to inward (more), and the glow
 * fills to match.
 */
export default function FocusEnergyRing({ value, onChange }: FocusEnergyRingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragY = useMotionValue(0);

  const selectedIndex = FOCUS_DURATION_ORDER.indexOf(value);
  const selectedRadius = RADII[selectedIndex];

  const handleDragEnd = () => {
    const offset = dragY.get();
    const currentRadius = Math.min(Math.max(selectedRadius - offset, RADII[0]), RADII[RADII.length - 1]);
    let nearest = 0;
    let smallestDiff = Infinity;
    RADII.forEach((r, i) => {
      const diff = Math.abs(r - currentRadius);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        nearest = i;
      }
    });
    onChange(FOCUS_DURATION_ORDER[nearest]);
    dragY.set(0);
  };

  return (
    <div className="glass rounded-glass p-5 sm:p-6">
      <h2 className="font-display text-lg font-medium text-ink">Focus Energy</h2>
      <p className="mb-4 text-xs text-ink-soft">How long can your focus hold its shape?</p>

      <div ref={containerRef} className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
          {RADII.map((r, i) => (
            <circle
              key={r}
              cx={CENTER}
              cy={CENTER}
              r={r}
              fill={i <= selectedIndex ? "rgba(232,225,255,0.25)" : "none"}
              stroke="rgba(255,255,255,0.6)"
              strokeWidth={1.5}
            />
          ))}
          <motion.circle
            cx={CENTER}
            cy={CENTER}
            r={selectedRadius}
            fill="none"
            stroke="#C9B6FF"
            strokeWidth={2}
            animate={{ r: selectedRadius }}
            transition={{ type: "spring", stiffness: 160, damping: 20 }}
          />
          {/* center orb */}
          <circle cx={CENTER} cy={CENTER} r={10} fill="#FFFFFF" className="drop-shadow-[0_0_10px_rgba(201,182,255,0.8)]" />
        </svg>

        {/* drag handle on the active ring */}
        <motion.div
          drag="y"
          dragMomentum={false}
          dragElastic={0.2}
          dragConstraints={{ top: -(RADII[RADII.length - 1] - RADII[0]), bottom: RADII[RADII.length - 1] - RADII[0] }}
          onDragEnd={handleDragEnd}
          style={{ y: dragY, left: CENTER - 10, top: CENTER - selectedRadius - 10 }}
          animate={{ top: CENTER - selectedRadius - 10 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="absolute h-5 w-5 cursor-grab rounded-full bg-white shadow-glow-lav active:cursor-grabbing"
          role="slider"
          aria-label="Focus duration"
          aria-valuetext={FOCUS_DURATION_LABELS[value]}
          tabIndex={0}
        />
      </div>

      <p className="mt-3 text-center font-display text-sm italic text-ink-soft">
        {FOCUS_DURATION_LABELS[value]} of steady focus
      </p>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {FOCUS_DURATION_ORDER.map((duration) => (
          <button
            key={duration}
            type="button"
            onClick={() => onChange(duration)}
            aria-pressed={value === duration}
            className={`rounded-full px-3 py-1 text-xs transition ${
              value === duration ? "bg-white/70 text-ink shadow-glow-lav" : "bg-white/30 text-ink-soft hover:bg-white/50"
            }`}
          >
            {FOCUS_DURATION_LABELS[duration]}
          </button>
        ))}
      </div>
    </div>
  );
}
