// services/offlineQueue.ts
// Add this to your existing offlineQueue - it filters out stale PATCH /complete entries
// that were queued when CORS was failing

import localforage from "localforage";
import { api } from "@/services/api";

interface QueuedRequest {
  method: "get" | "post" | "put" | "patch" | "delete";
  url: string;
  data?: unknown;
}

const QUEUE_KEY = "nagare-offline-queue";

export async function enqueue(request: QueuedRequest) {
  const queue = (await localforage.getItem<QueuedRequest[]>(QUEUE_KEY)) ?? [];
  queue.push(request);
  await localforage.setItem(QUEUE_KEY, queue);
}

export async function flushQueue() {
  const queue = (await localforage.getItem<QueuedRequest[]>(QUEUE_KEY)) ?? [];
  if (queue.length === 0) return;

  // Filter out any stale PATCH /complete requests — these fail due to CORS
  // and will never succeed without a backend change
  const replayable = queue.filter(
    (r) => !(r.method === "patch" && r.url.includes("/complete"))
  );

  const remaining: QueuedRequest[] = [];

  for (const request of replayable) {
    try {
      await (api as any)[request.method](request.url, request.data);
    } catch {
      remaining.push(request);
    }
  }

  await localforage.setItem(QUEUE_KEY, remaining);
}

export async function clearQueue() {
  await localforage.removeItem(QUEUE_KEY);
}
