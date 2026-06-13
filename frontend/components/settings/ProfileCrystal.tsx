"use client";

import { motion } from "framer-motion";
import {
  CIRCADIAN_LABELS,
  CIRCADIAN_NANI_LINES,
  type EnergySource,
  type FlowPreferences,
  type UserProfile,
} from "@/types/settings";

interface ProfileCrystalProps {
  profile: UserProfile;
  preferences: FlowPreferences;
}

const ENERGY_SOURCE_TO_CONSTELLATION_LABEL: Record<EnergySource, string> = {
  learning: "Scholar",
  projects: "Builder",
  "creative-work": "Dreamer",
  people: "Navigator",
  exercise: "Guardian",
  organizing: "Navigator",
  "problem-solving": "Alchemist",
};

export default function ProfileCrystal({
  profile,
  preferences,
}: ProfileCrystalProps) {
  const identity = Array.from(
    new Set(
      (preferences.energySources ?? [])
        .slice(0, 2)
        .map((source) => ENERGY_SOURCE_TO_CONSTELLATION_LABEL[source])
        .filter(Boolean),
    ),
  );

  const rhythmLabel = `${CIRCADIAN_LABELS[preferences.circadianPeriod]} Focused`;

  return (
    <div className="glass-strong relative overflow-hidden rounded-glass p-6 sm:p-8">
      <motion.div
        aria-hidden="true"
        className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-lavender/50 blur-3xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <motion.div
          className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute inset-0 rounded-[28%] bg-gradient-to-br from-white via-lavender to-sky shadow-glow-lav"
            style={{ transform: "rotate(45deg)" }}
          />
          <span className="relative z-10 -rotate-0 font-display text-2xl font-medium text-ink">
            {profile.avatarInitial}
          </span>
        </motion.div>

        <div className="flex-1 text-center sm:text-left">
          <h2 className="font-display text-2xl font-medium italic text-ink">
            {profile.name}
          </h2>
          <p className="text-sm text-ink-soft">{profile.email}</p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="text-xs uppercase tracking-[0.2em] text-ink-soft">
              Flow Identity
            </span>
            <span className="text-sm font-medium text-ink">
              {identity.length > 0 ? identity.join(" • ") : "Still forming"}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="text-xs uppercase tracking-[0.2em] text-ink-soft">
              Current Rhythm
            </span>
            <span className="text-sm font-medium text-ink">{rhythmLabel}</span>
          </div>

          <p className="mt-4 font-display text-sm italic text-ink-soft">
            &ldquo;{CIRCADIAN_NANI_LINES[preferences.circadianPeriod]}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
