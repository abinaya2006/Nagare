"use client";
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import localforage from "localforage";
import { api, setAuthToken } from "@/services/api";
import { enqueue, flushQueue } from "@/services/offlineQueue";
import { useAuth } from "@/contexts/AuthContext";
import type { Task, TaskInput } from "@/types";

type TaskContextValue = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createTask: (task: TaskInput) => Promise<void>;
  updateTask: (id: string, task: Partial<TaskInput>) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
};

const TaskContext = createContext<TaskContextValue | null>(null);
const cacheKey = "nagare-tasks";

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth(); // <-- grab session for token
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync auth token whenever session changes
  useEffect(() => {
    setAuthToken(session?.access_token);
  }, [session]);

  const refresh = useCallback(async () => {
    if (!user) { setTasks([]); return; }
    setLoading(true);
    try {
      await flushQueue();
      // Backend returns { tasks: Task[] }
      const response = await api.get<{ tasks: Task[] }>("/tasks");
      setTasks(response.data.tasks);
      await localforage.setItem(cacheKey, response.data.tasks);
      setError(null);
    } catch {
      setTasks((await localforage.getItem<Task[]>(cacheKey)) ?? []);
      setError("Showing cached tasks while offline.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
    window.addEventListener("online", refresh);
    return () => window.removeEventListener("online", refresh);
  }, [refresh]);

  const value = useMemo<TaskContextValue>(() => ({
    tasks,
    loading,
    error,
    refresh,

    async createTask(task) {
      try {
        // Backend returns { message, task: Task }
        const response = await api.post<{ message: string; task: Task }>("/tasks", task);
        setTasks((prev) => [response.data.task, ...prev]);
      } catch {
        await enqueue({ method: "post", url: "/tasks", data: task });
        setError("Task queued and will sync when online.");
      }
    },

    async updateTask(id, task) {
      // Optimistic update — backend only returns { message }
      setTasks((prev) =>
        prev.map((item) => item.id === id ? { ...item, ...task } as Task : item)
      );
      try {
        await api.put(`/tasks/${id}`, task);
      } catch {
        await enqueue({ method: "put", url: `/tasks/${id}`, data: task });
      }
    },

    async completeTask(id) {
      // Optimistic update
      setTasks((prev) =>
        prev.map((item) => item.id === id ? { ...item, state: "resolved" } as Task : item)
      );
      try {
        await api.patch(`/tasks/${id}/complete`);
      } catch {
        await enqueue({ method: "put", url: `/tasks/${id}`, data: { state: "resolved" } });
      }
    },

    async deleteTask(id) {
      setTasks((prev) => prev.filter((task) => task.id !== id));
      try {
        await api.delete(`/tasks/${id}`);
      } catch {
        await enqueue({ method: "delete", url: `/tasks/${id}` });
      }
    },
  }), [error, loading, tasks, refresh]);

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used inside TaskProvider");
  return context;
}
