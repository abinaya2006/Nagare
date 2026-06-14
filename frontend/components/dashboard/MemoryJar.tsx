"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTaskPhysics } from "@/hooks/useTaskPhysics";
import TaskOrb from "./TaskOrb";
import TaskDetailModal from "./TaskDetailModal";
import type { Task } from "@/types";

interface MemoryJarProps {
  tasks: Task[];
  onCompleteTask: (taskId: string) => Promise<void>;
}

const JAR_RADIUS = 150;

export default function MemoryJar({ tasks, onCompleteTask }: MemoryJarProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);
  const jarRef = useRef<HTMLDivElement>(null);

  // Only show pending (non-resolved) tasks as orbs
  const pendingTasks = tasks.filter((t) => t.state !== "resolved" && t.id !== completing);
  const orbIds = pendingTasks.map((t) => t.id);
  const { positions, setOrbPosition, releaseOrb } = useTaskPhysics(orbIds, JAR_RADIUS, 30);

  const pendingCount = pendingTasks.length;
  const allDone = pendingCount === 0;

  const handleDrag = (id: string, pos: { x: number; y: number }) => {
    const dist = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
    const orbR = 30;
    const maxDist = JAR_RADIUS - orbR;
    if (dist > maxDist) {
      const angle = Math.atan2(pos.y, pos.x);
      setOrbPosition(id, { x: Math.cos(angle) * maxDist, y: Math.sin(angle) * maxDist });
    } else {
      setOrbPosition(id, pos);
    }
  };

  const handleComplete = async (taskId: string) => {
    // Close modal immediately
    setActiveTask(null);
    // Mark as completing so orb disappears from jar instantly
    setCompleting(taskId);
    try {
      await onCompleteTask(taskId);
    } finally {
      setCompleting(null);
    }
  };

  return (
    <section
      aria-label="Memory Jar - your unfinished thoughts"
      className="relative mx-auto flex h-[420px] w-[320px] items-center justify-center sm:h-[480px] sm:w-[380px]"
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 -z-10 rounded-full blur-3xl transition-all duration-1000"
        style={{
          background: allDone
            ? "radial-gradient(ellipse, rgba(201,182,255,0.5) 0%, rgba(221,238,255,0.3) 60%, transparent 100%)"
            : "radial-gradient(ellipse, rgba(255,255,255,0.6) 0%, rgba(232,225,255,0.4) 50%, rgba(221,238,255,0.3) 100%)",
        }}
      />

      {/* Jar glass body */}
      <motion.div
        ref={jarRef}
        className="absolute bottom-0 h-[88%] w-[88%] rounded-[48%_48%_42%_42%/40%_40%_46%_46%] backdrop-blur-md overflow-hidden"
        animate={{ scale: allDone ? [1, 1.02, 1] : [1, 1.012, 1] }}
        transition={{ duration: allDone ? 3 : 8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          border: allDone ? "1.5px solid rgba(201,182,255,0.8)" : "1.5px solid rgba(255,255,255,0.7)",
          background: allDone
            ? "linear-gradient(160deg, rgba(220,210,255,0.45) 0%, rgba(201,182,255,0.25) 40%, rgba(221,238,255,0.3) 100%)"
            : "linear-gradient(160deg, rgba(255,255,255,0.35) 0%, rgba(232,225,255,0.2) 40%, rgba(221,238,255,0.25) 100%)",
          boxShadow: allDone
            ? "0 8px 40px rgba(201,182,255,0.35), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(201,182,255,0.2)"
            : "0 8px 32px rgba(140,140,200,0.18), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(200,200,230,0.15)",
          transition: "background 1s, box-shadow 1s, border-color 1s",
        }}
        aria-hidden="true"
      >
        <motion.div
          className="absolute bottom-0 left-0 right-0"
          animate={{ height: allDone ? "30%" : "18%" }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          style={{
            background: allDone
              ? "linear-gradient(to top, rgba(201,182,255,0.35), transparent)"
              : "linear-gradient(to top, rgba(221,238,255,0.3), transparent)",
            borderRadius: "0 0 48% 48%",
          }}
        />
        <div className="absolute left-[12%] top-[8%] h-[55%] w-[14%] rounded-full bg-white/40 blur-md" />
        <div className="absolute right-[18%] top-[14%] h-[30%] w-[7%] rounded-full bg-white/25 blur-sm" />
        <div className="absolute top-0 left-[10%] right-[10%] h-[3px] rounded-full bg-white/60 blur-[1px]" />
      </motion.div>

      {/* Jar neck / rim */}
      <div
        aria-hidden="true"
        className="absolute top-[6%] h-[10%] w-[40%] rounded-t-[40%] backdrop-blur-md"
        style={{
          border: allDone ? "1.5px solid rgba(201,182,255,0.7)" : "1.5px solid rgba(255,255,255,0.7)",
          background: allDone ? "rgba(220,210,255,0.35)" : "rgba(255,255,255,0.30)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
          transition: "background 1s, border-color 1s",
        }}
      />

      {/* Orbs */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence>
          {pendingTasks.map((task) => (
            <TaskOrb
              key={task.id}
              task={task}
              position={positions[task.id] ?? { x: 0, y: 0 }}
              onOpen={setActiveTask}
              onDrag={handleDrag}
              onDragEnd={releaseOrb}
              settled={allDone}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* All done overlay */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <p className="font-display text-sm italic text-black drop-shadow">
              all clear
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Label */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center">
        <p className="font-display text-sm italic text-ink-soft">Memory Jar</p>
        <p className="text-xs text-ink-soft/80">
          {pendingCount === 0
            ? "all thoughts settled 🌙"
            : `${pendingCount} thought${pendingCount !== 1 ? "s" : ""} still settling`}
        </p>
      </div>

      <TaskDetailModal
        task={activeTask}
        onClose={() => setActiveTask(null)}
        onComplete={handleComplete}
      />
    </section>
  );
}
