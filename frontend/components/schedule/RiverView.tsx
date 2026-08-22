"use client";

import { AnimatePresence, motion } from "framer-motion";
import { TaskIsland } from "./TaskIsland";
import { FlowRiver, BreakPool, DeadlineLighthouse } from "./FlowRiver";
import type { Task, TaskState } from "@/types/task";

type FilterOption = "all" | TaskState;

const SEGMENTS = [
  { key: "morning" as const, label: "🌅 Morning" },
  { key: "afternoon" as const, label: "☀ Afternoon" },
  { key: "evening" as const, label: "🌙 Evening" },
];

interface RiverViewProps {
  tasks: Task[];
  filter: FilterOption;
  onTaskClick: (task: Task) => void;
}

export default function RiverView({
  tasks,
  filter,
  onTaskClick,
}: RiverViewProps) {
  const filtered =
    filter === "all" ? tasks : tasks.filter((t) => t.state === filter);
  const overdueTask = tasks.find((t) => t.state === "overdue");

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <motion.div
          style={{ fontSize: 52, opacity: 0.25 }}
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          🌊
        </motion.div>
        <p
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 20,
            color: "rgba(255,255,255,0.35)",
          }}
        >
          The river is calm today.
        </p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)" }}>
          Add a thought below to let it flow.
        </p>
      </div>
    );
  }

  const segmentsWithTasks = SEGMENTS.filter((s) =>
    filtered.some((t) => t.segment === s.key),
  );

  return (
    <div className="flex flex-col items-center gap-0">
      <AnimatePresence mode="popLayout">
        {segmentsWithTasks.map((seg, si) => {
          const segTasks = filtered.filter((t) => t.segment === seg.key);
          const showBreak = si < segmentsWithTasks.length - 1;

          return (
            <motion.div
              key={seg.key}
              className="flex w-full flex-col items-center"
              layout
            >
              {/* Divider before segment (except first) */}
              {si > 0 && (
                <motion.div
                  className="my-2 h-10 w-px"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent, rgba(255,255,255,0.06), transparent)",
                  }}
                />
              )}

              {/* Time label */}
              <div
                className="mb-3 flex items-center gap-2 rounded-full px-3 py-1"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {seg.label}
              </div>

              {/* Task islands */}
              {segTasks.map((task, ti) => (
                <div
                  key={task.id}
                  className="flex w-full flex-col items-center"
                >
                  <TaskIsland task={task} index={ti} onClick={onTaskClick} />
                  {ti < segTasks.length - 1 && <FlowRiver count={2} />}
                </div>
              ))}

              {/* Break pool between segments */}
              {showBreak && <BreakPool duration="30m" />}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Deadline lighthouse */}
      {overdueTask && (
        <DeadlineLighthouse
          title={overdueTask.title}
          deadline={overdueTask.deadline}
        />
      )}
    </div>
  );
}
