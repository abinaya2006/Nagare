"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import localforage from "localforage";
import { api } from "@/services/api";
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
  deleteTask: (id: string) => Promise<void>;
};

const TaskContext = createContext<TaskContextValue | null>(null);
const cacheKey = "pulse-plan-tasks";

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    if (!user) {
      setTasks([]);
      return;
    }
    setLoading(true);
    try {
      await flushQueue();
      const response = await api.get<Task[]>("/tasks");
      setTasks(response.data);
      await localforage.setItem(cacheKey, response.data);
      setError(null);
    } catch {
      setTasks((await localforage.getItem<Task[]>(cacheKey)) ?? []);
      setError("Showing cached tasks while offline.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    window.addEventListener("online", refresh);
    return () => window.removeEventListener("online", refresh);
  }, [user]);

  const value = useMemo<TaskContextValue>(() => ({
    tasks,
    loading,
    error,
    refresh,
    async createTask(task) {
      try {
        const response = await api.post<Task>("/tasks", task);
        setTasks((existing) => [response.data, ...existing]);
      } catch {
        await enqueue({ method: "post", url: "/tasks", data: task });
        setError("Task queued and will sync when online.");
      }
    },
    async updateTask(id, task) {
      setTasks((existing) => existing.map((item) => item.id === id ? { ...item, ...task } as Task : item));
      try {
        await api.put(`/tasks/${id}`, task);
      } catch {
        await enqueue({ method: "put", url: `/tasks/${id}`, data: task });
      }
    },
    async deleteTask(id) {
      setTasks((existing) => existing.filter((task) => task.id !== id));
      try {
        await api.delete(`/tasks/${id}`);
      } catch {
        await enqueue({ method: "delete", url: `/tasks/${id}` });
      }
    }
  }), [error, loading, tasks]);

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used inside TaskProvider");
  return context;
}
