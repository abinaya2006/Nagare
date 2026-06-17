"use client";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CIRCADIAN_NANI_LINES,
  ENERGY_DRAINER_LABELS,
  ENERGY_SOURCE_LABELS,
  FOCUS_DURATION_LABELS,
  type FlowPreferences,
  type UserProfile,
} from "@/types/settings";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface UseSettingsResult {
  insights: string[];
  isSaving: boolean;
  isLoggedOut: boolean;
  saveError: string | null;
  save: () => Promise<boolean>;
  logout: () => Promise<void>;
}

function focusDurationToMinutes(d: string): number {
  const map: Record<string, number> = {
    "15-25": 20,
    "30-45": 37,
    "45-60": 52,
    "60-90": 75,
    "90+": 120,
  };
  return map[d] ?? 52;
}

function breakPreferenceToString(b: string): string {
  const map: Record<string, string> = {
    "25min": "Every 25 minutes",
    "45min": "Around 45 minutes in",
    "60min": "After a full hour",
    "whenever-tired": "When my body tells me",
    "forget-breaks": "I forget breaks exist",
  };
  return map[b] ?? b;
}

function sleepHoursToString(s: string): string {
  const map: Record<string, string> = {
    "less-than-5": "Under 5 hours",
    "5-6": "5–6 hours",
    "6-7": "6–7 hours",
    "7-8": "7–8 hours",
    "8-plus": "More than 8 hours",
  };
  return map[s] ?? s;
}

function lifeCurrentToTaskCount(l: string): number {
  const map: Record<string, number> = {
    "mostly-free": 3,
    "moderately-busy": 5,
    "very-busy": 7,
    "pure-chaos": 10,
  };
  return map[l] ?? 5;
}

function mapToPayload(preferences: FlowPreferences) {
  const routine_tasks = preferences.protectedBlocks
    .filter((block) => block.endHour > block.startHour) // ✅ skip overnight blocks
    .map((block) => {
      const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");
      const toTime = (h: number) => `${pad(h)}:${h % 1 === 0.5 ? "30" : "00"}`;
      return {
        title: block.label,
        start_time: toTime(block.startHour),
        end_time: toTime(block.endHour),
        days: ["daily"],
        is_active: true,
      };
    });

  return {
    productivity_period: preferences.circadianPeriod,
    work_style: preferences.flowStyle ?? undefined,
    focus_duration_minutes: focusDurationToMinutes(preferences.focusDuration),
    break_preference: breakPreferenceToString(preferences.breakPreference),
    sleep_hours: sleepHoursToString(preferences.sleepHours),
    task_count: lifeCurrentToTaskCount(preferences.lifeCurrent),
    routine_tasks,
  };
}

export function useSettings(
  preferences: FlowPreferences,
  profile: UserProfile,
): UseSettingsResult {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { logout: authLogout } = useAuth();
  const router = useRouter();

  const insights = useMemo(() => {
    const lines: string[] = [CIRCADIAN_NANI_LINES[preferences.circadianPeriod]];
    if (preferences.energySources.length > 0) {
      const top = preferences.energySources[0];
      lines.push(
        `You focus longest when working on ${ENERGY_SOURCE_LABELS[top].toLowerCase()}.`,
      );
    }
    if (preferences.energyDrainers.length > 0) {
      const top = preferences.energyDrainers[0];
      lines.push(
        `Your energy dips after ${ENERGY_DRAINER_LABELS[top].toLowerCase()}.`,
      );
    }
    lines.push(
      `You thrive with ${FOCUS_DURATION_LABELS[preferences.focusDuration]} focus sessions.`,
    );
    if (preferences.protectedBlocks.length > 0) {
      lines.push(
        `I'll keep ${preferences.protectedBlocks.length} part${preferences.protectedBlocks.length === 1 ? "" : "s"} of your day protected, always.`,
      );
    }
    return lines.slice(0, 4);
  }, [preferences]);
  const save = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      console.log("🛡️ Protected blocks:", preferences.protectedBlocks);
      const payload = mapToPayload(preferences);
      console.log("📤 Payload:", JSON.stringify(payload, null, 2));
      await api.put("/preferences/me", payload);
      return true;
    } catch (err: any) {
      console.error("❌ Save error:", err.response?.data);
      setSaveError(
        "Your world didn't quite catch the update. Try again in a moment.",
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [preferences]);

  const logout = useCallback(async () => {
    try {
      await authLogout();
    } catch {
      // drift away visually even on failure
    } finally {
      setIsLoggedOut(true);
      router.push("/login");
    }
  }, [authLogout, router]);

  return { insights, isSaving, isLoggedOut, saveError, save, logout };
}
