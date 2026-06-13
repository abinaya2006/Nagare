"use client";

import { useCallback, useMemo, useState } from "react";
import {
  CIRCADIAN_NANI_LINES,
  ENERGY_DRAINER_LABELS,
  ENERGY_SOURCE_LABELS,
  FOCUS_DURATION_LABELS,
  type FlowPreferences,
  type UserProfile,
} from "@/types/settings";

interface UseSettingsResult {
  insights: string[];
  isSaving: boolean;
  isLoggedOut: boolean;
  saveError: string | null;
  save: () => Promise<boolean>;
  logout: () => Promise<void>;
}

/**
 * Turns the current preferences into a handful of gentle NANI observations,
 * and handles the two "world-changing" actions on this page: saving
 * (PUT /api/v1/settings) and Return to Stillness (POST /api/v1/auth/logout).
 */
export function useSettings(preferences: FlowPreferences, profile: UserProfile): UseSettingsResult {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const insights = useMemo(() => {
    const lines: string[] = [CIRCADIAN_NANI_LINES[preferences.circadianPeriod]];

    if (preferences.energySources.length > 0) {
      const top = preferences.energySources[0];
      lines.push(`You focus longest when working on ${ENERGY_SOURCE_LABELS[top].toLowerCase()}.`);
    }

    if (preferences.energyDrainers.length > 0) {
      const top = preferences.energyDrainers[0];
      lines.push(`Your energy dips after ${ENERGY_DRAINER_LABELS[top].toLowerCase()}.`);
    }

    lines.push(`You thrive with ${FOCUS_DURATION_LABELS[preferences.focusDuration]} focus sessions.`);

    if (preferences.protectedBlocks.length > 0) {
      lines.push(`I'll keep ${preferences.protectedBlocks.length} part${preferences.protectedBlocks.length === 1 ? "" : "s"} of your day protected, always.`);
    }

    return lines.slice(0, 4);
  }, [preferences]);

  const save = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/v1/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, preferences }),
      });
      if (!res.ok) throw new Error("Could not save");
      return true;
    } catch {
      setSaveError("Your world didn't quite catch the update. Try again in a moment.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [preferences, profile]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch {
      // Even if the request fails, let the user drift away visually.
    } finally {
      setIsLoggedOut(true);
    }
  }, []);

  return { insights, isSaving, isLoggedOut, saveError, save, logout };
}
