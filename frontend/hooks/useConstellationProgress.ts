"use client";
import { useMemo } from "react";
import { CONSTELLATIONS, type ConstellationData } from "@/lib/world-data";

export interface ConstellationProgress {
  constellation: ConstellationData;
  revealedStarCount: number;
  revealedConnections: [number, number][];
  unlocked: boolean;
}

const STARS_PER_REVEAL = 2; // every 2 completed tasks reveals 1 star

export function useConstellationProgress(completedTasks: number): ConstellationProgress[] {
  return useMemo(() => {
    const globalRevealLimit = Math.floor(completedTasks / STARS_PER_REVEAL);
    let runningStarCount = 0;

    return CONSTELLATIONS.map((constellation) => {
      const starsInThis = constellation.stars.length;
      const revealedSoFar = Math.max(0, globalRevealLimit - runningStarCount);
      const revealedStarCount = Math.min(starsInThis, revealedSoFar);
      runningStarCount += starsInThis;

      // show connections once 2+ stars in this constellation are visible
      const connectionsReady = revealedStarCount >= 2;
      const revealedConnections = connectionsReady
        ? constellation.connections.filter(
            ([a, b]) => a < revealedStarCount && b < revealedStarCount
          )
        : [];

      // unlocked = all stars revealed
      const unlocked = revealedStarCount >= starsInThis;

      return {
        constellation,
        revealedStarCount,
        revealedConnections,
        unlocked,
      };
    });
  }, [completedTasks]);
}
