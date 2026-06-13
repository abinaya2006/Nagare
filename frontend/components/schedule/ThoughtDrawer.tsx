"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Task } from "@/types/task";

const PRIORITY_COLORS: Record<Task["priority"], string> = {
  critical: "#FF8B6B",
  high: "#F4C56A",
  medium: "#B8B0E8",
  low: "#82C4F8",
};

interface ThoughtDrawerProps {
  task: Task | null;
  onClose: () => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate?: (data: Partial<Task>) => void;
}

export function ThoughtDrawer({
  task,
  onClose,
  onComplete,
  onDelete,
  onUpdate,
}: ThoughtDrawerProps) {
  const isOpen = task !== null;

  return (
    <AnimatePresence>
      {isOpen && task && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            className="fixed bottom-0 right-0 top-0 z-50 flex w-[340px] flex-col"
            style={{
              background:
                "linear-gradient(180deg, rgba(13,18,37,0.99) 0%, rgba(7,11,24,0.99) 100%)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(24px)",
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
          >
            {/* Ambient glow */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(124,111,205,0.06) 0%, transparent 40%, rgba(78,205,196,0.05) 100%)",
              }}
            />

            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-6"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <h2
                className="font-serif text-lg"
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                Thought Details
              </h2>
              <button
                onClick={onClose}
                className="text-xl transition-colors"
                style={{
                  color: "rgba(255,255,255,0.25)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <Field label="Thought">
                <span
                  className="text-[16px] font-medium"
                  style={{ color: "rgba(255,255,255,0.9)" }}
                >
                  {task.title}
                </span>
              </Field>

              <Field label="Priority">
                <span
                  className="inline-block rounded-xl px-3 py-0.5 text-[12px] font-medium capitalize"
                  style={{
                    background: `${PRIORITY_COLORS[task.priority]}20`,
                    color: PRIORITY_COLORS[task.priority],
                  }}
                >
                  {task.priority}
                </span>
              </Field>

              <Field label="State">
                <span
                  className="capitalize"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  {task.state === "overdue"
                    ? "Calling"
                    : task.state
                      ? task.state.charAt(0).toUpperCase() + task.state.slice(1)
                      : "Unknown"}
                </span>
              </Field>

              <Field label="Deadline">
                <span style={{ color: "rgba(255,255,255,0.7)" }}>
                  {task.deadline}
                </span>
              </Field>

              <Field label="Duration">
                <span style={{ color: "rgba(255,255,255,0.7)" }}>
                  {task.duration}
                </span>
              </Field>

              <Field label="Category">
                <span style={{ color: "rgba(255,255,255,0.7)" }}>
                  {task.category}
                </span>
              </Field>

              <Field label="Suggested Energy">
                <span style={{ color: "rgba(255,255,255,0.7)" }}>
                  {task.energy}
                </span>
              </Field>

              {task.notes && (
                <Field label="Notes">
                  <span
                    className="block text-[13px] leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {task.notes}
                  </span>
                </Field>
              )}

              <Field label="Constellation">
                <div
                  className="flex items-center gap-2 rounded-xl px-3.5 py-2.5"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span style={{ color: "#F4C56A" }}>✦</span>
                  <span
                    className="text-[13px]"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    {task.constellation}
                  </span>
                </div>
              </Field>
            </div>

            {/* Footer */}
            <div
              className="flex gap-2.5 px-5 py-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <DrawerBtn
                onClick={() => {
                  onComplete(task.id);
                  onClose();
                }}
                style={{
                  background: "rgba(78,205,196,0.12)",
                  color: "#4ECDC4",
                  border: "1px solid rgba(78,205,196,0.28)",
                }}
              >
                ✓ Resolve
              </DrawerBtn>
              <DrawerBtn
                style={{
                  background: "rgba(124,111,205,0.12)",
                  color: "#7C6FCD",
                  border: "1px solid rgba(124,111,205,0.28)",
                }}
              >
                ✎ Edit
              </DrawerBtn>
              <DrawerBtn
                onClick={() => {
                  onDelete(task.id);
                  onClose();
                }}
                style={{
                  background: "rgba(255,139,107,0.08)",
                  color: "#FF8B6B",
                  border: "1px solid rgba(255,139,107,0.2)",
                }}
              >
                ✕ Release
              </DrawerBtn>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div
        className="mb-1.5 text-[11px] uppercase tracking-widest"
        style={{ color: "rgba(255,255,255,0.25)" }}
      >
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}

function DrawerBtn({
  children,
  onClick,
  style,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 rounded-[10px] py-2.5 text-[12.5px] font-medium transition-all hover:brightness-110 active:scale-95"
      style={{
        fontFamily: "inherit",
        border: "none",
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export default ThoughtDrawer;
