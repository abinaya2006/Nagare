"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/services/api";
import type { NaniMessage } from "@/types";
import { apiBase } from "@/services/api";

interface UseNaniResult {
  messages: NaniMessage[];
  isThinking: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
}

export function useNANI(): UseNaniResult {
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

  const refreshHistory = useCallback(async () => {}, []);

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    console.log('🔑 Token:', api.defaults.headers.common.Authorization ?? 'NONE');

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
      const { data } = await apiBase.post("/orda/process", { message: trimmed }, {
        headers: { Authorization: api.defaults.headers.common.Authorization }
      });
      console.log('🤖 NANI response:', data);
      console.log('💬 Reply content:', data?.summary);
      const reply: NaniMessage = {
        id: `nani-${Date.now()}`,
        role: "nani",
        content: data?.summary ?? "I'm holding that thought with you.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => {
        const updated = [...prev, reply];
        console.log('📨 Messages:', updated);
        return updated;
      });
    } catch {
      setError("NANI is drifting just out of reach right now. Try again soon.");
    } finally {
      setIsThinking(false);
    }
  }, []);

  return { messages, isThinking, error, sendMessage, refreshHistory };
}
