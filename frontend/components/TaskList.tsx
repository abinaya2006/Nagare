"use client";

import { Check, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/contexts/TaskContext";

export function TaskList() {
  const { tasks, updateTask, deleteTask, loading } = useTasks();
  if (loading) return <p className="text-sm text-slate-500">Loading tasks...</p>;
  if (!tasks.length) return <p className="rounded-lg border border-border p-4 text-sm text-slate-500">No tasks yet.</p>;

  return (
    <div className="grid gap-3">
      {tasks.map((task) => (
        <article key={task.id} className="rounded-lg border border-border bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-medium">{task.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{task.description}</p>
              <p className="mt-2 text-xs text-slate-500">
                {task.priority} · {task.estimated_duration_minutes} min {task.deadline ? `· due ${formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Button className="size-9 px-0 bg-accentGreen" title="Complete task" onClick={() => updateTask(task.id, { status: "Completed" })}><Check className="size-4" /></Button>
              <Button className="size-9 px-0 bg-rose-600" title="Delete task" onClick={() => deleteTask(task.id)}><Trash2 className="size-4" /></Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

