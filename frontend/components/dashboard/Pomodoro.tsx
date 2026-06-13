"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "idle" | "focus" | "break" | "complete";

const FOCUS_COLOR = "#4ECDC4";
const BREAK_COLOR = "#A78BFA";

function fmtTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function loadStorage() {
  if (typeof window === "undefined") return {};
  try {
    const s = localStorage.getItem("nagare_pomo");
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

function saveStorage(data: Record<string, unknown>) {
  try {
    localStorage.setItem("nagare_pomo", JSON.stringify(data));
  } catch {}
}

function ProgressRing({ progress, color, size = 56 }: { progress: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={4} strokeLinecap="round"
        strokeDasharray={circ}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
    </svg>
  );
}

function AdjBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 24, height: 24, borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.05)",
        color: "rgba(255,255,255,0.55)",
        fontSize: 15, cursor: disabled ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: disabled ? 0.25 : 1, transition: "all 0.15s",
        fontFamily: "inherit", lineHeight: 1,
      }}
    >{children}</button>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} style={{
      position: "relative", width: 30, height: 17,
      background: on ? "rgba(167,139,250,0.35)" : "rgba(255,255,255,0.08)",
      borderRadius: 9,
      border: on ? "1px solid rgba(167,139,250,0.4)" : "1px solid rgba(255,255,255,0.1)",
      cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: 2, left: on ? 14 : 2,
        width: 11, height: 11, borderRadius: "50%",
        background: on ? "#A78BFA" : "rgba(255,255,255,0.35)",
        transition: "all 0.2s",
      }} />
    </div>
  );
}

function SessionDots({ done, active }: { done: number; active: boolean }) {
  return (
    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{
          width: 5, height: 5, borderRadius: "50%",
          background: i < done ? FOCUS_COLOR : i === done && active ? "rgba(78,205,196,0.4)" : "rgba(255,255,255,0.1)",
          border: i <= done ? "1px solid rgba(78,205,196,0.45)" : "1px solid rgba(255,255,255,0.12)",
          boxShadow: i < done ? "0 0 4px rgba(78,205,196,0.35)" : "none",
          transition: "all 0.3s",
        }} />
      ))}
    </div>
  );
}

