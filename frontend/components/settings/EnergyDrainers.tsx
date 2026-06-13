"use client";

import { motion } from "framer-motion";
import { ENERGY_DRAINER_LABELS, type EnergyDrainer } from "@/types/settings";

interface EnergyDrainersProps {
  value: EnergyDrainer[];
  onToggle: (drainer: EnergyDrainer) => void;
}

const DRAINERS = Object.keys(ENERGY_DRAINER_LABELS) as EnergyDrainer[];

/**
 * Question 8 - things that drain energy, shown as floating fragments that
 * slowly dim and absorb light once selected.
 */
export default function EnergyDrainers({ value, onToggle }: EnergyDrainersProps) {
  return (
    <div className="glass rounded-glass p-5 sm:p-6">
      <h2 className="font-display text-lg font-medium text-ink">Energy Drainers</h2>
      <p className="mb-4 text-xs text-ink-soft">What tends to leave you a little dimmer afterward?</p>

      <div className="flex flex-wrap gap-3">
        {DRAINERS.map((drainer, i) => {
          const selected = value.includes(drainer);
          return (
            <motion.button
              key={drainer}
              type="button"
              onClick={() => onToggle(drainer)}
              aria-pressed={selected}
              className={`rounded-xl px-4 py-2.5 text-sm transition ${
                selected
                  ? "bg-[#5B5A78]/80 text-cloud shadow-inner"
                  : "bg-white/40 text-ink-soft hover:bg-white/55"
              }`}
              animate={{ rotate: [0, i % 2 === 0 ? 2 : -2, 0], y: [0, -3, 0] }}
              transition={{ duration: 6 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {ENERGY_DRAINER_LABELS[drainer]}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
