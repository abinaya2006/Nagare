"use client";

import { useState, useRef, useCallback } from "react";
import type { Task } from "@/types/task";

interface ScheduleItem {
  task_id: string;
  task_title: string;
  start_time: string;
  end_time: string;
}

const PRIORITY_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  critical: { bg: "rgba(255,139,107,0.13)", border: "#FF8B6B", color: "#FF8B6B" },
  high:     { bg: "rgba(244,197,106,0.13)", border: "#F4C56A", color: "#F4C56A" },
  medium:   { bg: "rgba(184,176,232,0.13)", border: "#B8B0E8", color: "#B8B0E8" },
  low:      { bg: "rgba(130,196,248,0.13)", border: "#82C4F8", color: "#82C4F8" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOUR_START = 6;
const HOUR_END = 24;
const CELL_H = 56;
const TOTAL_HOURS = HOUR_END - HOUR_START;

interface CalendarViewProps {
  tasks?: Task[];
  scheduleItems?: ScheduleItem[];
  isLoading?: boolean;
  onTaskSelect?: (id: string) => void;
  onTaskUpdate?: (id: string, patch: Partial<Task>) => Promise<void>;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function hourLabel(hour: number): string {
  if (hour === 0 || hour === 24) return "12am";
  if (hour === 12) return "12pm";
  return hour > 12 ? `${hour - 12}pm` : `${hour}am`;
}

function formatTime(startHour: number): string {
  const h = Math.floor(startHour);
  const m = Math.round((startHour % 1) * 60);
  const date = new Date(0, 0, 0, h, m);
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

export default function CalendarView({
  tasks = [],
  scheduleItems = [],
  isLoading,
  onTaskSelect,
  onTaskUpdate,
}: CalendarViewProps) {
  const today = new Date();
  const [weekOffset, setWeekOffset] = useState(0);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ day: number; hour: number } | null>(null);
  const [dropping, setDropping] = useState(false);
  // local optimistic positions: taskId → { day, startHour }
  const [localPositions, setLocalPositions] = useState<Record<string, { day: number; startHour: number }>>({});
  const dragCounter = useRef<Record<string, number>>({}); // per-cell enter counter to avoid flicker

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

  // Build events, applying local optimistic overrides
  const baseEvents = scheduleItems.length > 0
    ? scheduleItems.flatMap((item) => {
        const start = new Date(item.start_time);
        const end = new Date(item.end_time);
        const weekDay = weekDays.findIndex(wd => wd.toDateString() === start.toDateString());
        if (weekDay === -1) return [];
        const durationHours = (end.getTime() - start.getTime()) / 3600000;
        const task = tasks.find(t => t.id === item.task_id);
        return [{
          id: item.task_id,
          day: weekDay,
          startHour: start.getHours() + start.getMinutes() / 60,
          durationHours,
          title: item.task_title,
          priority: task?.priority ?? "medium",
        }];
      })
    : tasks
        .filter(t => t.deadline)
        .flatMap(t => {
          const d = new Date(t.deadline!);
          const weekDay = weekDays.findIndex(wd => wd.toDateString() === d.toDateString());
          if (weekDay === -1) return [];
          return [{
            id: t.id,
            day: weekDay,
            startHour: d.getHours() + d.getMinutes() / 60,
            durationHours: 1,
            title: t.title,
            priority: t.priority ?? "medium",
          }];
        });

  // Apply optimistic overrides
  const events = baseEvents.map(ev => {
    const override = localPositions[ev.id];
    if (!override) return ev;
    return { ...ev, day: override.day, startHour: override.startHour };
  });

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id); // required for Firefox
    setDraggingId(id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverSlot(null);
    dragCounter.current = {};
  }, []);

  const cellKey = (day: number, hour: number) => `${day}-${hour}`;

  const handleCellDragEnter = useCallback((e: React.DragEvent, day: number, hour: number) => {
    e.preventDefault();
    const key = cellKey(day, hour);
    dragCounter.current[key] = (dragCounter.current[key] ?? 0) + 1;
    setDragOverSlot({ day, hour });
  }, []);

  const handleCellDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleCellDragLeave = useCallback((e: React.DragEvent, day: number, hour: number) => {
    const key = cellKey(day, hour);
    dragCounter.current[key] = (dragCounter.current[key] ?? 1) - 1;
    if (dragCounter.current[key] <= 0) {
      dragCounter.current[key] = 0;
      setDragOverSlot(prev => (prev?.day === day && prev?.hour === hour ? null : prev));
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, day: number, hour: number) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggingId;
    if (!id || !onTaskUpdate || dropping) return;

    // Reset drag state immediately — no reload
    setDraggingId(null);
    setDragOverSlot(null);
    dragCounter.current = {};

    // Optimistic UI update before API call
    setLocalPositions(prev => ({ ...prev, [id]: { day, startHour: hour } }));

    setDropping(true);
    try {
      const targetDate = new Date(weekDays[day]);
      targetDate.setHours(Math.floor(hour), Math.round((hour % 1) * 60), 0, 0);
      // Call without awaiting refresh — no page reload
      await onTaskUpdate(id, { deadline: targetDate.toISOString() });
    } catch {
      // Revert optimistic update on failure
      setLocalPositions(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } finally {
      setDropping(false);
    }
  }, [draggingId, onTaskUpdate, dropping, weekDays]);

  const handleUnschedule = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onTaskUpdate) return;
    await onTaskUpdate(id, { deadline: undefined });
  }, [onTaskUpdate]);

  const weekLabel = `${weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Week nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
        <button
          onClick={() => setWeekOffset(w => w - 1)}
          style={navBtnStyle}
        >‹</button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em" }}>{weekLabel}</span>
          {!isThisWeek && (
            <button onClick={() => setWeekOffset(0)} style={todayBtnStyle}>Today</button>
          )}
        </div>

        <button
          onClick={() => setWeekOffset(w => w + 1)}
          style={navBtnStyle}
        >›</button>
      </div>

      {isLoading && (
        <div style={{ textAlign: "center", padding: 24, color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
          Loading schedule…
        </div>
      )}

      {!isLoading && (
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 600, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>

            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "48px repeat(7, 1fr)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div />
              {weekDays.map((date, d) => {
                const isToday = isThisWeek && d === todayDow;
                return (
                  <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0" }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em" }}>{DAYS[d]}</span>
                    <span style={{
                      marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center",
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
            <div style={{ overflowY: "auto", maxHeight: "60vh" }}>
              <div style={{ display: "grid", gridTemplateColumns: "48px repeat(7, 1fr)" }}>

                {/* Time column */}
                <div>
                  {Array.from({ length: TOTAL_HOURS }).map((_, hi) => {
                    const hour = HOUR_START + hi;
                    return (
                      <div key={hour} style={{ height: CELL_H, paddingRight: 8, paddingTop: 4, textAlign: "right", fontSize: 10, color: "rgba(255,255,255,0.2)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                        {hourLabel(hour)}
                      </div>
                    );
                  })}
                </div>

                {/* Day columns */}
                {weekDays.map((_, d) => (
                  <div key={d} style={{ position: "relative" }}>
                    {/* Drop zones */}
                    {Array.from({ length: TOTAL_HOURS }).map((_, hi) => {
                      const hour = HOUR_START + hi;
                      const isHovered = dragOverSlot?.day === d && dragOverSlot?.hour === hour;
                      return (
                        <div
                          key={hi}
                          onDragEnter={e => handleCellDragEnter(e, d, hour)}
                          onDragOver={handleCellDragOver}
                          onDragLeave={e => handleCellDragLeave(e, d, hour)}
                          onDrop={e => handleDrop(e, d, hour)}
                          style={{
                            height: CELL_H,
                            borderRight: "1px solid rgba(255,255,255,0.04)",
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            background: isHovered ? "rgba(124,111,205,0.18)" : "transparent",
                            transition: "background 0.12s",
                            boxShadow: isHovered ? "inset 0 0 0 1px rgba(124,111,205,0.4)" : "none",
                          }}
                        />
                      );
                    })}

                    {/* Events */}
                    {events
                      .filter(ev => ev.day === d)
                      .map(ev => {
                        const top = (ev.startHour - HOUR_START) * CELL_H;
                        const height = Math.max(ev.durationHours * CELL_H - 3, 28);
                        const s = PRIORITY_STYLES[ev.priority] ?? PRIORITY_STYLES.medium;
                        const isDragging = draggingId === ev.id;
                        return (
                          <div
                            key={ev.id}
                            draggable
                            onDragStart={e => handleDragStart(e, ev.id)}
                            onDragEnd={handleDragEnd}
                            onClick={() => !dropping && onTaskSelect?.(ev.id)}
                            style={{
                              position: "absolute",
                              top,
                              height,
                              left: 3,
                              right: 3,
                              borderRadius: 8,
                              background: s.bg,
                              borderLeft: `3px solid ${s.border}`,
                              padding: "4px 7px",
                              cursor: isDragging ? "grabbing" : "grab",
                              overflow: "hidden",
                              zIndex: isDragging ? 0 : 1,
                              opacity: isDragging ? 0.35 : 1,
                              transition: "opacity 0.15s, transform 0.15s",
                              transform: isDragging ? "scale(0.97)" : "scale(1)",
                              userSelect: "none",
                            }}
                          >
                            <div style={{ fontSize: 11, fontWeight: 500, color: s.color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 16 }}>
                              {ev.title}
                            </div>
                            <div style={{ fontSize: 10, color: `${s.color}80` }}>
                              {formatTime(ev.startHour)}
                            </div>
                            <button
                              onClick={e => handleUnschedule(ev.id, e)}
                              title="Remove from schedule"
                              style={{ position: "absolute", top: 3, right: 4, background: "none", border: "none", color: `${s.color}90`, cursor: "pointer", fontSize: 13, lineHeight: 1, padding: 2 }}
                            >×</button>
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {dropping && (
        <div style={{ textAlign: "center", fontSize: 11, color: "rgba(167,139,250,0.6)", marginTop: 4 }}>
          Saving…
        </div>
      )}
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  width: 32,
  height: 32,
  cursor: "pointer",
  color: "rgba(255,255,255,0.7)",
  fontSize: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const todayBtnStyle: React.CSSProperties = {
  background: "rgba(124,111,205,0.15)",
  border: "1px solid rgba(124,111,205,0.3)",
  borderRadius: 8,
  padding: "2px 10px",
  cursor: "pointer",
  color: "rgba(167,139,250,0.9)",
  fontSize: 11,
};
