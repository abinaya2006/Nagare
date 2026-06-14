"use client";
import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_PREFERENCES,
  type FlowPreferences,
  type ProtectedBlock,
  type CircadianPeriod,
  type FocusDuration,
  type BreakPreference,
  type SleepHours,
  type LifeCurrentLevel,
} from "@/types/settings";
import { api } from "@/services/api";

type ArrayPreferenceKey = "distractions" | "energyDrainers" | "energySources";

interface UsePreferencesResult {
  preferences: FlowPreferences;
  loading: boolean;
  setPreference: <K extends keyof FlowPreferences>(key: K, value: FlowPreferences[K]) => void;
  toggleInArray: <K extends ArrayPreferenceKey>(key: K, value: FlowPreferences[K][number]) => void;
  addProtectedBlock: (block: ProtectedBlock) => void;
  removeProtectedBlock: (id: string) => void;
  updateProtectedBlock: (id: string, patch: Partial<ProtectedBlock>) => void;
}

function minutesToFocusDuration(m: number): FocusDuration {
  if (m <= 25) return "15-25";
  if (m <= 45) return "30-45";
  if (m <= 60) return "45-60";
  if (m <= 90) return "60-90";
  return "90+";
}

function breakStringToPreference(s: string): BreakPreference {
  const map: Record<string, BreakPreference> = {
    "Every 25 minutes": "25min",
    "Around 45 minutes in": "45min",
    "After a full hour": "60min",
    "When my body tells me": "whenever-tired",
    "I forget breaks exist": "forget-breaks",
  };
  return map[s] ?? "45min";
}

function sleepStringToHours(s: string): SleepHours {
  const map: Record<string, SleepHours> = {
    "Under 5 hours": "less-than-5",
    "5–6 hours": "5-6",
    "6–7 hours": "6-7",
    "7–8 hours": "7-8",
    "More than 8 hours": "8-plus",
  };
  return map[s] ?? "6-7";
}

function taskCountToLifeCurrent(n: number): LifeCurrentLevel {
  if (n <= 3) return "mostly-free";
  if (n <= 5) return "moderately-busy";
  if (n <= 7) return "very-busy";
  return "pure-chaos";
}

function mapFromBackend(data: any): Partial<FlowPreferences> {
  const prefs = data?.preferences;
  if (!prefs) return {};

  const protectedBlocks: ProtectedBlock[] = (data?.routine_tasks ?? []).map((t: any, i: number) => {
    const toHour = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      return h + (m === 30 ? 0.5 : 0);
    };
    return {
      id: t.id ?? `block-${i}`,
      category: "custom" as const,
      label: t.title,
      startHour: toHour(t.start_time),
      endHour: toHour(t.end_time),
    };
  });

  return {
    ...(prefs.productivity_period && { circadianPeriod: prefs.productivity_period as CircadianPeriod }),
    ...(prefs.work_style && { flowStyle: prefs.work_style as any }),
    ...(prefs.focus_duration_minutes && { focusDuration: minutesToFocusDuration(prefs.focus_duration_minutes) }),
    ...(prefs.break_preference && { breakPreference: breakStringToPreference(prefs.break_preference) }),
    ...(prefs.sleep_hours && { sleepHours: sleepStringToHours(prefs.sleep_hours) }),
    ...(prefs.task_count && { lifeCurrent: taskCountToLifeCurrent(prefs.task_count) }),
    ...(protectedBlocks.length > 0 && { protectedBlocks }),
  };
}

export function usePreferences(initial: FlowPreferences = DEFAULT_PREFERENCES): UsePreferencesResult {
  const [preferences, setPreferences] = useState<FlowPreferences>(initial);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/preferences/me")
      .then(({ data }) => {
        console.log('📦 Raw preferences from backend:', data);
        const mapped = mapFromBackend(data);
        console.log('🗺️ Mapped preferences:', mapped);
        setPreferences(prev => ({ ...prev, ...mapped }));
      })
      .catch(() => {
        // fall back to defaults silently
      })
      .finally(() => setLoading(false));
  }, []);

  const setPreference = useCallback(
    <K extends keyof FlowPreferences>(key: K, value: FlowPreferences[K]) => {
      setPreferences((prev) => ({ ...prev, [key]: value }));
    }, []
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
    }, []
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
    loading,
    setPreference,
    toggleInArray,
    addProtectedBlock,
    removeProtectedBlock,
    updateProtectedBlock,
  };
}
