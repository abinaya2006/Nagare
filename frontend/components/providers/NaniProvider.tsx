"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface NaniContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const NaniContext = createContext<NaniContextValue | null>(null);

/**
 * Shares NANI's sidebar open/closed state across the dashboard, the
 * Constellation World, and the sidebar nav item, so NANI feels like one
 * continuous presence rather than a per-page widget.
 */
export function NaniProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const value: NaniContextValue = {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };

  return <NaniContext.Provider value={value}>{children}</NaniContext.Provider>;
}

export function useNaniSidebar(): NaniContextValue {
  const ctx = useContext(NaniContext);
  if (!ctx) {
    throw new Error("useNaniSidebar must be used within a NaniProvider");
  }
  return ctx;
}
