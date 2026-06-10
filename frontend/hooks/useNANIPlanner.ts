"use client";
import { useState, useCallback } from "react";
import { api } from "@/services/api";
import type { NANIProcessResult } from "@/types";

const NANI_INSIGHTS = [
  "I noticed your evening is a little crowded. Perhaps one task belongs in tomorrow's flow.",
  "Your morning has strong energy. Deep work will flow best before noon.",
  "The Builder constellation is calling — your project tasks are waiting to align.",
  "A moment of stillness between 1 PM and 3 PM could help your afternoon flow.",
  "You have several high-priority thoughts today. Consider which one matters most right now.",
  "The river looks balanced. You're finding your rhythm.",
];

export function useNANIPlanner() {
  const [processing, setProcessing] = useState(false);
  const [currentInsight, setCurrentInsight] = useState(NANI_INSIGHTS[0]);

  const processNaturalLanguage = useCallback(
    async (text: string): Promise<NANIProcessResult> => {
      setProcessing(true);
      try {
        const { data } = await api.post(
          "/orda/process",
          { message: text },
          {
            headers: {
              Authorization: api.defaults.headers.common
                .Authorization as string,
            },
          },
        );

        // Map backend response to NANIProcessResult
        const actionData = data?.data ?? {};
        return {
          title: text,
          priority: actionData?.priority ?? "medium",
          state: "waiting",
          category: "Study",
          constellation: "The Scholar",
          deadline: actionData?.deadline ?? new Date().toISOString(),
          duration: actionData?.estimated_duration_minutes
            ? `${actionData.estimated_duration_minutes}m`
            : "60m",
          energy: "Medium",
          segment: "afternoon",
          notes: data?.summary ?? "",
          insight:
            data?.summary ??
            NANI_INSIGHTS[Math.floor(Math.random() * NANI_INSIGHTS.length)],
        };
      } catch {
        // Fall back to local parsing if API fails
        return localParse(text);
      } finally {
        setProcessing(false);
      }
    },
    [],
  );

  const rotateInsight = useCallback(() => {
    const idx = Math.floor(Math.random() * NANI_INSIGHTS.length);
    setCurrentInsight(NANI_INSIGHTS[idx]);
  }, []);

  return {
    processNaturalLanguage,
    processInput: processNaturalLanguage,
    processing,
    isProcessing: processing,
    currentInsight,
    rotateInsight,
  };
}

function localParse(text: string): NANIProcessResult {
  const lower = text.toLowerCase();
  let segment: NANIProcessResult["segment"] = "afternoon";
  if (lower.includes("tonight") || lower.includes("evening"))
    segment = "evening";
  else if (lower.includes("morning") || /\b[89](\s|am|:)/.test(lower))
    segment = "morning";

  let priority: NANIProcessResult["priority"] = "medium";
  if (lower.includes("urgent") || lower.includes("important"))
    priority = "critical";
  else if (lower.includes("high")) priority = "high";
  else if (lower.includes("low")) priority = "low";

  return {
    title: text.trim(),
    priority,
    state: "waiting",
    category: "Study",
    constellation: "The Scholar",
    deadline: new Date().toISOString(),
    duration: "60m",
    energy: "Medium",
    segment,
    notes: "",
    insight: NANI_INSIGHTS[0],
  };
}
