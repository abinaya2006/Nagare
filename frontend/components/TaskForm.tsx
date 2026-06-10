"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTasks } from "@/contexts/TaskContext";
import type { Priority } from "@/types";

export function TaskForm() {
  const { createTask } = useTasks();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [duration, setDuration] = useState(45);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await createTask({ title, description, deadline: deadline || null, priority, estimated_duration_minutes: duration, status: "Pending" });
    setTitle("");
    setDescription("");
    setDeadline("");
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-lg border border-border bg-white p-4 shadow-soft">
      <Input required placeholder="Task title" value={title} onChange={(event) => setTitle(event.target.value)} />
      <Textarea placeholder="Description" value={description} onChange={(event) => setDescription(event.target.value)} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Input type="datetime-local" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
        <Input type="number" min={5} max={1440} value={duration} onChange={(event) => setDuration(Number(event.target.value))} />
        <Select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </Select>
      </div>
      <Button type="submit"><Plus className="size-4" /> Add task</Button>
    </form>
  );
}

