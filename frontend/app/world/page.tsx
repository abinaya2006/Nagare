"use client";
import { useNaniSidebar } from "@/components/providers/NaniProvider";
import ConstellationWorld from "@/components/world/ConstellationWorld";
import { useTasks } from "@/contexts/TaskContext";

export default function WorldPage() {
  const { open: openNani } = useNaniSidebar();
  const { tasks } = useTasks();

  // ✅ match actual task status field and value
  const completedCount = tasks.filter(
    (t) => t.status === "completed" || (t as any).state === "resolved"
  ).length;

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
          completedTasks={completedCount} // ✅ correct prop name
          onOpenNaniChat={openNani}
        />
      </div>
    </div>
  );
}
