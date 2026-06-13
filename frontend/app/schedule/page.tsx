"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import TodaysScheduleView from "@/components/schedule/RiverView";
import CalendarView from "@/components/schedule/CalendarView";
import ThoughtDrawer from "@/components/schedule/ThoughtDrawer";
import TaskFilters from "@/components/schedule/TaskFilters";
import NANIComposer from "@/components/schedule/NANIComposer";
import FlowPreview from "@/components/schedule/FlowPreview";
import FlowBalance from "@/components/schedule/FlowBalance";
import AmbientBackground from "@/components/schedule/AmbientBackground";

import { useTasks } from "@/contexts/TaskContext";
import { useSchedule } from "@/hooks/useSchedule";
import { useNANIPlanner } from "@/hooks/useNANIPlanner";

import type { Task, TaskFilter, TaskState } from "@/types/task";

type ViewMode = "today" | "calendar";

const VIEW_MODES: { id: ViewMode; label: string; icon: string }[] = [
  { id: "today", label: "Today's Schedule", icon: "🌊" },
  { id: "calendar", label: "Calendar", icon: "🗓" },
];

const HERO_PHRASES = [
  "Your thoughts are finding their rhythm.",
  "Every intention deserves its moment.",
  "The river carries what you offer it.",
  "Let today unfold at its own pace.",
  "Clarity arrives when you stop rushing.",
];

