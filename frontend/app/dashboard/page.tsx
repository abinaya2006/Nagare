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
import { useAuth } from "@/contexts/AuthContext"; // ✅ added
import { mockSchedule } from "@/lib/mock-data";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { tasks, loading } = useTasks();
  const { session, loading: authLoading } = useAuth(); // ✅ added
  const [isExpanding, setIsExpanding] = useState(false);
  const [greeting, setGreeting] = useState("Hello");
  const [userName, setUserName] = useState("there");

  const { isOpen: isNaniOpen, open: openNani } = useNaniSidebar();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("nagare_onboarding");
    if (raw) {
      const data = JSON.parse(raw);
      console.log("🌊 Onboarding Answers:", data.answers);
      console.log("📅 Completed At:", data.completedAt);
    }
  }, []);

  // ✅ Fixed: wait for auth session before calling /auth/me
  useEffect(() => {
    if (authLoading || !session?.access_token) return;

    api
      .get("/auth/me")
      .then(({ data }) => {
        const email: string = data?.email ?? "";
        const name = data?.name || email.split("@")[0];
        setUserName(name);
      })
      .catch(() => {});
  }, [authLoading, session]);

  const now = new Date();
  const pendingTasks = tasks.filter((t) => t.state !== "resolved");
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
    completed: tasks.filter((t) => t.state === "resolved").length,
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

        {/* Schedule + Focus buttons */}
        <div className="flex items-start gap-3">
          <FocusBeacon />

          <div className="flex flex-col items-center gap-1.5">
            <motion.button
              type="button"
              onClick={handleScheduleClick}
              aria-label="Schedule a new thought"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-lavender via-cloud to-sky shadow-glow-lav"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Plus size={22} className="text-ink" />
            </motion.button>
            <span className="text-xs text-ink-soft">Schedule</span>
          </div>
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
          <MemoryJar tasks={tasks} onCompleteTask={() => {}} />
        </div>
        <div className="order-3 lg:order-3">
          <MindSnapshot data={snapshot} />
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-12 max-w-6xl">
        <SchedulePreview initialFlow={mockSchedule} />
      </section>

      <NANIOrb onClick={openNani} isOpen={isNaniOpen} />

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
