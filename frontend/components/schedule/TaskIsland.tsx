"use client";

import { motion } from "framer-motion";
import type { Task } from "@/types/task";

const PRIORITY_COLORS: Record<Task["priority"], string> = {
  critical: "#FF8B6B",
  high: "#F4C56A",
  medium: "#B8B0E8",
  low: "#82C4F8",
};

const STATE_CONFIG: Record<
  Task["state"],
  { label: string; bg: string; color: string }
> = {
  waiting: { label: "Waiting", bg: "rgba(130,196,248,0.12)", color: "#82C4F8" },
  flowing: { label: "Flowing", bg: "rgba(78,205,196,0.12)", color: "#4ECDC4" },
  resolved: {
    label: "Resolved",
    bg: "rgba(168,180,200,0.12)",
    color: "#A8B4C8",
  },
  overdue: { label: "Calling", bg: "rgba(255,139,107,0.12)", color: "#FF8B6B" },
};

interface TaskIslandProps {
  task: Task;
  index: number;
  onClick: (task: Task) => void;
}

export function TaskIsland({ task, index, onClick }: TaskIslandProps) {
  const priorityColor = PRIORITY_COLORS[task.priority];
  const stateConf = STATE_CONFIG[task.state];
  const isOverdue = task.state === "overdue";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{
        delay: index * 0.06,
        type: "spring",
        stiffness: 300,
        damping: 26,
      }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={() => onClick(task)}
      className="relative w-[320px] max-w-full cursor-pointer overflow-hidden rounded-2xl p-3.5"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid rgba(255,255,255,0.08)`,
        borderLeft: `3px solid ${priorityColor}`,
        opacity: task.state === "resolved" ? 0.55 : 1,
        boxShadow: isOverdue ? `0 0 0 0 ${priorityColor}30` : undefined,
      }}
    >
      {/* Subtle inner glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.025) 0%, transparent 60%)",
        }}
      />

      {/* Header */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className="flex-1 text-[14px] font-medium leading-snug"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          {task.title}
        </span>
        <span
          className="shrink-0 rounded-[10px] px-2 py-0.5 text-[10px] font-medium"
          style={{ background: stateConf.bg, color: stateConf.color }}
        >
          {stateConf.label}
        </span>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3.5">
        <span
          className="flex items-center gap-1 text-[11.5px]"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          <span style={{ color: priorityColor, fontSize: 8 }}>●</span>
          <span style={{ textTransform: "capitalize" }}>{task.priority}</span>
        </span>
        <span
          className="text-[11.5px]"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          ⏱ {task.duration}
        </span>
        <span
          className="text-[11.5px]"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          🗓 {task.deadline}
        </span>
      </div>

      {/* Overdue pulse ring */}
      {isOverdue && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(255,139,107,0)",
              "0 0 0 5px rgba(255,139,107,0.08)",
              "0 0 0 0 rgba(255,139,107,0)",
            ],
          }}
          transition={{ duration: 2.8, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