const FILTER_OPTIONS: { value: TaskFilter; label: string; glow: string }[] = [
  { value: "all", label: "All", glow: "rgba(167,139,250,0.35)" },
  { value: "waiting", label: "Waiting", glow: "rgba(148,163,184,0.35)" },
  { value: "flowing", label: "Flowing", glow: "rgba(56,189,248,0.40)" },
  { value: "resolved", label: "Resolved", glow: "rgba(192,192,192,0.35)" },
  { value: "calling", label: "Calling", glow: "rgba(251,113,133,0.40)" },
];

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("today");
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("all");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [heroPhrase, setHeroPhrase] = useState(HERO_PHRASES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [orbAnimating, setOrbAnimating] = useState(false);
  const [today, setToday] = useState("");

  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask, completeTask, refresh } = useTasks();
  const { schedule, flowBalance, naniInsight, todayFlow, generateFlow, reschedule, isLoading: scheduleLoading } = useSchedule();
  const { processNaturalLanguage, isProcessing: naniProcessing } = useNANIPlanner();

  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
  }, []);

  useEffect(() => {
    let idx = 0;
    const timer = setInterval(() => {
      idx = (idx + 1) % HERO_PHRASES.length;
      setHeroPhrase(HERO_PHRASES[idx]);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const selectedTask = tasks?.find((t) => t.id === selectedTaskId) ?? null;

  const filteredTasks = (tasks ?? []).filter((t: Task) => {
    if (activeFilter === "all") return true;
    const stateMap: Record<TaskState, TaskFilter> = {
      pending: "waiting",
      scheduled: "flowing",
      completed: "resolved",
      overdue: "calling",
    };
    return stateMap[t.state] === activeFilter;
  });

  const handleNANISubmit = useCallback(async (input: string) => {
    setOrbAnimating(true);
    try {
      const parsed = await processNaturalLanguage(input);
      await createTask(parsed);
      await refresh();
    } finally {
      setTimeout(() => setOrbAnimating(false), 2200);
    }
  }, [processNaturalLanguage, createTask, refresh]);

  const handleGenerateFlow = useCallback(async () => {
    setIsGenerating(true);
    try {
      await generateFlow();
      await refresh();
    } finally {
      setTimeout(() => setIsGenerating(false), 2800);
    }
  }, [generateFlow, refresh]);

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
    await refresh();
  }, [updateTask, refresh]);

  const viewVariants = {
    enter: { opacity: 0, y: 18, filter: "blur(8px)" },
    center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -14, filter: "blur(6px)", transition: { duration: 0.35, ease: [0.55, 0, 1, 0.45] } },
  };

  return (
    <div className="schedule-page">
      <AmbientBackground flowBalance={flowBalance} orbAnimating={orbAnimating} isGenerating={isGenerating} />

      <div className="schedule-inner">
        {/* Hero */}
        <header className="hero">
          <AnimatePresence mode="wait">
            <motion.h1
              key={heroPhrase}
              className="hero-headline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            >
              {heroPhrase}
            </motion.h1>
          </AnimatePresence>
          <div className="hero-meta">
            <span className="hero-date">{today}</span>
            <FlowBalance score={flowBalance} isLoading={scheduleLoading} />
          </div>
          {naniInsight && (
            <motion.div className="nani-insight" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>
              <span className="nani-insight-icon">✦</span>
              <p className="nani-insight-text">{naniInsight}</p>
            </motion.div>
          )}
        </header>

        {/* Toolbar — just view switcher, no generate button */}
        <div className="toolbar">
          <nav className="view-switcher" aria-label="View modes">
            {VIEW_MODES.map((mode) => (
              <motion.button
                key={mode.id}
                className={`view-tab ${viewMode === mode.id ? "active" : ""}`}
                onClick={() => setViewMode(mode.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                aria-pressed={viewMode === mode.id}
              >
                <span className="view-tab-icon">{mode.icon}</span>
                <span className="view-tab-label">{mode.label}</span>
                {viewMode === mode.id && (
                  <motion.span
                    className="view-tab-glow"
                    layoutId="active-tab-glow"
                    transition={{ type: "spring", stiffness: 340, damping: 32 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>
        </div>

        {todayFlow && todayFlow.length > 0 && (
          <FlowPreview flow={todayFlow} isLoading={scheduleLoading} onRegenerate={handleGenerateFlow} />
        )}

        <TaskFilters options={FILTER_OPTIONS} activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        <main className="view-stage">
          <AnimatePresence mode="wait">
            {viewMode === "today" && (
              <motion.div key="today" variants={viewVariants} initial="enter" animate="center" exit="exit" className="view-pane">
                <TodaysScheduleView
                  tasks={filteredTasks}
                  isLoading={tasksLoading}
                  onTaskSelect={handleTaskSelect}
                />
              </motion.div>
            )}
            {viewMode === "calendar" && (
              <motion.div key="calendar" variants={viewVariants} initial="enter" animate="center" exit="exit" className="view-pane">
                <CalendarView
                  tasks={filteredTasks}
                  isLoading={tasksLoading}
                  onTaskSelect={handleTaskSelect}
                  onTaskUpdate={handleTaskUpdate}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* NANI Composer with regenerate button */}
        <NANIComposer
          isProcessing={naniProcessing}
          onSubmit={handleNANISubmit}
          onRegenerate={handleGenerateFlow}
          isRegenerating={isGenerating}
          orbAnimating={orbAnimating}
        />
      </div>

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
        .schedule-inner { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 1.5rem; padding: 2rem 2.5rem 10rem; max-width: 1280px; margin: 0 auto; width: 100%; }
        .hero { padding-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .hero-headline { font-size: clamp(1.6rem,3.5vw,2.6rem); font-weight: 300; letter-spacing: -0.02em; line-height: 1.25; background: linear-gradient(135deg, rgba(216,180,254,1) 0%, rgba(147,197,253,0.9) 50%, rgba(248,215,255,0.85) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0; }
        .hero-meta { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
        .hero-date { font-size: 0.85rem; font-weight: 400; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(203,213,255,0.65); }
        .nani-insight { display: flex; align-items: flex-start; gap: 0.6rem; background: rgba(139,92,246,0.08); border: 1px solid rgba(167,139,250,0.18); border-radius: 14px; padding: 0.65rem 1rem; max-width: 560px; backdrop-filter: blur(8px); }
        .nani-insight-icon { font-size: 0.75rem; color: rgba(167,139,250,0.8); margin-top: 2px; flex-shrink: 0; }
        .nani-insight-text { font-size: 0.82rem; line-height: 1.55; color: rgba(216,180,254,0.82); margin: 0; font-style: italic; }
        .toolbar { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .view-switcher { display: flex; gap: 0.25rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 0.3rem; backdrop-filter: blur(12px); }
        .view-tab { position: relative; display: flex; align-items: center; gap: 0.4rem; padding: 0.45rem 1rem; border-radius: 13px; border: none; background: transparent; color: rgba(203,213,255,0.55); font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: color 0.25s ease; white-space: nowrap; }
        .view-tab.active { color: rgba(248,245,255,0.95); }
        .view-tab-icon { font-size: 0.9rem; }
        .view-tab-glow { position: absolute; inset: 0; border-radius: 13px; background: linear-gradient(135deg, rgba(139,92,246,0.25), rgba(56,189,248,0.15)); border: 1px solid rgba(167,139,250,0.3); z-index: -1; pointer-events: none; }
        .view-stage { position: relative; min-height: 460px; }
        .view-pane { width: 100%; }
        @media (max-width: 768px) { .schedule-inner { padding: 1.25rem 1.25rem 9rem; gap: 1.2rem; } .toolbar { flex-direction: column; align-items: stretch; } .view-switcher { justify-content: center; } .hero-meta { flex-direction: column; align-items: flex-start; gap: 0.75rem; } }
        @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      `}</style>
    </div>
  );
}