export default function FocusBeacon() {
  const stored = loadStorage();

  const [expanded, setExpanded] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [focusMins, setFocusMins] = useState<number>(stored.focusMins ?? 25);
  const [breakMins, setBreakMins] = useState<number>(stored.breakMins ?? 5);
  const [shortBreakOn, setShortBreakOn] = useState<boolean>(stored.shortBreakOn ?? false);
  const [sessionsDone, setSessionsDone] = useState<number>(stored.sessionsDone ?? 0);
  const [secondsLeft, setSecondsLeft] = useState((stored.focusMins ?? 25) * 60);
  const [totalSeconds, setTotalSeconds] = useState((stored.focusMins ?? 25) * 60);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRunning = phase === "focus" || phase === "break";
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;
  const activeColor = mode === "focus" ? FOCUS_COLOR : BREAK_COLOR;

  useEffect(() => {
    saveStorage({ focusMins, breakMins, shortBreakOn, sessionsDone });
  }, [focusMins, breakMins, shortBreakOn, sessionsDone]);

  useEffect(() => {
    if (!isRunning) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          if (phase === "focus") {
            setSessionsDone((d) => Math.min(d + 1, 4));
            setPhase("complete");
            if (shortBreakOn) setTimeout(() => startBreakAuto(), 1200);
          } else {
            setPhase("idle");
            setMode("focus");
            setSecondsLeft(focusMins * 60);
            setTotalSeconds(focusMins * 60);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [isRunning, phase, shortBreakOn]);

  function startBreakAuto() {
    const secs = breakMins * 60;
    setMode("break"); setTotalSeconds(secs); setSecondsLeft(secs); setPhase("break");
  }

  const handleStartStop = useCallback(() => {
    if (phase === "complete") {
      setPhase("idle"); setMode("focus");
      setSecondsLeft(focusMins * 60); setTotalSeconds(focusMins * 60);
      return;
    }
    if (isRunning) {
      clearInterval(timerRef.current!); setPhase("idle");
    } else {
      const mins = mode === "focus" ? focusMins : breakMins;
      const secs = mins * 60;
      if (secondsLeft === 0 || secondsLeft === totalSeconds) {
        setTotalSeconds(secs); setSecondsLeft(secs);
      }
      setPhase(mode);
    }
  }, [phase, isRunning, mode, focusMins, breakMins, secondsLeft, totalSeconds]);

  const handleReset = useCallback(() => {
    clearInterval(timerRef.current!); setPhase("idle");
    const mins = mode === "focus" ? focusMins : breakMins;
    setSecondsLeft(mins * 60); setTotalSeconds(mins * 60);
  }, [mode, focusMins, breakMins]);

  const switchMode = useCallback((m: "focus" | "break") => {
    if (isRunning) return;
    setMode(m); setPhase("idle");
    const mins = m === "focus" ? focusMins : breakMins;
    setSecondsLeft(mins * 60); setTotalSeconds(mins * 60);
  }, [isRunning, focusMins, breakMins]);

  const adjustTime = useCallback((delta: number) => {
    if (isRunning) return;
    if (mode === "focus") {
      const next = Math.max(5, Math.min(90, focusMins + delta));
      setFocusMins(next); setSecondsLeft(next * 60); setTotalSeconds(next * 60);
    } else {
      const next = Math.max(1, Math.min(30, breakMins + delta));
      setBreakMins(next); setSecondsLeft(next * 60); setTotalSeconds(next * 60);
    }
  }, [isRunning, mode, focusMins, breakMins]);

  const currentMins = mode === "focus" ? focusMins : breakMins;
  const startLabel = phase === "complete" ? "↺ New Session"
    : isRunning ? "⏸ Pause"
    : phase === "idle" && secondsLeft < totalSeconds ? "▶ Resume"
    : mode === "focus" ? "▶ Begin Flow" : "▶ Start Break";

  const orbLabel = isRunning ? fmtTime(secondsLeft) : phase === "complete" ? "✦" : "Flow";

  return (
    <div style={{ position: "relative", zIndex: 50 }}>
      {/* Orb — matches the schedule button style */}
      <div className="flex flex-col items-center gap-1.5">
        <motion.button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label="Focus Beacon"
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            position: "relative",
            background: isRunning
              ? `radial-gradient(circle at 35% 35%, ${activeColor}30, rgba(15,10,30,0.6))`
              : "linear-gradient(135deg, rgba(167,139,250,0.22) 0%, rgba(96,165,250,0.18) 50%, rgba(78,205,196,0.15) 100%)",
            border: isRunning
              ? `1.5px solid ${activeColor}60`
              : "1.5px solid rgba(201,182,255,0.35)",
            backdropFilter: "blur(12px)",
            overflow: "hidden",
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          animate={isRunning
            ? { boxShadow: [`0 0 12px ${activeColor}40`, `0 0 22px ${activeColor}60`, `0 0 12px ${activeColor}40`] }
            : { y: [0, -4, 0] }
          }
          transition={isRunning
            ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
            : { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }
        >
          {/* orb reflection */}
          <div style={{
            position: "absolute", top: "10%", left: "18%",
            width: "28%", height: "32%", borderRadius: "50%",
            background: "rgba(255,255,255,0.15)", filter: "blur(2px)", pointerEvents: "none",
          }} />

          {isRunning && (
            <div style={{ position: "absolute", inset: 0 }}>
              <ProgressRing progress={progress} color={activeColor} size={56} />
            </div>
          )}

          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <span style={{
              fontSize: isRunning ? 10 : 12, fontWeight: 500,
              color: isRunning ? activeColor : "rgba(201,182,255,0.88)",
              letterSpacing: isRunning ? "0.02em" : 0, lineHeight: 1,
              fontFamily: "sans-serif",
            }}>
              {orbLabel}
            </span>
            {isRunning && (
              <span style={{ fontSize: 7, color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em", fontFamily: "sans-serif" }}>
                {mode}
              </span>
            )}
          </div>
        </motion.button>
        <span className="text-xs text-ink-soft">Focus</span>
      </div>

      {/* Panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.88, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -6 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            style={{
              position: "absolute",
              top: 74,
              right: 0,
              width: 288,
              borderRadius: 22,
              border: "1px solid rgba(255,255,255,0.09)",
              background: "linear-gradient(180deg, rgba(13,18,37,0.97) 0%, rgba(7,11,24,0.99) 100%)",
              backdropFilter: "blur(28px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)",
              overflow: "hidden",
              fontFamily: "inherit",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "16px 18px 12px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: 14, fontStyle: "italic", color: "rgba(248,245,255,0.9)", fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.01em" }}>
                  Focus Beacon
                </div>
                <div style={{ fontSize: 9, color: "rgba(167,139,250,0.55)", fontFamily: "sans-serif", letterSpacing: "0.07em", marginTop: 2 }}>
                  ポモドーロ
                </div>
              </div>
              {/* Mode pill */}
              <div style={{
                display: "flex", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: 3, gap: 2,
              }}>
                {(["focus", "break"] as const).map((m) => (
                  <button key={m} onClick={() => switchMode(m)} style={{
                    fontFamily: "sans-serif", fontSize: 9, padding: "3px 9px", borderRadius: 14,
                    border: mode === m ? "1px solid rgba(124,111,205,0.28)" : "none",
                    cursor: isRunning ? "default" : "pointer",
                    background: mode === m ? "rgba(124,111,205,0.22)" : "transparent",
                    color: mode === m ? "#A78BFA" : "rgba(255,255,255,0.3)",
                    transition: "all 0.2s", letterSpacing: "0.05em",
                    opacity: isRunning ? 0.5 : 1,
                  }}>
                    {m === "focus" ? "Focus" : "Break"}
                  </button>
                ))}
              </div>
            </div>

            {/* Timer */}
            <div style={{
              padding: "20px 18px 14px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            }}>
              <div style={{ position: "relative", width: 128, height: 128, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ProgressRing progress={progress} color={activeColor} size={128} />
                <div style={{ position: "absolute", textAlign: "center" }}>
                  <div style={{
                    fontSize: 28, fontWeight: 300, color: "rgba(248,245,255,0.95)",
                    fontFamily: "sans-serif", letterSpacing: "-0.02em",
                    fontVariantNumeric: "tabular-nums", lineHeight: 1,
                  }}>
                    {phase === "complete" ? "✦" : fmtTime(secondsLeft)}
                  </div>
                  <div style={{ fontSize: 9, color: activeColor, letterSpacing: "0.1em", marginTop: 4, fontFamily: "sans-serif", textTransform: "uppercase" }}>
                    {phase === "complete" ? "Complete" : mode === "focus" ? "Focus" : "Break"}
                  </div>
                </div>
              </div>

              {/* +/- adjuster */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
                <AdjBtn onClick={() => adjustTime(-5)} disabled={isRunning}>−</AdjBtn>
                <span style={{
                  fontSize: 12, color: "rgba(255,255,255,0.28)", fontFamily: "sans-serif",
                  letterSpacing: "0.08em", textTransform: "uppercase", minWidth: 38, textAlign: "center",
                }}>
                  {currentMins} min
                </span>
                <AdjBtn onClick={() => adjustTime(5)} disabled={isRunning}>+</AdjBtn>
              </div>

              {/* Phase text */}
              <div style={{ fontSize: 11, fontStyle: "italic", color: "rgba(167,139,250,0.55)", fontFamily: "'DM Serif Display', serif" }}>
                {phase === "complete" ? "This moment is preserved."
                  : isRunning ? (mode === "focus" ? "In flow..." : "Resting...")
                  : mode === "focus" ? "Set your intention, begin flow."
                  : "Rest. Let the mind breathe."}
              </div>
            </div>

            {/* Session dots */}
            <div style={{ paddingBottom: 12 }}>
              <SessionDots done={sessionsDone % 4} active={isRunning && mode === "focus"} />
            </div>

            {/* Short break toggle */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "9px 18px", borderTop: "1px solid rgba(255,255,255,0.05)",
            }}>
              <span style={{ fontSize: 9, fontFamily: "sans-serif", color: "rgba(255,255,255,0.28)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Short break after focus
              </span>
              <Toggle on={shortBreakOn} onToggle={() => setShortBreakOn((v) => !v)} />
            </div>

            {/* Footer */}
            <div style={{ padding: "12px 18px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 7 }}>
              <button onClick={handleStartStop} style={{
                flex: 1, padding: "9px", borderRadius: 11,
                border: "1px solid rgba(78,205,196,0.25)",
                background: "rgba(78,205,196,0.1)", color: FOCUS_COLOR,
                fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 500, transition: "all 0.15s",
              }}>
                {startLabel}
              </button>
              <button onClick={handleReset} style={{
                padding: "9px 13px", borderRadius: 11,
                border: "1px solid rgba(255,139,107,0.18)",
                background: "rgba(255,139,107,0.07)", color: "#FF8B6B",
                fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 500, transition: "all 0.15s",
              }}>
                ↺
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
