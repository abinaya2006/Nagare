"use client";
import NANISidebar from "@/components/dashboard/NANISidebar";
import { useNaniSidebar } from "@/components/providers/NaniProvider";

export default function NaniSidebarMount() {
  const { isOpen, close } = useNaniSidebar();
  return <NANISidebar isOpen={isOpen} onClose={close} />;
}
