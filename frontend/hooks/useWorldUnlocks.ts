"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MILESTONES, REGIONS, type RegionData } from "@/lib/world-data";

export interface RegionProgress {
  region: RegionData;
  /** 0 = fully fogged, 1 = fully clear */
  clarity: number;
  unlocked: boolean;
}

interface UseWorldUnlocksResult {
  regions: RegionProgress[];
  /** the milestone currently being celebrated, or null */
  activeMilestone: number | null;
  dismissMilestone: () => void;
}

/**
 * Translates total completed tasks into how clear each region of the sky is,
 * and detects when a milestone (25 / 50 / 100 / 250 / 500 tasks) has just
 * been crossed so a Discovery Reveal can play.
 */
export function useWorldUnlocks(completedTasks: number): UseWorldUnlocksResult {
  const prevRef = useRef(completedTasks);
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    const crossed = MILESTONES.find((m) => prev < m && completedTasks >= m);
    if (crossed) setActiveMilestone(crossed);
    prevRef.current = completedTasks;
  }, [completedTasks]);

  const regions = useMemo<RegionProgress[]>(() => {
    const sorted = [...REGIONS].sort((a, b) => a.unlockAt - b.unlockAt);

    return sorted.map((region, i) => {
      const prevThreshold = sorted[i - 1]?.unlockAt ?? 0;
      const span = Math.max(region.unlockAt - prevThreshold, 1);
      const clarity =
        region.unlockAt === 0
          ? 1
          : Math.min(Math.max((completedTasks - prevThreshold) / span, 0), 1);

      return {
        region,
        clarity,
        unlocked: completedTasks >= region.unlockAt,
      };
    });
  }, [completedTasks]);

  const dismissMilestone = useCallback(() => setActiveMilestone(null), []);

  return { regions, activeMilestone, dismissMilestone };
}
