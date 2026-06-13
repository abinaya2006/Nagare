"use client";

import { motion } from "framer-motion";
import type { Task } from "@/types/task";

const PRIORITY_EVENT_STYLES: Record<
  Task["priority"],
  { bg: string; border: string; color: string }
> = {
  critical: {
    bg: "rgba(255,139,107,0.13)",
    border: "#FF8B6B",
    color: "#FF8B6B",
  },
  high: { bg: "rgba(244,197,106,0.13)", border: "#F4C56A", color: "#F4C56A" },
  medium: { bg: "rgba(184,176,232,0.13)", border: "#B8B0E8", color: "#B8B0E8" },
  low: { bg: "rgba(130,196,248,0.13)", border: "#82C4F8", color: "#82C4F8" },
};

interface CalendarEvent {
  day: number;
  startHour: number;
  durationHours: number;
  title: string;
  priority: Task["priority"];
}

interface CalendarViewProps {
  tasks?: Task[];
  isLoading?: boolean;
  onTaskSelect?: (id: string) => void;
}

const MOCK_EVENTS: CalendarEvent[] = [
  {
    day: 1,
    startHour: 9,
    durationHours: 2,
    title: "Deep Work",
    priority: "high",
  },
  {
    day: 1,
    startHour: 14,
    durationHours: 1.5,
    title: "DBMS Study",
    priority: "critical",
  },
  {
    day: 2,
    startHour: 10,
    durationHours: 1,
    title: "Team Standup",
    priority: "medium",
  },
  {
    day: 3,
    startHour: 15,
    durationHours: 3,
    title: "Hackathon Prep",
    priority: "high",
  },
  {
    day: 4,
    startHour: 9,
    durationHours: 2,
    title: "Auth Module",
    priority: "medium",
  },
  {
    day: 5,
    startHour: 11,
    durationHours: 1,
    title: "DSA Practice",
    priority: "medium",
  },
  {
    day: 5,
    startHour: 18,
    durationHours: 1.5,
    title: "Creative Work",
    priority: "low",
  },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOUR_START = 8;
const HOUR_END = 21;
const CELL_H = 56;

export function CalendarViewFull({
  tasks,
  isLoading,
  onTaskSelect,
}: CalendarViewProps) {
  const today = new Date();
  const todayDow = today.getDay();
  const totalHours = HOUR_END - HOUR_START;

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{ border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Header row */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "48px repeat(7, 1fr)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div />
        {DAYS.map((day, d) => {
          const date = new Date(today);
          date.setDate(today.getDate() - todayDow + d);
          const isToday = d === todayDow;
          return (
            <div key={day} className="flex flex-col items-center py-2">
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.28)",
                  letterSpacing: "0.06em",
                }}
              >
                {day}
              </span>
              <span
                className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs"
                style={
                  isToday
                    ? {
                        background: "#7C6FCD",
                        color: "white",
                        boxShadow: "0 0 10px rgba(124,111,205,0.4)",
                      }
                    : { color: "rgba(255,255,255,0.5)" }
                }
              >
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Body */}
      <div className="relative overflow-y-auto" style={{ maxHeight: "60vh" }}>
        <div
          className="grid"
          style={{ gridTemplateColumns: "48px repeat(7, 1fr)" }}
        >
          {/* Time column */}
          <div>
            {Array.from({ length: totalHours }).map((_, hi) => {
              const hour = HOUR_START + hi;
              const label =
                hour > 12
                  ? `${hour - 12}pm`
                  : hour === 12
                    ? "12pm"
                    : `${hour}am`;
              return (
                <div
                  key={hour}
                  className="pr-2 pt-1 text-right"
                  style={{
                    height: CELL_H,
                    fontSize: 10,
                    color: "rgba(255,255,255,0.2)",
                    borderRight: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {label}
                </div>
              );
            })}
          </div>

          {/* Day columns */}
          {DAYS.map((_, d) => (
            <div key={d} style={{ position: "relative" }}>
              {Array.from({ length: totalHours }).map((_, hi) => (
                <div
                  key={hi}
                  style={{
                    height: CELL_H,
                    borderRight: "1px solid rgba(255,255,255,0.04)",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                />
              ))}
              {MOCK_EVENTS.filter((e) => e.day === d).map((ev, ei) => {
                const top = (ev.startHour - HOUR_START) * CELL_H;
                const height = ev.durationHours * CELL_H - 3;
                const style = PRIORITY_EVENT_STYLES[ev.priority];
                return (
                  <motion.div
                    key={ei}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: ei * 0.07,
                      type: "spring",
                      stiffness: 280,
                      damping: 24,
                    }}
                    whileHover={{ scale: 1.02, zIndex: 10 }}
                    onClick={() => onTaskSelect?.(String(ei))}
                    style={{
                      position: "absolute",
                      top,
                      height,
                      left: 3,
                      right: 3,
                      borderRadius: 8,
                      background: style.bg,
                      borderLeft: `3px solid ${style.border}`,
                      padding: "4px 7px",
                      cursor: "pointer",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: style.color,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {ev.title}
                    </div>
                    <div style={{ fontSize: 10, color: `${style.color}80` }}>
                      {ev.startHour}:00
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Default export — what page.tsx imports
export default CalendarViewFull;
