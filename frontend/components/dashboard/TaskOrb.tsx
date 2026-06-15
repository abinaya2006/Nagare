"use client";
import { useRef } from "react";
import { motion } from "framer-motion";
import type { Task } from "@/types";
import type { OrbPosition } from "@/hooks/useTaskPhysics";

interface TaskOrbProps {
  task: Task;
  position: OrbPosition;
  onOpen: (task: Task) => void;
  onDrag: (id: string, pos: OrbPosition) => void;
  onDragEnd: (id: string, velocity: OrbPosition) => void;
  settled?: boolean;
}

const PRIORITY_STYLES: Record<
  Task["priority"],
  { bg: string; ring: string; glow: string; text: string }
> = {
  critical: {
    bg: "bg-red-500/80",
    ring: "ring-red-500/60",
    glow: "shadow-glow-coral",
    text: "text-[#7a1a10]",
  },
  high: {
    bg: "bg-coral/80",
    ring: "ring-coral-glow/60",
    glow: "shadow-glow-coral",
    text: "text-[#7a3a30]",
  },
  medium: {
    bg: "bg-goldglow/80",
    ring: "ring-goldglow/60",
    glow: "shadow-glow-gold",
    text: "text-[#7a5a1d]",
  },
  low: {
    bg: "bg-lavglow/75",
    ring: "ring-lavglow/60",
    glow: "shadow-glow-lav",
    text: "text-[#4f3f8a]",
  },
};

const COMPLETED_STYLE = {
  bg: "bg-silver/80",
  ring: "ring-silver-glow/60",
  glow: "shadow-glow-silver",
  text: "text-[#8a8fa0]",
};

export default function TaskOrb({
  task,
  position,
  onOpen,
  onDrag,
  onDragEnd,
  settled,
}: TaskOrbProps) {
  const palette = task.completed
    ? COMPLETED_STYLE
    : PRIORITY_STYLES[task.priority];
  const size = task.completed
    ? 52
    : task.priority === "high"
      ? 76
      : task.priority === "medium"
        ? 68
        : 60;
  const isDragging = useRef(false);

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      animate={{
        x: position.x,
        y: position.y,
        scale: task.state === "resolved" && settled ? 0.85 : 1,
        opacity: task.state === "resolved" && settled ? 0.5 : 1,
      }}
      transition={
        isDragging.current
          ? { duration: 0 }
          : task.state === "resolved"
            ? { duration: 1.2, ease: "easeInOut" }
            : { type: "spring", stiffness: 80, damping: 18 }
      }
      style={{ marginLeft: -size / 2, marginTop: -size / 2 }}
    >
      <motion.button
        type="button"
        drag={task.state !== "resolved"}
        dragMomentum={false}
        dragElastic={0}
        whileDrag={{ scale: 1.15, zIndex: 30 }}
        whileHover={task.state !== "resolved" ? { scale: 1.08 } : {}}
        whileTap={task.state !== "resolved" ? { scale: 0.97 } : {}}
        onDragStart={() => {
          isDragging.current = true;
        }}
        onDrag={(_, info) => {
          onDrag(task.id, {
            x: position.x + info.offset.x,
            y: position.y + info.offset.y,
          });
        }}
        onDragEnd={(_, info) => {
          isDragging.current = false;
          onDragEnd(task.id, { x: info.velocity.x, y: info.velocity.y });
        }}
        onClick={() => {
          if (!isDragging.current) onOpen(task);
        }}
        aria-label={`${task.title}. ${task.state === "resolved" ? "Completed" : `${task.priority} priority`}. Open details.`}
        className={`... ${task.state !== "resolved" ? "cursor-grab active:cursor-grabbing animate-drift" : "cursor-default"}`}
        style={{
          width: size,
          height: size,
          animationDuration: `${7 + (size % 5)}s`,
        }}
      >
        <span
          className={`pointer-events-none px-2 text-center font-display text-[11px] leading-tight ${palette.text}`}
        >
          {task.state === "resolved"
            ? "✓"
            : task.title.length > 16
              ? `${task.title.slice(0, 14)}…`
              : task.title}
        </span>
        <span className="pointer-events-none absolute inset-1 rounded-full bg-white/30 mix-blend-soft-light" />
      </motion.button>
    </motion.div>
  );
}
