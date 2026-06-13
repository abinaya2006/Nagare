"use client";

import ConstellationWorld from "@/components/world/ConstellationWorld";
import { useNaniSidebar } from "@/components/providers/NaniProvider";
import { mockSnapshot } from "@/lib/mock-data";

/**
 * The Constellation World - a living emotional sky built entirely from Flow
 * Energy gathered on the dashboard. No tasks, no lists, just a slowly
 * unfolding universe.
 */
export default function WorldPage() {
  const { open: openNani } = useNaniSidebar();

  return (
    <div>
      <header className="mb-4 sm:mb-6">
        <h1 className="font-display text-2xl font-medium italic text-ink sm:text-3xl">
          Constellation World
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Every settled thought becomes a little more light in your sky.
        </p>
      </header>

      <ConstellationWorld initialCompletedTasks={mockSnapshot.completed} onOpenNaniChat={openNani} />
    </div>
  );
}
