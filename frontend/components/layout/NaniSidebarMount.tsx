"use client";

import NANISidebar from "@/components/dashboard/NANISidebar";
import { useNaniSidebar } from "@/components/providers/NaniProvider";

/**
 * Mounts NANI's sliding chat sidebar once per app shell, wired to the shared
 * NaniProvider context so it can be opened from the sidebar nav, the
 * dashboard's NANI orb, or NANI's presence in the Constellation World.
 */
export default function NaniSidebarMount() {
  const { isOpen, close } = useNaniSidebar();
  return <NANISidebar isOpen={isOpen} onClose={close} />;
}
