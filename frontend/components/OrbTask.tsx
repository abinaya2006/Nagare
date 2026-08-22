"use client";

import { motion } from "framer-motion";
import type { Task, TaskCategory } from "@/types";

const CATEGORY_COLORS: Record<
  TaskCategory,
  { bg: string; border: string; dot: string }
> = {
  Study: { bg: "#F0EEFB", border: "rgba(175, 169, 236, 0.4)", dot: "#AFA9EC" },
  Projects: {
    bg: "#EBF4FF",
    border: "rgba(133, 183, 235, 0.4)",
    dot: "#85B7EB",
  },
  "Creative Work": {
    bg: "#FDF0EC",
    border: "rgba(240, 153, 123, 0.4)",
    dot: "#F0997B",
  },
  Exploration: {
    bg: "#ECFAF4",
    border: "rgba(93, 202, 165, 0.4)",
    dot: "#5DCAA5",
  },
  Habits: { bg: "#FDF0F5", border: "rgba(237, 147, 177, 0.4)", dot: "#ED93B1" },
  focus: { bg: "#F0EEFB", border: "rgba(175, 169, 236, 0.4)", dot: "#AFA9EC" },
  admin: { bg: "#EBF4FF", border: "rgba(133, 183, 235, 0.4)", dot: "#85B7EB" },
  creative: {
    bg: "#FDF0EC",
    border: "rgba(240, 153, 123, 0.4)",
    dot: "#F0997B",
  },
  health: { bg: "#ECFAF4", border: "rgba(93, 202, 165, 0.4)", dot: "#5DCAA5" },
  social: { bg: "#FDF0F5", border: "rgba(237, 147, 177, 0.4)", dot: "#ED93B1" },
};

interface OrbTaskProps {
  task: Task;
  floatDelay: number; // stagger in seconds
}

export default function OrbTask({ task, floatDelay }: OrbTaskProps) {
  const colors = CATEGORY_COLORS[task.category];

  return (
    <motion.div
      animate={{ y: [0, -9, 0] }}
      transition={{
        duration: 4,
        delay: floatDelay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "8px 14px",
        background: colors.bg,
        border: `0.5px solid ${colors.border}`,
        borderRadius: 24,
        cursor: "default",
        userSelect: "none",
        opacity: task.state === "resolved" ? 0.45 : 1,
      }}
    >
      {/* Category color dot */}
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: colors.dot,
          flexShrink: 0,
        }}
      />

      <span
        style={{
          fontSize: "0.8125rem",
          fontWeight: 400,
          color: "#1C1A2E",
          whiteSpace: "nowrap",
          textDecoration: task.state === "resolved" ? "line-through" : "none",
        }}
      >
        {task.title}
      </span>
    </motion.div>
  );
}
