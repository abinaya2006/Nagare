"use client";

import { motion } from "framer-motion";
import type { RegionProgress } from "@/hooks/useWorldUnlocks";

interface DreamFogProps {
  regions: RegionProgress[];
}

/**
 * Soft, drifting mist covering regions of the sky that haven't been earned
 * yet. As Flow Energy grows, each region's fog thins and eventually drifts
 * away entirely - never abruptly, never with a "locked" padlock.
 */
export default function DreamFog({ regions }: DreamFogProps) {
  return (
    <>
      {regions.map(({ region, clarity, unlocked }) => {
        // Fully clear regions keep a faint wisp for atmosphere only.
        const opacity = unlocked ? Math.max(0.04, (1 - clarity) * 0.15) : 0.92 - clarity * 0.7;

        return (
          <div
            key={region.id}
            aria-hidden="true"
            className="absolute"
            style={{
              left: region.center.x - region.radius,
              top: region.center.y - region.radius,
              width: region.radius * 2,
              height: region.radius * 2,
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-white/80 blur-[90px]"
              animate={{ opacity, scale: [1, 1.03, 1] }}
              transition={{
                opacity: { duration: 2.5, ease: "easeInOut" },
                scale: { duration: 40, repeat: Infinity, ease: "easeInOut" },
              }}
            />
            <motion.div
              className="absolute left-1/4 top-1/3 h-2/3 w-2/3 rounded-full bg-[#E8E1FF]/70 blur-[80px]"
              animate={{ opacity: opacity * 0.85, x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{
                opacity: { duration: 2.5, ease: "easeInOut" },
                x: { duration: 46, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 38, repeat: Infinity, ease: "easeInOut" },
              }}
            />
          </div>
        );
      })}
    </>
  );
}
