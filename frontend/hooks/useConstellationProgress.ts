"use client";

import { useMemo } from "react";
import { CONSTELLATIONS, type ConstellationData } from "@/lib/world-data";

export interface ConstellationProgress {
  constellation: ConstellationData;
  /** how many of this constellation's stars are currently revealed */
  revealedStarCount: number;
  /** connection pairs (star indices) currently visible */
  revealedConnections: [number, number][];
  /** true once enough Flow Energy has gathered for this constellation's lore */
  unlocked: boolean;
}

const STARS_PER_REVEAL = 5; // "every 5 tasks: reveal a new star"

/**
 * Derives, from total completed tasks, how much of each constellation is
 * currently visible: which stars have appeared, which are connected, and
 * whether the constellation itself - and its lore - has been unlocked.
 */
export function useConstellationProgress(completedTasks: number): ConstellationProgress[] {
  return useMemo(() => {
    const globalRevealLimit = Math.floor(completedTasks / STARS_PER_REVEAL);
    let runningStarCount = 0;

    return CONSTELLATIONS.map((constellation) => {
      const starsInThis = constellation.stars.length;
      const revealedSoFar = Math.max(0, globalRevealLimit - runningStarCount);
      const revealedStarCount = Math.min(starsInThis, revealedSoFar);
      runningStarCount += starsInThis;

      const connectionsReady = completedTasks >= constellation.connectAt;
      const revealedConnections = connectionsReady
        ? constellation.connections.filter(
            ([a, b]) => a < revealedStarCount && b < revealedStarCount
          )
        : [];

      return {
        constellation,
        revealedStarCount,
        revealedConnections,
        unlocked: completedTasks >= constellation.unlockAt,
      };
    });
  }, [completedTasks]);
}
