"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/services/api";
import type { ScheduleOutput } from "@/types";

export default function OrdaPage() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<ScheduleOutput | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const response = await api.post<{ summary: string; schedule?: ScheduleOutput }>("/orda/process", { message });
    setReply(response.data.summary);
    setSchedule(response.data.schedule ?? null);
    setMessage("");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-semibold">ORDA</h1>
      <p className="mt-1 text-slate-600">Tell ORDA what changed.</p>
      <form onSubmit={submit} className="mt-6 grid gap-3">
        <Textarea required placeholder="I have a meeting at 4 PM." value={message} onChange={(event) => setMessage(event.target.value)} />
        <Button><Send className="size-4" /> Send</Button>
      </form>
      {reply && <p className="mt-6 rounded-lg border border-border bg-white p-4">{reply}</p>}
      {schedule?.schedule.map((item) => <div key={item.task_id + item.start_time} className="mt-3 rounded-md border border-border p-3">{item.task_title}</div>)}
    </main>
  );
}

