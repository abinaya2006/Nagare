"use client";
import { format } from "date-fns";
import { useSchedule } from "@/contexts/ScheduleContext";

interface ScheduleItem {
  task_id: string;
  task_title: string;
  start_time: string;
  end_time: string;
}

export function ScheduleView() {
  const { schedule, loading } = useSchedule();
  const items: ScheduleItem[] = (schedule as any)?.schedule ?? [];
  if (loading)
    return <p className="text-sm text-slate-500">Generating schedule...</p>;
  if (!items.length)
    return (
      <p className="rounded-lg border border-border p-4 text-sm text-slate-500">
        No schedule generated yet.
      </p>
    );
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <article
          key={`${item.task_id}-${item.start_time}`}
          className="grid gap-1 rounded-lg border border-border bg-white p-4 sm:grid-cols-[160px_1fr]"
        >
          <div className="text-sm font-medium text-accentBlue">
            {format(new Date(item.start_time), "p")} -{" "}
            {format(new Date(item.end_time), "p")}
          </div>
          <div>{item.task_title}</div>
        </article>
      ))}
    </div>
  );
}
