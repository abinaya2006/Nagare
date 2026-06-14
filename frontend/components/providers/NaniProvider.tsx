"use client";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { api } from "@/services/api";
import { supabase } from "@/lib/supabase";
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
      // ✅ Get fresh token from Supabase session
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        setError("You need to be logged in for NANI to respond.");
        setIsThinking(false);
        return;
      }

      const authHeader = `Bearer ${token}`;

      // Get preferences (optional, don't block if fails)
      let preferences = {};
      try {
        const { data: prefsData } = await api.get("/preferences/me", {
          headers: { Authorization: authHeader },
          timeout: 5000,
        });
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
        "/orda/process",
        { message: trimmed, preferences },
        { headers: { Authorization: authHeader } },
      );

      const reply: NaniMessage = {
        id: `nani-${Date.now()}`,
        role: "nani",
        content: data?.response ?? data?.summary ?? "I'm holding that thought with you.",
        timestamp: new Date().toISOString(),
      };

      // ✅ Handle schedule display
      if (data?.data?.updated_schedule?.length > 0) {
        const items = data.data.updated_schedule;
        const scheduleText = items
          .map((item: any) => {
            const start = new Date(item.start_time).toLocaleTimeString("en-IN", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });
            const end = new Date(item.end_time).toLocaleTimeString("en-IN", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });
            return `• ${item.task_title} (${start} – ${end})`;
          })
          .join("\n");
        reply.content = `${reply.content}\n\n${scheduleText}`;
      }

      // ✅ Handle task creation intent
      if (data?.intent === "create_task" || data?.intent === "add_task") {
        try {
          // Extract just the task title - remove common prefixes and duration
          const taskTitle = trimmed
            .replace(/^(add|create|make|schedule)\s+(a\s+)?(task\s*)?(:|-)?\s*/i, "")
            .replace(/,?\s*\d+\s*(hour|hr|minute|min)s?.*/i, "")
            .trim()
            .slice(0, 160);

          // Extract duration if mentioned
          const durationMatch = trimmed.match(/(\d+)\s*(hour|hr)/i);
          const minuteMatch = trimmed.match(/(\d+)\s*(minute|min)/i);
          const duration = durationMatch
            ? parseInt(durationMatch[1]) * 60
            : minuteMatch
            ? parseInt(minuteMatch[1])
            : 30;

          await api.post(
            "/tasks",
            {
              title: taskTitle || trimmed.slice(0, 160),
              estimated_duration_minutes: Math.min(Math.max(duration, 5), 1440),
              priority: "medium",
              status: "pending",
            },
            { headers: { Authorization: authHeader } },
          );

          reply.content = `${reply.content}\n\n✓ Task "${taskTitle}" added to your list.`;
        } catch {}
      }

      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      console.error("NANI error:", err);
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
