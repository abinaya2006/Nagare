import localforage from "localforage";
import { api } from "@/services/api";

export type QueuedAction = { method: "post" | "put" | "delete"; url: string; data?: unknown; createdAt: string };
const key = "pulse-plan-offline-queue";

export async function enqueue(action: Omit<QueuedAction, "createdAt">) {
  const existing = (await localforage.getItem<QueuedAction[]>(key)) ?? [];
  await localforage.setItem(key, [...existing, { ...action, createdAt: new Date().toISOString() }]);
}

export async function flushQueue() {
  const queued = (await localforage.getItem<QueuedAction[]>(key)) ?? [];
  const remaining: QueuedAction[] = [];
  for (const action of queued) {
    try {
      await api.request({ method: action.method, url: action.url, data: action.data });
    } catch {
      remaining.push(action);
    }
  }
  await localforage.setItem(key, remaining);
}

