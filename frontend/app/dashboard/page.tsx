"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { api } from "@/services/api";
import AmbientBackground from "@/components/dashboard/AmbientBackground";
import FloatingParticles from "@/components/dashboard/FloatingParticles";
import MemoryJar from "@/components/dashboard/MemoryJar";
import TodaysFlow from "@/components/dashboard/TodaysFlow";
import MindSnapshot from "@/components/dashboard/MindSnapshot";
import SchedulePreview from "@/components/dashboard/SchedulePreview";
import NANIOrb from "@/components/dashboard/NANIOrb";
import FocusBeacon from "@/components/dashboard/Pomodoro";
import { useNaniSidebar } from "@/components/providers/NaniProvider";
import { useTasks } from "@/contexts/TaskContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Task } from "@/types";
import QuickAddTaskModal from "@/components/dashboard/QuickAddTaskModal";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { tasks, loading, completeTask } = useTasks();
  const { session, loading: authLoading } = useAuth();
  const [isExpanding, setIsExpanding] = useState(false);
  const [greeting, setGreeting] = useState("Hello");
  const [userName, setUserName] = useState("there");
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const { isOpen: isNaniOpen, open: openNani } = useNaniSidebar();

  useEffect(() => {
    const token = localStorage.getItem("nagare_token");

    if (!authLoading && !token) {
      router.replace("/login");
    }
  }, [authLoading, router]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("nagare_onboarding");
    if (raw) {
      try {
        const data = JSON.parse(raw);
        console.log("🌊 Onboarding:", data.answers);
      } catch {}
    }
  }, []);

  console.log("AUTH LOADING:", authLoading);
  console.log("SESSION:", session);

  useEffect(() => {
    const token = localStorage.getItem("nagare_token");

    if (authLoading || !token) return;
    api
      .get("/auth/me")
      .then(({ data }) => {
        const email: string = data?.email ?? "";
        setUserName(data?.name || email.split("@")[0]);
      })
      .catch(() => {});
  }, [authLoading, session]);

  const now = new Date();

  // Only show non-resolved tasks everywhere
  const pendingTasks = tasks.filter((t) => (t as Task).state !== "resolved");
  const todaysTasks = pendingTasks.filter((t) =>
    t.deadline ? isSameDay(new Date(t.deadline), now) : false,
  );
  const upcomingDeadlines = pendingTasks
    .filter((t) => t.deadline && !isSameDay(new Date(t.deadline), now))
    .sort(
      (a, b) =>
        new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime(),
    );

  const snapshot = {
    total: tasks.length,
    pending: pendingTasks.length,
    completed: tasks.filter((t) => (t as Task).state === "resolved").length,
  };

  // Just call completeTask — it optimistically sets state:"resolved" immediately
  // which removes the task from pendingTasks filter above. No refresh() needed.
  const handleCompleteTask = async (taskId: string) => {
    await completeTask(taskId);
  };

  const handleScheduleClick = () => {
    setIsExpanding(true);
    setTimeout(() => router.push("/schedule/create"), 650);
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-32 pt-8 sm:px-8 sm:pt-10">
      <AmbientBackground />
      <FloatingParticles count={22} />

      <header className="relative z-10 mx-auto flex max-w-6xl items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium italic text-ink sm:text-4xl">
            {greeting}, {userName}.
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {loading
              ? "Gathering your thoughts…"
              : "Your thoughts are gathering."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1.5">
            <motion.button
              onClick={() => setIsAddTaskOpen(true)}
              aria-label="Add task"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                border: "1.5px solid rgba(200,196,220,0.5)",
                background:
                  "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.92) 0%, rgba(232,225,255,0.75) 60%, rgba(221,238,255,0.65) 100%)",
                boxShadow: "0 2px 14px rgba(200,196,220,0.22)",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "10%",
                  left: "18%",
                  width: "28%",
                  height: "32%",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.75)",
                  filter: "blur(2px)",
                  pointerEvents: "none",
                }}
              />
              <Plus size={18} color="#b8a9e8" strokeWidth={1.8} />
            </motion.button>
            <span className="text-xs" style={{ color: "#6D7088" }}>
              Task
            </span>
          </div>
          <FocusBeacon />
        </div>
      </header>

      <section className="relative z-10 mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-[300px_1fr_300px] lg:items-center">
        <div className="order-2 lg:order-1">
          <TodaysFlow
            todaysTasks={todaysTasks}
            upcomingDeadlines={upcomingDeadlines}
          />
        </div>
        <div className="order-1 lg:order-2">
          <MemoryJar tasks={tasks} onCompleteTask={handleCompleteTask} />
        </div>
        <div className="order-3 lg:order-3">
          <MindSnapshot data={snapshot} />
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-12 max-w-6xl">
        <SchedulePreview />
      </section>

      <NANIOrb onClick={openNani} isOpen={isNaniOpen} />
      <QuickAddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
      />

      <AnimatePresence>
        {isExpanding && (
          <motion.div
            initial={{ scale: 0, opacity: 0.9, borderRadius: "50%" }}
            animate={{ scale: 40, opacity: 1, borderRadius: "0%" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-8 top-8 z-[100] h-14 w-14 origin-center bg-gradient-to-br from-lavender via-cloud to-sky"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </main>
  );
}
