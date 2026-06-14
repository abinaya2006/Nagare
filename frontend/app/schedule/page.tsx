"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import CalendarView from "@/components/schedule/CalendarView";
import ThoughtDrawer from "@/components/schedule/ThoughtDrawer";
import FlowBalance from "@/components/schedule/FlowBalance";
import AmbientBackground from "@/components/schedule/AmbientBackground";
import NANIOrb from "@/components/dashboard/NANIOrb";

import { useTasks } from "@/contexts/TaskContext";
import { useSchedule } from "@/hooks/useSchedule";
import { useNaniSidebar } from "@/components/providers/NaniProvider";

import type { Task } from "@/types/task";

export default function SchedulePage() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { tasks, loading: tasksLoading, updateTask, deleteTask, completeTask, refresh } = useTasks();
  const { scheduleItems, flowBalance, generateFlow, isLoading: scheduleLoading } = useSchedule();
  const { isOpen: isNaniOpen, open: openNani } = useNaniSidebar();

  const selectedTask = tasks?.find((t) => t.id === selectedTaskId) ?? null;

  const handleTaskSelect = useCallback((id: string) => {
    setSelectedTaskId(id);
    setDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedTaskId(null), 350);
  }, []);

  const handleTaskComplete = useCallback(async (id: string) => {
    await completeTask(id);
    await refresh();
  }, [completeTask, refresh]);

  const handleTaskDelete = useCallback(async (id: string) => {
    await deleteTask(id);
    handleDrawerClose();
    await refresh();
  }, [deleteTask, handleDrawerClose, refresh]);

  const handleTaskUpdate = useCallback(async (id: string, data: Partial<Task>) => {
    await updateTask(id, data);
  }, [updateTask]);

  const handleGenerateFlow = useCallback(async () => {
    setIsGenerating(true);
    try {
      await generateFlow();
      await refresh();
    } finally {
      setTimeout(() => setIsGenerating(false), 2800);
    }
  }, [generateFlow, refresh]);

  return (
    <div className="schedule-page">
      <AmbientBackground flowBalance={flowBalance} orbAnimating={false} isGenerating={isGenerating} />

      <div className="schedule-inner">
        {/* Header */}
        <header className="hero">
          <h1 className="hero-headline">Your Schedule</h1>
          <div className="hero-meta">
            <span className="hero-date">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
            <FlowBalance score={flowBalance} isLoading={scheduleLoading} />
            <motion.button
              onClick={handleGenerateFlow}
              disabled={isGenerating}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: "rgba(139,92,246,0.12)",
                border: "1px solid rgba(167,139,250,0.3)",
                borderRadius: 12,
                padding: "6px 14px",
                color: "rgba(216,180,254,0.9)",
                fontSize: "0.82rem",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {isGenerating ? "Generating…" : "↺ Generate Flow"}
            </motion.button>
          </div>
        </header>

        {/* Calendar */}
        <main>
          <CalendarView
            tasks={tasks}
            scheduleItems={scheduleItems}
            isLoading={tasksLoading || scheduleLoading}
            onTaskSelect={handleTaskSelect}
            onTaskUpdate={handleTaskUpdate}
          />
        </main>
      </div>

      {/* NANI Orb */}
      <NANIOrb onClick={openNani} isOpen={isNaniOpen} />

      {/* Task Drawer */}
      <AnimatePresence>
        {drawerOpen && selectedTask && (
          <ThoughtDrawer
            key={selectedTask.id}
            task={selectedTask}
            onClose={handleDrawerClose}
            onComplete={() => handleTaskComplete(selectedTask.id)}
            onDelete={() => handleTaskDelete(selectedTask.id)}
            onUpdate={(data) => handleTaskUpdate(selectedTask.id, data)}
          />
        )}
      </AnimatePresence>

      <style jsx>{`
        .schedule-page { position: relative; min-height: 100vh; display: flex; flex-direction: column; overflow-x: hidden; font-family: "Inter", system-ui, sans-serif; color: rgba(248,245,255,0.92); }
        .schedule-inner { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 1.5rem; padding: 2rem 2.5rem 6rem; max-width: 1280px; margin: 0 auto; width: 100%; }
        .hero { padding-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .hero-headline { font-size: clamp(1.6rem,3.5vw,2.6rem); font-weight: 300; letter-spacing: -0.02em; line-height: 1.25; background: linear-gradient(135deg, rgba(216,180,254,1) 0%, rgba(147,197,253,0.9) 50%, rgba(248,215,255,0.85) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0; }
        .hero-meta { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
        .hero-date { font-size: 0.85rem; font-weight: 400; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(203,213,255,0.65); }
        @media (max-width: 768px) { .schedule-inner { padding: 1.25rem 1.25rem 6rem; gap: 1.2rem; } .hero-meta { flex-direction: column; align-items: flex-start; gap: 0.75rem; } }
      `}</style>
    </div>
  );
}
