"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTasks } from "@/contexts/TaskContext";
import type { TaskPriority } from "@/types";

export function TaskForm() {
  const { createTask } = useTasks();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [duration, setDuration] = useState("45m");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await createTask({
      title,
      notes,
      deadline: deadline || undefined,
      priority,
      duration,
    });
    setTitle("");
    setNotes("");
    setDeadline("");
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-3 rounded-lg border border-border bg-white p-4 shadow-soft"
    >
      <Input
        required
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <Input
          placeholder="Duration e.g. 45m"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          className="rounded border border-border px-3 py-2 text-sm"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
      <Button type="submit">
        <Plus className="size-4" /> Add task
      </Button>
    </form>
  );
}
