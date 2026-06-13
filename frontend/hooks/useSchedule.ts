"use client";

import { useState, useCallback } from "react";
import type { ScheduleSlot } from "@/types/schedule";

const DEFAULT_SLOTS: ScheduleSlot[] = [
  { time: "9:00", task: "Deep Work", duration: "2h" },
  { time: "11:00", task: "Break", duration: "30m" },
  { time: "11:30", task: "DBMS Study", duration: "90m" },
  { time: "2:00", task: "Lunch", duration: "1h" },
  { time: "3:00", task: "Hackathon Prep", duration: "2h" },
  { time: "6:00", task: "DSA Practice", duration: "90m" },
];

export function useSchedule() {
  const [slots, setSlots] = useState<ScheduleSlot[]>(DEFAULT_SLOTS);
  const [regenerating, setRegenerating] = useState(false);

  const regenerate = useCallback(async () => {
    setRegenerating(true);
    try {
      // POST /api/v1/schedule/generate
      await new Promise((r) => setTimeout(r, 800));
      // Shuffle slightly to simulate regeneration
      setSlots((prev) => [...prev].sort(() => Math.random() - 0.5).slice(0, 6));
    } finally {
      setRegenerating(false);
    }
  }, []);

  return { slots, regenerating, regenerate };
}
