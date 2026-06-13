"use client";

import { motion } from "framer-motion";
import { CIRCADIAN_COLORS, type CircadianPeriod } from "@/types/settings";

interface AmbientBackgroundProps {
  circadianPeriod: CircadianPeriod;
  moonPhase: number; // 0 (new moon) - 1 (full moon)
}

/**
 * A soft color wash layered above the shared Nagare backdrop. Its tint
 * drifts toward the chosen circadian period's color, and dims slightly as
 * sleep hours decrease - the sky itself reflects the choices being made.
 */
export default function AmbientBackground({ circadianPeriod, moonPhase }: AmbientBackgroundProps) {
  const tint = CIRCADIAN_COLORS[circadianPeriod];
  const dimness = 0.5 + moonPhase * 0.5; // less sleep -> slightly dimmer wash

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-[5]"
      animate={{
        background: `radial-gradient(circle at 30% 20%, ${tint}55, transparent 55%), radial-gradient(circle at 80% 80%, ${tint}33, transparent 60%)`,
        opacity: dimness,
      }}
      transition={{ duration: 1.8, ease: "easeInOut" }}
    />
  );
}
