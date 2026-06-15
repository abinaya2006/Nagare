"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { api } from "@/services/api";
import type { ScheduleOutput } from "@/types";

type ScheduleContextValue = {
  schedule: ScheduleOutput;
  loading: boolean;
  error: string | null;
  generate: () => Promise<void>;
  reschedule: () => Promise<void>;
};

const emptySchedule: ScheduleOutput = { blocks: [] };
const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [schedule, setSchedule] = useState<ScheduleOutput>(emptySchedule);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function call(url: string) {
    setLoading(true);
    try {
      const response = await api.post<ScheduleOutput>(url, {
        preferences: {
          workday_start: "09:00",
          workday_end: "17:00",
          productivity_period: "morning",
        },
      });
      setSchedule(response.data);
      setError(null);
    } catch {
      setError("Could not generate a schedule right now.");
    } finally {
      setLoading(false);
    }
  }

  const value = useMemo<ScheduleContextValue>(
    () => ({
      schedule,
      loading,
      error,
      generate: () => call("/schedule/generate"),
      reschedule: () => call("/schedule/reschedule"),
    }),
    [error, loading, schedule],
  );

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context)
    throw new Error("useSchedule must be used inside ScheduleProvider");
  return context;
}
