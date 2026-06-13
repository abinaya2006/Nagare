"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ENERGY_SOURCE_LABELS, type EnergySource } from "@/types/settings";

interface EnergySourcesProps {
  value: EnergySource[];
  onToggle: (source: EnergySource) => void;
}

const SOURCES = Object.keys(ENERGY_SOURCE_LABELS) as EnergySource[];

/**
 * Question 9 - things that recharge energy, shown as glowing memory spheres.
 * Selected spheres gently emit particles, like quiet little fireworks of
 * recognition.
 */
export default function EnergySources({ value, onToggle }: EnergySourcesProps) {
  const particleOffsets = useMemo(
    () => Array.from({ length: 5 }, () => ({ x: (Math.random() - 0.5) * 50, delay: Math.random() * 1.5 })),
    []
  );

  return (
    <div className="glass rounded-glass p-5 sm:p-6">
      <h2 className="font-display text-lg font-medium text-ink">Energy Sources</h2>
      <p className="mb-4 text-xs text-ink-soft">What tends to leave you feeling more lit up?</p>

      <div className="flex flex-wrap gap-4">
        {SOURCES.map((source) => {
          const selected = value.includes(source);
          return (
            <button
              key={source}
              type="button"
              onClick={() => onToggle(source)}
              aria-pressed={selected}
              className="relative flex flex-col items-center gap-2"
            >
              <span
                className={`relative flex h-16 w-16 items-center justify-center rounded-full text-center text-[11px] font-medium transition ${
                  selected ? "bg-gradient-to-br from-white via-gold to-peach text-ink shadow-glow-gold" : "bg-white/35 text-ink-soft"
                }`}
              >
                {ENERGY_SOURCE_LABELS[source]}
                {selected &&
                  particleOffsets.map((p, i) => (
                    <motion.span
                      key={i}
                      className="absolute h-1.5 w-1.5 rounded-full bg-white"
                      style={{ left: "50%", top: "50%" }}
                      animate={{ x: p.x, y: -50, opacity: [1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: p.delay, ease: "easeOut" }}
                    />
                  ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
