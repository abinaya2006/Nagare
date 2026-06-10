"use client";

import { RefreshCw, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScheduleView } from "@/components/ScheduleView";
import { useSchedule } from "@/contexts/ScheduleContext";

export default function SchedulePage() {
  const { generate, reschedule, error } = useSchedule();
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Schedule</h1>
          <p className="mt-1 text-slate-600">Generated from your current work and constraints.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generate}><WandSparkles className="size-4" /> Generate</Button>
          <Button className="bg-accentBlue" onClick={reschedule}><RefreshCw className="size-4" /> Reschedule</Button>
        </div>
      </div>
      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      <div className="mt-6"><ScheduleView /></div>
    </main>
  );
}

