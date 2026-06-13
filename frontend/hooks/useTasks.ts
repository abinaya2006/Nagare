"use client";

import { useState, useCallback } from "react";
import type { Task, CreateTaskInput, TaskState } from "@/types/task";

const MOCK_TASKS: Task[] = [
  {
    id: "1",
    title: "Deep Work Session",
    priority: "high",
    state: "flowing",
    category: "Study",
    constellation: "The Scholar",
    deadline: "Today 2:00 PM",
    duration: "2h",
    energy: "High",
    notes: "Focus on algorithms and data structures.",
    segment: "morning",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "DBMS Assignment",
    priority: "critical",
    state: "overdue",
    category: "Study",
    constellation: "The Scholar",
    deadline: "Today 5:00 PM",
    duration: "90m",
    energy: "High",
    notes: "Complete normalization questions.",
    segment: "morning",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Hackathon Demo Prep",
    priority: "high",
    state: "waiting",
    category: "Projects",
    constellation: "The Builder",
    deadline: "Friday",
    duration: "3h",
    energy: "Medium",
    notes: "Polish authentication flow and UI.",
    segment: "afternoon",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Authentication Module",
    priority: "medium",
    state: "waiting",
    category: "Projects",
    constellation: "The Builder",
    deadline: "This Weekend",
    duration: "4h",
    energy: "High",
    notes: "Implement JWT and refresh tokens.",
    segment: "afternoon",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Study DSA Concepts",
    priority: "medium",
    state: "flowing",
    category: "Study",
    constellation: "The Scholar",
    deadline: "Tonight",
    duration: "90m",
    energy: "Medium",
    notes: "Review dynamic programming patterns.",
    segment: "evening",
    createdAt: new Date().toISOString(),
  },
  {
    id: "6",
    title: "Creative Brainstorm",
    priority: "low",
    state: "waiting",
    category: "Creative Work",
    constellation: "The Dreamer",
    deadline: "This Week",
    duration: "1h",
    energy: "Low",
    notes: "Ideate on new project concepts.",
    segment: "evening",
    createdAt: new Date().toISOString(),
  },
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [loading, setLoading] = useState(false);

  const createTask = useCallback(async (input: CreateTaskInput) => {
    setLoading(true);
    try {
      // POST /api/v1/tasks
      const newTask: Task = {
        id: Date.now().toString(),
        title: input.title,
        priority: input.priority ?? "medium",
        state: input.state ?? "waiting",
        category: input.category ?? "Study",
        constellation: input.constellation ?? "The Scholar",
        deadline: input.deadline ?? "This Week",
        duration: input.duration ?? "1h",
        energy: input.energy ?? "Medium",
        notes: input.notes ?? "",
        segment: input.segment ?? "afternoon",
        createdAt: new Date().toISOString(),
      };
      // Optimistic update
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeTask = useCallback(async (id: string) => {
    // PATCH /api/v1/tasks/:id/complete
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, state: "resolved" as TaskState } : t,
      ),
    );
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    // DELETE /api/v1/tasks/:id
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    // PUT /api/v1/tasks/:id
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    );
  }, []);

  const generateFlow = useCallback(async () => {
    setLoading(true);
    try {
      // POST /api/v1/schedule/generate
      await new Promise((r) => setTimeout(r, 1600));
      setTasks((prev) =>
        prev.map((t) =>
          t.state === "waiting" ? { ...t, state: "flowing" as TaskState } : t,
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const flowBalance = Math.min(
    100,
    Math.round(
      (tasks.filter((t) => t.state === "resolved").length /
        Math.max(tasks.length, 1)) *
        100 +
        42,
    ),
  );

  return {
    tasks,
    loading,
    flowBalance,
    createTask,
    completeTask,
    deleteTask,
    updateTask,
    generateFlow,
  };
}
