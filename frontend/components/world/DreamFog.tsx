// components/world/DreamFog.tsx
"use client";
import { motion } from "framer-motion";
import type { RegionProgress } from "@/hooks/useWorldUnlocks";
import { WORLD_SIZE } from "@/lib/world-data";

interface DreamFogProps {
  regions: RegionProgress[];
}

export default function DreamFog({ regions }: DreamFogProps) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{ width: WORLD_SIZE.width, height: WORLD_SIZE.height }}
    >
      {regions.map(({ region, clarity, unlocked }) => {
        // Fully unlocked = no fog; fully fogged = opacity 1
        const fogOpacity = unlocked ? Math.max(0, 1 - clarity) : 1;
        if (fogOpacity <= 0) return null;
        return (
          <motion.div
            key={region.id}
            className="absolute rounded-full"
            style={{
              left: region.center.x - region.radius,
              top: region.center.y - region.radius,
              width: region.radius * 2,
              height: region.radius * 2,
              background:
                "radial-gradient(circle, rgba(5,8,26,0.85) 0%, rgba(5,8,26,0.6) 50%, transparent 80%)",
              filter: "blur(40px)",
            }}
            animate={{ opacity: fogOpacity }}
            transition={{ duration: 2.5, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}
