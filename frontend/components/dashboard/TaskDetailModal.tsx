"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Clock, Calendar, CheckCircle2 } from "lucide-react";
import type { Task } from "@/types";

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onComplete: (taskId: string) => void;
}

const PRIORITY_LABEL: Record<Task["priority"], string> = {
  high: "High priority · coral",
  medium: "Medium priority · gold",
  low: "Low priority · lavender",
};

function formatDeadline(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/**
 * A gentle, glassy modal that surfaces a single task's details. Framed as a
 * "thought card" rather than a task ticket - calm wording, generous space.
 */
export default function TaskDetailModal({ task, onClose, onComplete }: TaskDetailModalProps) {
  return (
    <AnimatePresence>
      {task && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* backdrop */}
          <motion.div
            className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
            layoutId={`orb-${task.id}`}
            initial={{ opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 18 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="glass-strong relative z-10 w-full max-w-md rounded-glass p-6 sm:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-2 text-ink-soft transition hover:bg-white/50 hover:text-ink"
            >
              <X size={18} />
            </button>

            <p className="mb-1 text-xs uppercase tracking-[0.2em] text-ink-soft">
              {task.completed ? "Settled thought" : PRIORITY_LABEL[task.priority]}
            </p>
            <h2 id="task-modal-title" className="font-display text-2xl font-medium text-ink">
              {task.title}
            </h2>

            <div className="mt-6 space-y-4 text-sm text-ink/80">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-ink-soft" />
                <span>{formatDeadline(task.deadline)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-ink-soft" />
                <span>About {task.estimatedDuration} minutes</span>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-5 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-white/50"
              >
                Let it float
              </button>
              {!task.completed && (
                <button
                  type="button"
                  onClick={() => onComplete(task.id)}
                  className="flex items-center gap-2 rounded-full bg-lavglow/70 px-5 py-2.5 text-sm font-medium text-[#4f3f8a] shadow-glow-lav transition hover:bg-lavglow/90"
                >
                  <CheckCircle2 size={16} />
                  Mark complete
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
