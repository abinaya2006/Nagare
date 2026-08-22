"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/services/api";

export type NaniHealthState = "loading" | "healthy" | "degraded" | "unavailable";

interface NaniHealthResult {
  state: NaniHealthState;
  lastChecked: Date | null;
  refresh: () => void;
}

/**
 * Polls the existing /health endpoint. Backend currently only returns
 * { status, service } - no per-capability breakdown yet - so this is the
 * smallest honest abstraction: one real signal, not fabricated sub-metrics.
 * When the backend grows dedicated checks (schedule engine, memory sync,
 * etc.) this hook is the only place that needs to change.
 */
export function useNaniHealth(): NaniHealthResult {
  const [state, setState] = useState<NaniHealthState>("loading");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const check = useCallback(() => {
    api
      .get("/health")
      .then(({ data }) => {
        setState(data?.status === "ok" ? "healthy" : "degraded");
        setLastChecked(new Date());
      })
      .catch(() => {
        setState("unavailable");
        setLastChecked(new Date());
      });
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return { state, lastChecked, refresh: check };
}
