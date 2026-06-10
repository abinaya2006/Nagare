"use client";

import Link from "next/link";
import { WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScheduleView } from "@/components/ScheduleView";
import { TaskList } from "@/components/TaskList";
import { useSchedule } from "@/contexts/ScheduleContext";
import { useTasks } from "@/contexts/TaskContext";

export default function DashboardPage() {
  const { tasks, error } = useTasks();
  const { generate } = useSchedule();
  const upcoming = tasks.filter((task) => task.status !== "Completed").slice(0, 3);

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_1fr]">
      <section className="lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">Today&apos;s pulse</h1>
            <p className="mt-1 text-slate-600">A calm view of what needs attention next.</p>
          </div>
          <Button onClick={generate}><WandSparkles className="size-4" /> Generate schedule</Button>
        </div>
        {error && <p className="mt-3 text-sm text-accentAmber">{error}</p>}
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Upcoming deadlines</h2>
        <div className="grid gap-3">
          {upcoming.map((task) => (
            <Link key={task.id} href="/tasks" className="rounded-lg border border-border bg-white p-4 hover:bg-muted">
              <div className="font-medium">{task.title}</div>
              <div className="mt-1 text-sm text-slate-500">{task.priority} priority</div>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Schedule preview</h2>
        <ScheduleView />
      </section>
      <section className="lg:col-span-2">
        <h2 className="mb-3 text-lg font-semibold">Today&apos;s tasks</h2>
        <TaskList />
      </section>
    </main>
  );
}

