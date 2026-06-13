"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import type { Task } from "@/types/task";

const PRIORITY_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  high:   { bg: "rgba(244,197,106,0.13)", border: "#F4C56A", color: "#F4C56A" },
  medium: { bg: "rgba(184,176,232,0.13)", border: "#B8B0E8", color: "#B8B0E8" },
  low:    { bg: "rgba(130,196,248,0.13)", border: "#82C4F8", color: "#82C4F8" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOUR_START = 8;
const HOUR_END = 21;
const CELL_H = 56;
const TOTAL_HOURS = HOUR_END - HOUR_START;

interface CalendarViewProps {
  tasks?: Task[];
  isLoading?: boolean;
  onTaskSelect?: (id: string) => void;
  // Must match TaskContext.updateTask signature
  onTaskUpdate?: (id: string, patch: Partial<Task>) => Promise<void>;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function hourLabel(hour: number): string {
  if (hour === 12) return "12pm";
  return hour > 12 ? `${hour - 12}pm` : `${hour}am`;
}

export default function CalendarView({
  tasks = [],
  isLoading,
  onTaskSelect,
  onTaskUpdate,
}: CalendarViewProps) {
  const today = new Date();
  const [weekOffset, setWeekOffset] = useState(0);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ day: number; hour: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const weekStart = getWeekStart(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + weekOffset * 7)
  );

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const isThisWeek = weekOffset === 0;
  const todayDow = today.getDay();

  // ── Map tasks → calendar events ──────────────────────────────────────────
  const events = tasks
    .filter((t) => t.deadline)
    .flatMap((t) => {
      const d = new Date(t.deadline!);
      const weekDay = weekDays.findIndex(
        (wd) => wd.toDateString() === d.toDateString()
      );
      if (weekDay === -1) return [];
      return [{
        id: t.id,
        day: weekDay,
        startHour: d.getHours() + d.getMinutes() / 60,
        // ✅ correct field: estimated_duration_minutes (backend snake_case)
        durationHours: (t.estimated_duration_minutes ?? 60) / 60,
        title: t.title,
        // ✅ backend only has: low | medium | high  (no "critical")
        priority: t.priority ?? "medium",
      }];
    });

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDrop = async (day: number, hour: number) => {
    if (!draggingId || !onTaskUpdate) return;
    const targetDate = new Date(weekDays[day]);
    targetDate.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);
    // deadline is ISO string on the backend
    await onTaskUpdate(draggingId, { deadline: targetDate.toISOString() });
    setDraggingId(null);
    setDragOverSlot(null);
  };

  // ── "Unschedule" a task (remove deadline, reset to pending) ──────────────
  const handleUnscheduleTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onTaskUpdate) return;
    // ✅ correct field: "status" not "state"; correct value: "pending" not "waiting"
    // ✅ null, not undefined — backend nullable field
    await onTaskUpdate(id, { status: "pending", deadline: null });
  };

  const weekLabel = `${weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Week navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
        <motion.button
          onClick={() => setWeekOffset((w) => w - 1)}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, width: 32, height: 32, cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
        >‹</motion.button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em" }}>{weekLabel}</span>
          {!isThisWeek && (
            <motion.button
              onClick={() => setWeekOffset(0)}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ background: "rgba(124,111,205,0.15)", border: "1px solid rgba(124,111,205,0.3)", borderRadius: 8, padding: "2px 10px", cursor: "pointer", color: "rgba(167,139,250,0.9)", fontSize: 11 }}
            >Today</motion.button>
          )}
        </div>

        <motion.button
          onClick={() => setWeekOffset((w) => w + 1)}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, width: 32, height: 32, cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
        >›</motion.button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: 24, color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
          Loading schedule…
        </div>
      )}

      {/* Calendar grid */}
      {!isLoading && (
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 600, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
            {/* Header row */}
            <div style={{ display: "grid", gridTemplateColumns: "48px repeat(7, 1fr)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div />
              {weekDays.map((date, d) => {
                const isToday = isThisWeek && d === todayDow;
                return (
                  <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0" }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em" }}>
                      {DAYS[d]}
                    </span>
                    <span style={{
                      marginTop: 2,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 24, height: 24, borderRadius: "50%", fontSize: 12,
                      ...(isToday
                        ? { background: "#7C6FCD", color: "white", boxShadow: "0 0 10px rgba(124,111,205,0.4)" }
                        : { color: "rgba(255,255,255,0.5)" })
                    }}>
                      {date.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Body */}
            <div ref={gridRef} style={{ overflowY: "auto", maxHeight: "60vh" }}>
              <div style={{ display: "grid", gridTemplateColumns: "48px repeat(7, 1fr)" }}>
                {/* Time column */}
                <div>
                  {Array.from({ length: TOTAL_HOURS }).map((_, hi) => {
                    const hour = HOUR_START + hi;
                    return (
                      <div
                        key={hour}
                        style={{ height: CELL_H, paddingRight: 8, paddingTop: 4, textAlign: "right", fontSize: 10, color: "rgba(255,255,255,0.2)", borderRight: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        {hourLabel(hour)}
                      </div>
                    );
                  })}
                </div>

                {/* Day columns */}
                {weekDays.map((_, d) => (
                  <div key={d} style={{ position: "relative" }}>
                    {/* Drop zone cells */}
                    {Array.from({ length: TOTAL_HOURS }).map((_, hi) => {
                      const hour = HOUR_START + hi;
                      const isHovered = dragOverSlot?.day === d && dragOverSlot?.hour === hour;
                      return (
                        <div
                          key={hi}
                          style={{ height: CELL_H, borderRight: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", background: isHovered ? "rgba(124,111,205,0.12)" : "transparent", transition: "background 0.15s" }}
                          onDragOver={(e) => { e.preventDefault(); setDragOverSlot({ day: d, hour }); }}
                          onDrop={() => handleDrop(d, hour)}
                          onDragLeave={() => setDragOverSlot(null)}
                        />
                      );
                    })}

                    {/* Event chips */}
                    {events
                      .filter((ev) => ev.day === d)
                      .map((ev) => {
                        const top = (ev.startHour - HOUR_START) * CELL_H;
                        const height = Math.max(ev.durationHours * CELL_H - 3, 28);
                        const style = PRIORITY_STYLES[ev.priority] ?? PRIORITY_STYLES.medium;
                        return (
                          <motion.div
                            key={ev.id}
                            draggable
                            onDragStart={() => setDraggingId(ev.id)}
                            onDragEnd={() => { setDraggingId(null); setDragOverSlot(null); }}
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: draggingId === ev.id ? 0.4 : 1, x: 0 }}
                            whileHover={{ scale: 1.02, zIndex: 10 }}
                            onClick={() => onTaskSelect?.(ev.id)}
                            style={{ position: "absolute", top, height, left: 3, right: 3, borderRadius: 8, background: style.bg, borderLeft: `3px solid ${style.border}`, padding: "4px 7px", cursor: "grab", overflow: "hidden", zIndex: draggingId === ev.id ? 0 : 1 }}
                          >
                            <div style={{ fontSize: 11, fontWeight: 500, color: style.color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 16 }}>
                              {ev.title}
                            </div>
                            <div style={{ fontSize: 10, color: `${style.color}80` }}>
                              {Math.floor(ev.startHour)}:{String(Math.round((ev.startHour % 1) * 60)).padStart(2, "0")}
                            </div>
                            <button
                              onClick={(e) => handleUnscheduleTask(ev.id, e)}
                              title="Remove from schedule"
                              style={{ position: "absolute", top: 3, right: 4, background: "none", border: "none", color: `${style.color}90`, cursor: "pointer", fontSize: 12, lineHeight: 1, padding: 2 }}
                            >×</button>
                          </motion.div>
                        );
                      })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
