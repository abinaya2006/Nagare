"use client";

import { motion } from "framer-motion";
import type { TaskState } from "@/types/task";

type FilterOption = "all" | TaskState;

const FILTERS: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "waiting", label: "Waiting" },
  { value: "flowing", label: "Flowing" },
  { value: "resolved", label: "Resolved" },
  { value: "overdue", label: "Calling" },
];

interface TaskFiltersProps {
  active: FilterOption;
  onChange: (f: FilterOption) => void;
}

export default function TaskFilters({ active, onChange }: TaskFiltersProps) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <motion.button
          key={f.value}
          onClick={() => onChange(f.value)}
          whileTap={{ scale: 0.95 }}
          className="relative rounded-full px-3.5 py-1.5 text-[12px] transition-colors"
          style={{
            background:
              active === f.value
                ? "rgba(78,205,196,0.12)"
                : "rgba(255,255,255,0.04)",
            border: `1px solid ${active === f.value ? "rgba(78,205,196,0.4)" : "rgba(255,255,255,0.08)"}`,
            color: active === f.value ? "#4ECDC4" : "rgba(255,255,255,0.45)",
            boxShadow:
              active === f.value ? "0 0 12px rgba(78,205,196,0.15)" : "none",
          }}
        >
          {active === f.value && (
            <motion.span
              layoutId="filter-glow"
              className="absolute inset-0 rounded-full"
              style={{ background: "rgba(78,205,196,0.08)" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{f.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
