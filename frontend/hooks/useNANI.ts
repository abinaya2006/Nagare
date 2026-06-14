"use client";

import { useCallback, useEffect, useState } from "react";
import type { NaniMessage } from "@/types";

interface UseNaniResult {
  messages: NaniMessage[];
  isThinking: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
}

/**
 * Handles conversation state for NANI, the ambient AI companion.
 * Talks to GET /api/v1/NANI/history and POST /api/v1/NANI/process.
 */
export function useNANI(): UseNaniResult {
  const [messages, setMessages] = useState<NaniMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/NANI/history");
      if (!res.ok) throw new Error("Failed to load history");
      const data = await res.json();
      if (Array.isArray(data?.messages)) {
        setMessages(data.messages);
      }
    } catch {
      // Quietly fall back to local-only conversation if history is unavailable
      setMessages((prev) =>
        prev.length
          ? prev
          : [
              {
                id: "welcome",
                role: "nani",
                content:
                  "I'm here. Whenever you're ready, tell me what's drifting through your mind.",
                timestamp: new Date().toISOString(),
              },
            ]
      );
    }
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

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
      const res = await fetch("/api/v1/NANI/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) throw new Error("NANI could not respond");

      const data = await res.json();
      const reply: NaniMessage = {
        id: data?.id ?? `nani-${Date.now()}`,
        role: "nani",
        content: data?.reply ?? "I'm holding that thought with you.",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, reply]);
    } catch {
      setError("NANI is drifting just out of reach right now. Try again soon.");
    } finally {
      setIsThinking(false);
    }
  }, []);

  return { messages, isThinking, error, sendMessage, refreshHistory };
}
