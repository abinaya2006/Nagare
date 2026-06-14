"use client";

import { motion } from "framer-motion";
import { Sparkles, CalendarClock } from "lucide-react";
import type { Task } from "@/types";

interface TodaysFlowProps {
  todaysTasks: Task[];
  upcomingDeadlines: Task[];
}

const DOT_COLOR: Record<Task["priority"], string> = {
  high:     "bg-coral-glow",
  medium:   "bg-goldglow",
  low:      "bg-lavglow",
  critical: "bg-coral-glow",
};

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  } catch { return ""; }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  } catch { return ""; }
}

export default function TodaysFlow({ todaysTasks, upcomingDeadlines }: TodaysFlowProps) {
  return (
    <div className="glass rounded-glass p-5 sm:p-6">
      <div className="mb-1 flex items-center gap-2">
        <Sparkles size={16} className="text-lavglow" aria-hidden="true" />
        <h2 className="font-display text-lg font-medium text-ink">Today&apos;s Flow</h2>
      </div>
      <p className="mb-5 text-xs text-ink-soft">A gentle map of what&apos;s near.</p>

      <div className="space-y-5">
        <section aria-label="Today's tasks">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
            Today
          </h3>
          {/* timeline line — visible in both modes */}
          <div className="relative space-y-3 border-l border-[var(--border-medium)] pl-4">
            {todaysTasks.length === 0 && (
              <p className="text-sm text-ink-soft">Nothing pulling at you today. Breathe easy.</p>
            )}
            {todaysTasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0, y: [0, -3, 0] }}
                transition={{
                  opacity: { delay: i * 0.06, duration: 0.4 },
                  x:       { delay: i * 0.06, duration: 0.4 },
                  y:       { duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 },
                }}
                className="relative rounded-2xl p-3 shadow-sm backdrop-blur-sm"
                style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-soft)" }}
              >
                <span
                  aria-hidden="true"
                  className={`absolute -left-[1.45rem] top-4 h-2.5 w-2.5 rounded-full ${DOT_COLOR[task.priority] ?? "bg-lavglow"}`}
                />
                <p className="text-sm font-medium text-ink">{task.title}</p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {formatTime(task.deadline)} · {task.duration} min
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section aria-label="Upcoming deadlines">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
            <CalendarClock size={14} aria-hidden="true" />
            Upcoming
          </h3>
          <div className="relative space-y-3 border-l border-[var(--border-medium)] pl-4">
            {upcomingDeadlines.length === 0 && (
              <p className="text-sm text-ink-soft">Nothing on the horizon yet.</p>
            )}
            {upcomingDeadlines.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0, y: [0, -3, 0] }}
                transition={{
                  opacity: { delay: i * 0.06, duration: 0.4 },
                  x:       { delay: i * 0.06, duration: 0.4 },
                  y:       { duration: 7 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 },
                }}
                className="relative rounded-2xl p-3 shadow-sm backdrop-blur-sm"
                style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-soft)" }}
              >
                <span
                  aria-hidden="true"
                  className={`absolute -left-[1.45rem] top-4 h-2.5 w-2.5 rounded-full ${DOT_COLOR[task.priority] ?? "bg-lavglow"}`}
                />
                <p className="text-sm font-medium text-ink">{task.title}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{formatDate(task.deadline)}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
