"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import localforage from "localforage";
import { api, setAuthToken } from "@/services/api";
import { enqueue, flushQueue } from "@/services/offlineQueue";
import { useAuth } from "@/contexts/AuthContext";
import type {
  Task,
  TaskInput,
  TaskPriority,
  TaskState,
  TaskSegment,
} from "@/types";

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

function mapBackendTask(t: any): Task {
  const deadline = t.deadline ? new Date(t.deadline) : null;
  const hour = deadline ? deadline.getHours() : 12;
  const segment: TaskSegment =
    hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  const statusMap: Record<string, TaskState> = {
    pending: "waiting",
    scheduled: "flowing",
    completed: "resolved",
  };

  const priorityMap: Record<string, TaskPriority> = {
    high: "high",
    medium: "medium",
    low: "low",
    critical: "critical",
  };

  const mappedState: TaskState = statusMap[t.status] ?? "waiting";
  const isOverdue =
    mappedState === "waiting" && deadline !== null && deadline < new Date();
  const state: TaskState = isOverdue ? "overdue" : mappedState;
  const mins: number = t.estimated_duration_minutes ?? 30;

  return {
    id: t.id,
    title: t.title,
    priority: priorityMap[t.priority] ?? "medium",
    state,
    category: t.category ?? "Study",
    constellation: t.constellation ?? "The Scholar",
    deadline: t.deadline ?? new Date().toISOString(),
    duration:
      mins >= 60
        ? `${Math.floor(mins / 60)}h${mins % 60 > 0 ? ` ${mins % 60}m` : ""}`
        : `${mins}m`,
    energy: t.energy ?? "Medium",
    notes: t.description ?? "",
    segment,
    createdAt: t.created_at ?? new Date().toISOString(),
  };
}

function toBackendCreate(task: TaskInput): Record<string, unknown> {
  let estimated_duration_minutes = 30;
  if (task.duration) {
    const hMatch = task.duration.match(/(\d+)h/);
    const mMatch = task.duration.match(/(\d+)m/);
    estimated_duration_minutes =
      (hMatch ? parseInt(hMatch[1]) * 60 : 0) +
        (mMatch ? parseInt(mMatch[1]) : 0) || 30;
  }
  const stateToStatus: Record<string, string> = {
    waiting: "pending",
    flowing: "scheduled",
    resolved: "completed",
    overdue: "pending",
  };
  return {
    title: task.title,
    description: task.notes ?? "",
    deadline: task.deadline ?? null,
    estimated_duration_minutes,
    priority:
      task.priority === "critical" ? "high" : (task.priority ?? "medium"),
    status: stateToStatus[task.state ?? "waiting"] ?? "pending",
    is_routine: false,
  };
}
function toBackendUpdate(task: Partial<TaskInput>): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  if (task.title !== undefined) patch.title = task.title;
  if (task.notes !== undefined) patch.description = task.notes;
  if (task.deadline !== undefined) patch.deadline = task.deadline;
  if (task.priority !== undefined) {
    // Backend doesn't have 'critical' — map it to 'high'
    patch.priority = task.priority === "critical" ? "high" : task.priority;
  }
  if (task.state !== undefined) {
    const stateToStatus: Record<string, string> = {
      waiting: "pending",
      flowing: "scheduled",
      resolved: "completed",
      overdue: "pending",
    };
    patch.status = stateToStatus[task.state] ?? "pending";
  }
  if (task.duration !== undefined) {
    const hMatch = task.duration.match(/(\d+)h/);
    const mMatch = task.duration.match(/(\d+)m/);
    patch.estimated_duration_minutes =
      (hMatch ? parseInt(hMatch[1]) * 60 : 0) +
        (mMatch ? parseInt(mMatch[1]) : 0) || 30;
  }
  return patch;
}
export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("nagare_token");

    if (!token) {
      setTasks([]);
      return;
    }
    setLoading(true);
    try {
      await flushQueue();
      const response = await api.get<{ tasks: any[] }>("/tasks");
      const mapped = response.data.tasks.map(mapBackendTask);
      setTasks(mapped);
      await localforage.setItem(cacheKey, mapped);
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

  const value = useMemo<TaskContextValue>(
    () => ({
      tasks,
      loading,
      error,
      refresh,

      async createTask(task) {
        const payload = toBackendCreate(task);
        try {
          const response = await api.post<{ message: string; task: any }>(
            "/tasks",
            payload,
          );
          setTasks((prev) => [mapBackendTask(response.data.task), ...prev]);
        } catch {
          await enqueue({ method: "post", url: "/tasks", data: payload });
          setError("Task queued and will sync when online.");
        }
      },

      async updateTask(id, task) {
        setTasks((prev) =>
          prev.map((item) =>
            item.id === id ? ({ ...item, ...task } as Task) : item,
          ),
        );
        const patch = toBackendUpdate(task);
        try {
          await api.put(`/tasks/${id}`, patch);
        } catch {
          await enqueue({ method: "put", url: `/tasks/${id}`, data: patch });
        }
      },
      async completeTask(id) {
        setTasks((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, state: "resolved" as TaskState } : item,
          ),
        );
        try {
          await api.patch(`/tasks/${id}/complete`); // ← use the dedicated endpoint
        } catch {
          setTasks((prev) =>
            prev.map((item) =>
              item.id === id
                ? { ...item, state: "waiting" as TaskState }
                : item,
            ),
          );
          await enqueue({
            method: "patch",
            url: `/tasks/${id}/complete`,
            data: {},
          });
        }
      },

      async deleteTask(id) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        try {
          await api.delete(`/tasks/${id}`);
        } catch {
          await enqueue({ method: "delete", url: `/tasks/${id}` });
        }
      },
    }),
    [error, loading, tasks, refresh],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used inside TaskProvider");
  return context;
}
