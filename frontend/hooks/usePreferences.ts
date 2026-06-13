"use client";

import { useCallback, useState } from "react";
import {
  DEFAULT_PREFERENCES,
  type FlowPreferences,
  type ProtectedBlock,
} from "@/types/settings";

type ArrayPreferenceKey = "distractions" | "energyDrainers" | "energySources";

interface UsePreferencesResult {
  preferences: FlowPreferences;
  setPreference: <K extends keyof FlowPreferences>(key: K, value: FlowPreferences[K]) => void;
  toggleInArray: <K extends ArrayPreferenceKey>(key: K, value: FlowPreferences[K][number]) => void;
  addProtectedBlock: (block: ProtectedBlock) => void;
  removeProtectedBlock: (id: string) => void;
  updateProtectedBlock: (id: string, patch: Partial<ProtectedBlock>) => void;
}

/**
 * Holds every Mind Sanctuary preference in one place - the river position,
 * the chosen constellations, the drifting clouds the user has tapped, and
 * so on. Nothing here is validated like a form; every choice is just a
 * little more context for NANI.
 */
export function usePreferences(initial: FlowPreferences = DEFAULT_PREFERENCES): UsePreferencesResult {
  const [preferences, setPreferences] = useState<FlowPreferences>(initial);

  const setPreference = useCallback(
    <K extends keyof FlowPreferences>(key: K, value: FlowPreferences[K]) => {
      setPreferences((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const toggleInArray = useCallback(
    <K extends ArrayPreferenceKey>(key: K, value: FlowPreferences[K][number]) => {
      setPreferences((prev) => {
        const current = prev[key] as FlowPreferences[K];
        const exists = (current as unknown[]).includes(value);
        const next = exists
          ? (current as unknown[]).filter((v) => v !== value)
          : [...(current as unknown[]), value];
        return { ...prev, [key]: next } as FlowPreferences;
      });
    },
    []
  );

  const addProtectedBlock = useCallback((block: ProtectedBlock) => {
    setPreferences((prev) => ({ ...prev, protectedBlocks: [...prev.protectedBlocks, block] }));
  }, []);

  const removeProtectedBlock = useCallback((id: string) => {
    setPreferences((prev) => ({
      ...prev,
      protectedBlocks: prev.protectedBlocks.filter((b) => b.id !== id),
    }));
  }, []);

  const updateProtectedBlock = useCallback((id: string, patch: Partial<ProtectedBlock>) => {
    setPreferences((prev) => ({
      ...prev,
      protectedBlocks: prev.protectedBlocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  }, []);

  return {
    preferences,
    setPreference,
    toggleInArray,
    addProtectedBlock,
    removeProtectedBlock,
    updateProtectedBlock,
  };
}
