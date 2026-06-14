"use client";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { api } from "@/services/api";
import type { NaniMessage } from "@/types";

interface NaniContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  messages: NaniMessage[];
  isThinking: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
}

const NaniContext = createContext<NaniContextValue | null>(null);

export function NaniProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<NaniMessage[]>([
    {
      id: "welcome",
      role: "nani",
      content: "I'm here. Whenever you're ready, tell me what's drifting through your mind.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const userMessage: NaniMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);
    setError(null);

    try {
      let preferences = {};
      try {
        const { data: prefsData } = await api.get("/preferences/me");
        const p = prefsData?.preferences;
        if (p) {
          preferences = {
            productivity_period: p.productivity_period ?? "morning",
            buffer_minutes: 10,
            max_daily_tasks: p.task_count ?? 6,
            allow_weekends: false,
            timezone: "Asia/Kolkata",
          };
        }
      } catch {}

      const { data } = await api.post(
        "http://localhost:8000/orda/process",
        { message: trimmed, preferences },
        { headers: { Authorization: api.defaults.headers.common.Authorization as string } }
      );

      console.log('🎯 NANI intent:', data?.intent);
      console.log('📅 NANI schedule:', data?.schedule);

      const reply: NaniMessage = {
        id: `nani-${Date.now()}`,
        role: "nani",
        content: data?.summary ?? "I'm holding that thought with you.",
        timestamp: new Date().toISOString(),
      };

      if (data?.schedule?.schedule?.length > 0) {
        const items = data.schedule.schedule;
        const scheduleText = items.map((item: any) => {
          const start = new Date(item.start_time).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
          const end = new Date(item.end_time).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
          return `• ${item.task_title} (${start} – ${end})`;
        }).join("\n");
        reply.content = `${data.summary}\n\n${scheduleText}`;

        // Create new tasks if intent is task creation
        if (data?.intent === "create_task" || data?.intent === "add_task") {
          for (const item of items) {
            try {
              await api.post("/tasks", {
                title: item.task_title,
                deadline: item.start_time,
                estimated_duration_minutes: Math.round(
                  (new Date(item.end_time).getTime() - new Date(item.start_time).getTime()) / 60000
                ),
                priority: "medium",
              });
            } catch {}
          }
        }
      }

      setMessages((prev) => [...prev, reply]);
    } catch {
      setError("NANI is drifting just out of reach right now. Try again soon.");
    } finally {
      setIsThinking(false);
    }
  }, []);

  const value: NaniContextValue = {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
    messages,
    isThinking,
    error,
    sendMessage,
  };

  return <NaniContext.Provider value={value}>{children}</NaniContext.Provider>;
}

export function useNaniSidebar(): NaniContextValue {
  const ctx = useContext(NaniContext);
  if (!ctx) throw new Error("useNaniSidebar must be used within a NaniProvider");
  return ctx;
}
