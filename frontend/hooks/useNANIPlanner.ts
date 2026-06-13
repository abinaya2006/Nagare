"use client";

import { useState, useCallback } from "react";
import type { NANIProcessResult } from "@/types/task";

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

  const processInput = useCallback(
    async (text: string): Promise<NANIProcessResult> => {
      setProcessing(true);
      try {
        // POST /api/v1/NANI/process
        // For now: local NLP parsing. Replace with API call.
        await new Promise((r) => setTimeout(r, 400));
        return parseNaturalLanguage(text);
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

  return { processInput, processing, currentInsight, rotateInsight };
}

function parseNaturalLanguage(text: string): NANIProcessResult {
  const lower = text.toLowerCase();

  // Segment
  let segment: NANIProcessResult["segment"] = "afternoon";
  if (lower.includes("tonight") || lower.includes("evening"))
    segment = "evening";
  else if (lower.includes("morning") || /\b[89](\s|am|:)/.test(lower))
    segment = "morning";

  // Deadline
  let deadline = "This Week";
  if (lower.includes("tonight")) deadline = "Tonight";
  else if (lower.includes("tomorrow")) deadline = "Tomorrow";
  else if (lower.includes("friday")) deadline = "Friday";
  else if (lower.includes("weekend")) deadline = "This Weekend";
  else if (lower.includes("today")) deadline = "Today";

  // Duration
  let duration = "1h";
  const dMatch = text.match(/(\d+)\s*(hour|hr|h|minute|min)\b/i);
  if (dMatch) {
    const isHour = dMatch[2].toLowerCase().startsWith("h");
    duration = dMatch[1] + (isHour ? "h" : "m");
  }

  // Priority
  let priority: NANIProcessResult["priority"] = "medium";
  if (
    lower.includes("urgent") ||
    lower.includes("important") ||
    lower.includes("deadline")
  )
    priority = "critical";
  else if (
    lower.includes("hackathon") ||
    lower.includes("exam") ||
    lower.includes("high")
  )
    priority = "high";
  else if (
    lower.includes("low") ||
    lower.includes("optional") ||
    lower.includes("maybe")
  )
    priority = "low";

  // Category + Constellation
  let category: NANIProcessResult["category"] = "Study";
  let constellation: NANIProcessResult["constellation"] = "The Scholar";
  if (
    lower.includes("project") ||
    lower.includes("build") ||
    lower.includes("auth") ||
    lower.includes("module") ||
    lower.includes("demo") ||
    lower.includes("hackathon")
  ) {
    category = "Projects";
    constellation = "The Builder";
  } else if (
    lower.includes("creative") ||
    lower.includes("design") ||
    lower.includes("brainstorm")
  ) {
    category = "Creative Work";
    constellation = "The Dreamer";
  } else if (lower.includes("explore") || lower.includes("research")) {
    category = "Exploration";
    constellation = "The Explorer";
  } else if (
    lower.includes("habit") ||
    lower.includes("workout") ||
    lower.includes("meditat") ||
    lower.includes("walk")
  ) {
    category = "Habits";
    constellation = "The Guardian";
  }

  // Energy
  let energy: NANIProcessResult["energy"] = "Medium";
  if (priority === "critical" || priority === "high") energy = "High";
  if (priority === "low") energy = "Low";

  // Clean title
  const title =
    text
      .replace(
        /\b(tonight|tomorrow|this week|this weekend|friday|today|evening|morning|afternoon)\b/gi,
        "",
      )
      .replace(/\d+\s*(hour|hr|h|minute|min)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim() || text.trim();

  return {
    title,
    priority,
    state: "waiting",
    category,
    constellation,
    deadline,
    duration,
    energy,
    segment,
    notes: "",
    insight: NANI_INSIGHTS[Math.floor(Math.random() * NANI_INSIGHTS.length)],
  };
}
