"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock } from "lucide-react";
import { useTasks } from "@/contexts/TaskContext";
import type { TaskPriority } from "@/types";

interface QuickAddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

function toDurationString(hours: number) {
  const mins = Math.round(hours * 60);
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${mins}m`;
}

// ── Shared style tokens (mirrors Focus Beacon) ────────────────────────────────
const TEXT = "#2F3142";
const TEXT_SOFT = "#6D7088";

export default function QuickAddTaskModal({
  isOpen,
  onClose,
}: QuickAddTaskModalProps) {
  const { createTask } = useTasks();
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [hours, setHours] = useState("1");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [submitting, setSubmitting] = useState(false);
  const [titleError, setTitleError] = useState(false);

  const reset = () => {
    setTitle("");
    setDeadline("");
    setHours("1");
    setPriority("medium");
    setTitleError(false);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    setSubmitting(true);
    const parsedHours = parseFloat(hours) || 0.5;
    await createTask({
      title: title.trim(),
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      duration: toDurationString(parsedHours),
      priority,
    });
    setSubmitting(false);
    reset();
    onClose();
  };

  const inputBase: React.CSSProperties = {
    width: "100%",
    borderRadius: 14,
    border: "1px solid rgba(200,196,220,0.4)",
    background: "rgba(232,225,255,0.2)",
    padding: "10px 14px",
    fontSize: 13,
    color: TEXT,
    outline: "none",
    fontFamily: "inherit",
    transition: "all 0.2s",
  };

  const inputFocus: React.CSSProperties = {
    borderColor: "rgba(174,166,219,0.65)",
    background: "rgba(255,255,255,0.85)",
    boxShadow: "0 0 0 3px rgba(174,166,219,0.12)",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="task-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
              background: "rgba(220,215,245,0.35)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          />

          {/* Centering shell */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              paddingInline: 16,
            }}
          >
            <motion.form
              key="task-panel"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSubmit}
              style={{
                pointerEvents: "auto",
                width: "min(380px, 100%)",
                borderRadius: 28,
                border: "1px solid rgba(232,225,255,0.7)",
                background: "rgba(255,255,255,0.82)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                boxShadow:
                  "0 12px 60px rgba(174,166,219,0.22), 0 2px 16px rgba(174,166,219,0.12), inset 0 1px 0 rgba(255,255,255,0.95)",
                overflow: "hidden",
                position: "relative",
                padding: 24,
                fontFamily: "inherit",
              }}
            >
              {/* Glass sheen */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "inherit",
                  pointerEvents: "none",
                  background:
                    "linear-gradient(155deg, rgba(232,225,255,0.2) 0%, rgba(221,238,255,0.14) 50%, rgba(255,244,199,0.08) 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "15%",
                  right: "15%",
                  height: 1,
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)",
                  pointerEvents: "none",
                }}
              />

              {/* Close button */}
              <motion.button
                type="button"
                onClick={handleClose} // ← make sure this is handleClose, not onClose
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  position: "absolute",
                  right: 18,
                  top: 18,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: "1px solid rgba(200,196,220,0.35)",
                  background: "rgba(232,225,255,0.4)",
                  color: "#6D7088",
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "inherit",
                  zIndex: 1,
                }}
                aria-label="Close"
              >
                ✕
              </motion.button>

              {/* Header */}
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 15, color: "#b8a9e8" }}>✦</span>
                  <h2
                    style={{
                      fontFamily: "'DM Serif Display', Georgia, serif",
                      fontStyle: "italic",
                      fontSize: 22,
                      fontWeight: 400,
                      color: TEXT,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    New task
                  </h2>
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: TEXT_SOFT,
                    marginTop: 3,
                    fontStyle: "italic",
                    fontFamily: "'DM Serif Display', Georgia, serif",
                  }}
                >
                  Drop a thought into the jar.
                </p>
              </div>

              {/* Divider */}
              <div
                style={{
                  height: 1,
                  background: "rgba(232,225,255,0.55)",
                  margin: "18px 0",
                  position: "relative",
                  zIndex: 1,
                }}
              />

              {/* Fields */}
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {/* Title */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 9,
                      letterSpacing: "0.09em",
                      textTransform: "uppercase",
                      color: TEXT_SOFT,
                      fontFamily: "sans-serif",
                      marginBottom: 6,
                      fontWeight: 500,
                    }}
                  >
                    Name
                  </label>
                  <FocusInput
                    as="input"
                    type="text"
                    autoFocus
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setTitle(e.target.value);
                      if (titleError) setTitleError(false);
                    }}
                    placeholder="Finish reading chapter 4"
                    baseStyle={inputBase}
                    focusStyle={inputFocus}
                    errorStyle={
                      titleError
                        ? {
                            borderColor: "rgba(220,100,100,0.5)",
                            boxShadow: "0 0 0 3px rgba(220,100,100,0.08)",
                          }
                        : {}
                    }
                  />
                  {titleError && (
                    <p
                      style={{
                        marginTop: 5,
                        fontSize: 11,
                        color: "#C4604A",
                        fontFamily: "sans-serif",
                        fontStyle: "italic",
                      }}
                    >
                      Give it a name first.
                    </p>
                  )}
                </div>

                {/* Deadline + Hours */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 9,
                        letterSpacing: "0.09em",
                        textTransform: "uppercase",
                        color: TEXT_SOFT,
                        fontFamily: "sans-serif",
                        marginBottom: 6,
                        fontWeight: 500,
                      }}
                    >
                      <Calendar size={10} />
                      Deadline
                    </label>
                    <FocusInput
                      as="input"
                      type="datetime-local"
                      value={deadline}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDeadline(e.target.value)
                      }
                      baseStyle={inputBase}
                      focusStyle={inputFocus}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 9,
                        letterSpacing: "0.09em",
                        textTransform: "uppercase",
                        color: TEXT_SOFT,
                        fontFamily: "sans-serif",
                        marginBottom: 6,
                        fontWeight: 500,
                      }}
                    >
                      <Clock size={10} />
                      Hours needed
                    </label>
                    <FocusInput
                      as="input"
                      type="number"
                      min="0.25"
                      step="0.25"
                      value={hours}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setHours(e.target.value)
                      }
                      baseStyle={inputBase}
                      focusStyle={inputFocus}
                    />
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 9,
                      letterSpacing: "0.09em",
                      textTransform: "uppercase",
                      color: TEXT_SOFT,
                      fontFamily: "sans-serif",
                      marginBottom: 6,
                      fontWeight: 500,
                    }}
                  >
                    Priority
                  </label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {PRIORITIES.map((p) => (
                      <motion.button
                        key={p.value}
                        type="button"
                        onClick={() => setPriority(p.value)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        style={{
                          flex: 1,
                          borderRadius: 999,
                          padding: "7px 6px",
                          fontSize: 10,
                          fontWeight: 500,
                          fontFamily: "sans-serif",
                          letterSpacing: "0.04em",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          border:
                            priority === p.value
                              ? "1px solid rgba(174,166,219,0.5)"
                              : "1px solid rgba(200,196,220,0.4)",
                          background:
                            priority === p.value
                              ? "linear-gradient(135deg, rgba(174,166,219,0.55) 0%, rgba(174,208,240,0.45) 100%)"
                              : "rgba(232,225,255,0.35)",
                          color: priority === p.value ? "#3C3489" : TEXT_SOFT,
                          boxShadow:
                            priority === p.value
                              ? "inset 0 1px 0 rgba(255,255,255,0.7)"
                              : "none",
                        }}
                      >
                        {p.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  position: "relative",
                  zIndex: 1,
                  marginTop: 20,
                  width: "100%",
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid rgba(174,208,240,0.55)",
                  background:
                    "linear-gradient(135deg, rgba(221,238,255,0.85) 0%, rgba(232,225,255,0.75) 100%)",
                  color: "#4A6FA5",
                  fontSize: 13,
                  cursor: submitting ? "default" : "pointer",
                  fontFamily: "inherit",
                  fontWeight: 500,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                  opacity: submitting ? 0.6 : 1,
                  transition: "opacity 0.2s",
                  letterSpacing: "0.01em",
                }}
              >
                {submitting ? "Adding…" : "Add to the jar"}
              </motion.button>
            </motion.form>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Tiny helper: input that applies focus styles inline ───────────────────────
function FocusInput({
  as: _as = "input",
  baseStyle,
  focusStyle,
  errorStyle = {},
  ...props
}: {
  as?: "input" | "textarea";
  baseStyle: React.CSSProperties;
  focusStyle: React.CSSProperties;
  errorStyle?: React.CSSProperties;
  [key: string]: unknown;
}) {
  const [focused, setFocused] = useState(false);
  const merged = {
    ...baseStyle,
    ...(focused ? focusStyle : {}),
    ...errorStyle,
  };

  if (_as === "textarea") {
    return (
      <textarea
        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        style={merged}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    );
  }
  return (
    <input
      {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
      style={merged}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}
