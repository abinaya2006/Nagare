"use client";

import { motion } from "framer-motion";
import { SLEEP_HOURS_INFO, SLEEP_HOURS_ORDER, type SleepHours } from "@/types/settings";

interface DreamRecoveryProps {
  value: SleepHours;
  onChange: (hours: SleepHours) => void;
}

/**
 * Question 12 - sleep hours, represented as moon phases. A new moon means
 * very little rest; a full moon means plenty. No judgment either way.
 */
export default function DreamRecovery({ value, onChange }: DreamRecoveryProps) {
  return (
    <div className="glass rounded-glass p-5 sm:p-6">
      <h2 className="font-display text-lg font-medium text-ink">Dream Recovery</h2>
      <p className="mb-5 text-xs text-ink-soft">How much sleep does your world usually get?</p>

      <div className="flex flex-wrap items-center justify-around gap-4">
        {SLEEP_HOURS_ORDER.map((hours) => {
          const info = SLEEP_HOURS_INFO[hours];
          const selected = value === hours;
          const shadowOffset = (1 - info.moonPhase) * 100;

          return (
            <button
              key={hours}
              type="button"
              onClick={() => onChange(hours)}
              aria-pressed={selected}
              className="flex flex-col items-center gap-2"
            >
              <motion.div
                className="relative h-12 w-12 overflow-hidden rounded-full bg-[#FFF4C7]"
                animate={{
                  boxShadow: selected ? "0 0 24px rgba(255, 244, 199, 0.85)" : "0 0 0px rgba(255,244,199,0)",
                }}
                transition={{ duration: 0.6 }}
              >
                <div
                  className="absolute inset-0 rounded-full bg-[#AFC8FF]"
                  style={{ transform: `translateX(${shadowOffset}%)` }}
                />
              </motion.div>
              <span className={`text-xs ${selected ? "font-semibold text-ink" : "text-ink-soft"}`}>
                {info.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
