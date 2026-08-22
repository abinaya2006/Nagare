"use client";

import { useCallback, useState } from "react";

interface UseFlowEnergyResult {
  /** total completed tasks, ever - the world's single source of progress */
  completedTasks: number;
  /** one star fragment per completed task */
  starFragments: number;
  /** simulate completing a task (used by the demo "settle a thought" action) */
  addFlowEnergy: (amount?: number) => void;
}

/**
 * Flow Energy is Nagare's only progress currency: every completed task adds
 * one star fragment to the sky. No points, no streaks - just a slowly
 * growing universe.
 */
export function useFlowEnergy(initialCompletedTasks = 0): UseFlowEnergyResult {
  const [completedTasks, setCompletedTasks] = useState(Math.max(0, initialCompletedTasks));

  const addFlowEnergy = useCallback((amount = 1) => {
    setCompletedTasks((prev) => Math.max(0, prev + amount));
  }, []);

  return {
    completedTasks,
    starFragments: completedTasks,
    addFlowEnergy,
  };
}
