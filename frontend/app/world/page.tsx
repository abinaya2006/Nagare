"use client";
import { useEffect, useState } from "react";
import ConstellationWorld from "@/components/world/ConstellationWorld";
import { useNaniSidebar } from "@/components/providers/NaniProvider";
import { api } from "@/services/api";

export default function WorldPage() {
  const { open: openNani } = useNaniSidebar();
  const [completedTasks, setCompletedTasks] = useState(0);

  useEffect(() => {
    api.get<{ tasks: any[] }>("/tasks?status=completed").then((res) => {
      setCompletedTasks(res.data.tasks.length);
    }).catch(() => {
      // silently fall back to 0
    });
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden p-4 sm:p-6">
      <header className="mb-4 shrink-0">
        <h1 className="font-display text-2xl font-medium italic text-ink sm:text-3xl">
          Constellation World
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Every completed task becomes a little more light in your sky.
        </p>
      </header>
      <div className="flex-1 min-h-0">
        <ConstellationWorld
          initialCompletedTasks={completedTasks}
          onOpenNaniChat={openNani}
        />
      </div>
    </div>
  );
}
