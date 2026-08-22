"use client";
import { useState, useCallback, useEffect } from "react";
import { api } from "@/services/api";
import type { ScheduleSlot, FlowBalance } from "@/types/schedule";

interface ScheduleItem {
  task_id: string;
  task_title: string;
  start_time: string;
  end_time: string;
}

function ensureUtc(dt: string): string {
  if (dt.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(dt)) return dt;
  return dt + "Z";
}

function toSlot(item: ScheduleItem): ScheduleSlot {
  const start = new Date(ensureUtc(item.start_time)); // ← was new Date(item.start_time)
  const end = new Date(ensureUtc(item.end_time));
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  const duration =
    hours > 0 ? (mins > 0 ? `${hours}h ${mins}m` : `${hours}h`) : `${mins}m`;
  const h = start.getHours();
  const m = start.getMinutes();
  const time = `${h % 12 === 0 ? 12 : h % 12}:${m.toString().padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
  return {
    time,
    task: item.task_title,
    duration,
    taskId: item.task_id,
  };
}

function computeFlowBalance(items: ScheduleItem[]): FlowBalance {
  const count = items.length;
  if (count === 0) return { score: 0, state: "dry", label: "No flow yet" };
  if (count <= 3) return { score: 40, state: "dry", label: "Light day" };
  if (count <= 6) return { score: 70, state: "balanced", label: "Flowing" };
  return { score: 90, state: "turbulent", label: "Heavy load" };
}

export function useSchedule() {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]); // ← added
  const [flowBalance, setFlowBalance] = useState<FlowBalance>({
    score: 0,
    state: "dry",
    label: "No flow yet",
  });
  const [naniInsight, setNaniInsight] = useState<string | null>(null);
  const [todayFlow, setTodayFlow] = useState<ScheduleSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const fetchSchedule = useCallback(async () => {
    try {
      const { data } = await api.get("/schedule");
      const items: ScheduleItem[] = data?.schedule ?? [];
      setScheduleItems(items); // ← added
      const mapped = items.map(toSlot);
      setSlots(mapped);
      setTodayFlow(mapped);
      setFlowBalance(computeFlowBalance(items));
    } catch {
      setSlots([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const generateFlow = useCallback(async () => {
    setRegenerating(true);
    try {
      const { data: prefsData } = await api.get("/preferences/me");
      const prefs = prefsData?.preferences;
      const payload = {
        available_hours: [{ start: "09:00", end: "21:00" }],
        productivity_preference: prefs?.productivity_period ?? "morning",
      };
      const { data } = await api.post("/schedule/generate", payload);
      const items: ScheduleItem[] = data?.schedule ?? [];
      setScheduleItems(items); // ← added
      const mapped = items.map(toSlot);
      setSlots(mapped);
      setTodayFlow(mapped);
      setFlowBalance(computeFlowBalance(items));
      setNaniInsight("Your schedule has been regenerated based on your flow.");
    } catch {
      setNaniInsight("Couldn't generate schedule. Try again.");
    } finally {
      setRegenerating(false);
    }
  }, []);

  const reschedule = useCallback(
    async (
      reason: string,
      event: { title: string; start_time: string; end_time: string },
    ) => {
      try {
        const { data } = await api.post("/schedule/reschedule", {
          reason,
          event,
        });
        const items: ScheduleItem[] = data?.updated_schedule ?? [];
        setScheduleItems(items); // ← added
        const mapped = items.map(toSlot);
        setSlots(mapped);
        setTodayFlow(mapped);
        setFlowBalance(computeFlowBalance(items));
      } catch {
        console.error("Reschedule failed");
      }
    },
    [],
  );

  return {
    slots,
    schedule: slots,
    scheduleItems, // ← added
    flowBalance: flowBalance.score,
    naniInsight,
    todayFlow,
    generateFlow,
    reschedule,
    isLoading,
    regenerating,
    regenerate: generateFlow,
  };
}
