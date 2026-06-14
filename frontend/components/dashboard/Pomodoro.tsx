"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "idle" | "focus" | "break" | "complete";

const TEXT = "#2F3142";
const TEXT_SOFT = "#6D7088";

function fmtTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function loadStorage(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    const s = localStorage.getItem("nagare_pomo");
    return s ? (JSON.parse(s) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function saveStorage(data: Record<string, unknown>) {
  try { localStorage.setItem("nagare_pomo", JSON.stringify(data)); } catch {}
}

// ── Flow Ring ────────────────────────────────────────────────────────────────

function FlowRing({ progress, size = 148 }: { progress: number; size?: number }) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);
  const uid = `fg-${size}`;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <defs>
        <linearGradient id={uid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DDEEFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#E8E1FF" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(232,225,255,0.3)" strokeWidth={7} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={`url(#${uid})`} strokeWidth={7} strokeLinecap="round"
        strokeDasharray={circ}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeInOut" }}
        style={{ filter: "drop-shadow(0 0 8px rgba(200,220,255,0.5))" }}
      />
    </svg>
  );
}

// ── Gold Particles ───────────────────────────────────────────────────────────

function GoldParticles() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", borderRadius: "50%" }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
          animate={{ opacity: [0, 0.9, 0], y: [0, -50 - Math.random() * 40], x: [(Math.random() - 0.5) * 70], scale: [0, 1, 0.4] }}
          transition={{ duration: 2 + Math.random() * 1.5, delay: Math.random() * 0.8, repeat: Infinity, repeatDelay: Math.random() * 2 }}
          style={{
            position: "absolute", bottom: "30%", left: `${20 + Math.random() * 60}%`,
            width: 4 + Math.random() * 3, height: 4 + Math.random() * 3, borderRadius: "50%",
            background: i % 3 === 0 ? "#F5C842" : i % 3 === 1 ? "#FFE8D6" : "#FFF4C7",
          }}
        />
      ))}
    </div>
  );
}

// ── Orb Particles ────────────────────────────────────────────────────────────

function OrbParticles({ color }: { color: string }) {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div key={i} animate={{ rotate: [0, 360] }}
          transition={{ duration: 3 + i * 0.8, repeat: Infinity, ease: "linear" }}
          style={{ position: "absolute", inset: -4 - i * 3, borderRadius: "50%" }}
        >
          <div style={{
            position: "absolute", width: 4, height: 4, borderRadius: "50%",
            background: color, opacity: 0.6 - i * 0.1, top: "10%", left: "50%",
            transform: "translateX(-50%)", boxShadow: `0 0 4px ${color}`,
          }} />
        </motion.div>
      ))}
    </>
  );
}

// ── Adj Button ───────────────────────────────────────────────────────────────

function AdjBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: 28, height: 28, borderRadius: "50%",
      border: "1px solid rgba(174,166,219,0.35)", background: "rgba(232,225,255,0.5)",
      color: TEXT_SOFT, fontSize: 16, cursor: disabled ? "default" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: disabled ? 0.3 : 1, transition: "all 0.15s", fontFamily: "inherit", lineHeight: 1,
    }}>{children}</button>
  );
}

// ── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} style={{
      position: "relative", width: 32, height: 18,
      background: on ? "rgba(174,166,219,0.45)" : "rgba(200,196,220,0.25)",
      borderRadius: 9, border: on ? "1px solid rgba(174,166,219,0.5)" : "1px solid rgba(200,196,220,0.35)",
      cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: 2, left: on ? 14 : 2, width: 12, height: 12,
        borderRadius: "50%", background: on ? "#8B7FCC" : "rgba(150,145,180,0.5)", transition: "all 0.2s",
      }} />
    </div>
  );
}

// ── Session Dots ─────────────────────────────────────────────────────────────

function SessionDots({ done, active }: { done: number; active: boolean }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div key={i}
          animate={i === done && active ? { scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: i < done ? 8 : 6, height: i < done ? 8 : 6, borderRadius: "50%",
            background: i < done ? "#B8A9E8" : i === done && active ? "rgba(184,169,232,0.5)" : "rgba(200,196,220,0.3)",
            border: i < done ? "1px solid rgba(174,166,219,0.6)" : "1px solid rgba(200,196,220,0.3)",
            transition: "all 0.3s",
          }}
        />
      ))}
    </div>
  );
}

// ── Portal Modal ─────────────────────────────────────────────────────────────

function PomoModal({
  phase, mode, progress, secondsLeft, totalSeconds, currentMins,
  isRunning, shortBreakOn, sessionsDone, startLabel,
  onClose, onStartStop, onReset, onSwitchMode, onAdjust, onToggleBreak,
}: {
  phase: Phase; mode: "focus" | "break"; progress: number;
  secondsLeft: number; totalSeconds: number; currentMins: number;
  isRunning: boolean; shortBreakOn: boolean; sessionsDone: number; startLabel: string;
  onClose: () => void; onStartStop: () => void; onReset: () => void;
  onSwitchMode: (m: "focus" | "break") => void; onAdjust: (d: number) => void;
  onToggleBreak: () => void;
}) {
  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        key="pomo-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9998,
          background: "rgba(220,215,245,0.35)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />

      {/* Centering shell — framer never touches this transform */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
      {/* Panel */}
      <motion.div
        key="pomo-panel"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        style={{
          pointerEvents: "auto",
          width: "min(340px, 92vw)",
          maxHeight: "90dvh",
          overflowY: "auto",
          borderRadius: 28,
          border: "1px solid rgba(232,225,255,0.7)",
          background: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          boxShadow: "0 12px 60px rgba(174,166,219,0.22), 0 2px 16px rgba(174,166,219,0.12), inset 0 1px 0 rgba(255,255,255,0.95)",
          fontFamily: "inherit",
        }}
      >
        {/* Glass sheen */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none",
          background: "linear-gradient(155deg, rgba(232,225,255,0.2) 0%, rgba(221,238,255,0.14) 50%, rgba(255,244,199,0.08) 100%)",
        }} />
        <div style={{
          position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>

          {/* Header */}
          <div style={{
            padding: "18px 20px 14px", borderBottom: "1px solid rgba(232,225,255,0.45)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: 15, fontStyle: "italic", color: TEXT, fontFamily: "'DM Serif Display', Georgia, serif", letterSpacing: "-0.01em" }}>
                Focus Beacon
              </div>
              <div style={{ fontSize: 9, color: TEXT_SOFT, fontFamily: "sans-serif", letterSpacing: "0.09em", marginTop: 2 }}>
                ポモドーロ
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Mode pill */}
              <div style={{
                display: "flex", background: "rgba(232,225,255,0.45)",
                border: "1px solid rgba(200,196,220,0.35)", borderRadius: 18, padding: 3, gap: 2,
              }}>
                {(["focus", "break"] as const).map((m) => (
                  <button key={m} onClick={() => onSwitchMode(m)} style={{
                    fontFamily: "sans-serif", fontSize: 10, padding: "3px 10px", borderRadius: 14,
                    border: mode === m ? "1px solid rgba(174,166,219,0.45)" : "none",
                    cursor: isRunning ? "default" : "pointer",
                    background: mode === m ? "rgba(255,255,255,0.85)" : "transparent",
                    color: mode === m ? "#6B5FBB" : TEXT_SOFT,
                    transition: "all 0.2s", letterSpacing: "0.04em",
                    opacity: isRunning ? 0.5 : 1, fontWeight: mode === m ? 500 : 400,
                  }}>{m === "focus" ? "Focus" : "Break"}</button>
                ))}
              </div>
              {/* Close */}
              <button onClick={onClose} style={{
                width: 24, height: 24, borderRadius: "50%",
                border: "1px solid rgba(200,196,220,0.35)", background: "rgba(232,225,255,0.4)",
                color: TEXT_SOFT, fontSize: 13, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit",
              }}>✕</button>
            </div>
          </div>

          {/* Timer */}
          <div style={{ padding: "24px 20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            {phase === "complete" ? (
              <div style={{ position: "relative", width: 148, height: 148 }}>
                <GoldParticles />
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    width: "100%", height: "100%", borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(255,244,199,0.95) 0%, rgba(255,232,214,0.75) 100%)",
                    border: "1px solid rgba(240,200,120,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexDirection: "column", gap: 4,
                    boxShadow: "0 0 32px rgba(245,200,66,0.12)",
                  }}
                >
                  <span style={{ fontSize: 32 }}>✦</span>
                  <span style={{ fontSize: 10, color: "#C4922A", fontFamily: "sans-serif", letterSpacing: "0.06em" }}>complete</span>
                </motion.div>
              </div>
            ) : (
              <div style={{ position: "relative", width: 148, height: 148, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FlowRing progress={progress} size={148} />
                <div style={{ position: "absolute", textAlign: "center" }}>
                  <div style={{
                    fontSize: 30, fontWeight: 300, color: TEXT,
                    fontFamily: "sans-serif", letterSpacing: "-0.02em",
                    fontVariantNumeric: "tabular-nums", lineHeight: 1,
                  }}>{fmtTime(secondsLeft)}</div>
                  <div style={{ fontSize: 9, color: TEXT_SOFT, letterSpacing: "0.1em", marginTop: 5, fontFamily: "sans-serif", textTransform: "uppercase" }}>
                    {mode}
                  </div>
                </div>
              </div>
            )}

            {/* +/- adjuster */}
            {phase !== "complete" && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 2 }}>
                <AdjBtn onClick={() => onAdjust(-5)} disabled={isRunning}>−</AdjBtn>
                <span style={{ fontSize: 12, color: TEXT_SOFT, fontFamily: "sans-serif", letterSpacing: "0.06em", minWidth: 42, textAlign: "center" }}>
                  {currentMins} min
                </span>
                <AdjBtn onClick={() => onAdjust(5)} disabled={isRunning}>+</AdjBtn>
              </div>
            )}

            {/* Phase text */}
            <div style={{ fontSize: 12, fontStyle: "italic", color: TEXT_SOFT, fontFamily: "'DM Serif Display', Georgia, serif", textAlign: "center", padding: "0 8px" }}>
              {phase === "complete" ? "This moment has been preserved."
                : isRunning ? (mode === "focus" ? "In flow…" : "Resting…")
                : mode === "focus" ? "Set your intention, begin flow."
                : "Rest. Let the mind breathe."}
            </div>
          </div>

          {/* Session dots */}
          <div style={{ paddingBottom: 14 }}>
            <SessionDots done={sessionsDone % 4} active={isRunning && mode === "focus"} />
          </div>

          {/* Short break toggle */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 20px", borderTop: "1px solid rgba(232,225,255,0.45)",
          }}>
            <span style={{ fontSize: 10, fontFamily: "sans-serif", color: TEXT_SOFT, letterSpacing: "0.06em" }}>
              Short break after focus
            </span>
            <Toggle on={shortBreakOn} onToggle={onToggleBreak} />
          </div>

          {/* Footer */}
          <div style={{ padding: "12px 20px 18px", borderTop: "1px solid rgba(232,225,255,0.45)", display: "flex", gap: 8 }}>
            <motion.button onClick={onStartStop} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{
              flex: 1, padding: "11px", borderRadius: 14,
              border: "1px solid rgba(174,208,240,0.55)",
              background: "linear-gradient(135deg, rgba(221,238,255,0.85) 0%, rgba(232,225,255,0.75) 100%)",
              color: "#4A6FA5", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
            }}>{startLabel}</motion.button>
            <motion.button onClick={onReset} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{
              padding: "11px 14px", borderRadius: 14,
              border: "1px solid rgba(200,196,220,0.4)", background: "rgba(232,225,255,0.4)",
              color: TEXT_SOFT, fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.75)",
            }}>↺</motion.button>
          </div>

        </div>
      </motion.div>
      </div>
    </>,
    document.body
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FOCUS BEACON
// ══════════════════════════════════════════════════════════════════════════════

export default function FocusBeacon() {
  const stored = loadStorage();

  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [focusMins, setFocusMins] = useState<number>((stored.focusMins as number) ?? 25);
  const [breakMins, setBreakMins] = useState<number>((stored.breakMins as number) ?? 5);
  const [shortBreakOn, setShortBreakOn] = useState<boolean>((stored.shortBreakOn as boolean) ?? false);
  const [sessionsDone, setSessionsDone] = useState<number>((stored.sessionsDone as number) ?? 0);
  const [secondsLeft, setSecondsLeft] = useState(((stored.focusMins as number) ?? 25) * 60);
  const [totalSeconds, setTotalSeconds] = useState(((stored.focusMins as number) ?? 25) * 60);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRunning = phase === "focus" || phase === "break";
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    saveStorage({ focusMins, breakMins, shortBreakOn, sessionsDone });
  }, [focusMins, breakMins, shortBreakOn, sessionsDone]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setExpanded(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          if (phase === "focus") {
            setSessionsDone((d) => Math.min(d + 1, 4));
            setPhase("complete");
            if (shortBreakOn) setTimeout(() => {
              const secs = breakMins * 60;
              setMode("break"); setTotalSeconds(secs); setSecondsLeft(secs); setPhase("break");
            }, 1400);
          } else {
            setPhase("idle"); setMode("focus");
            setSecondsLeft(focusMins * 60); setTotalSeconds(focusMins * 60);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [isRunning, phase, shortBreakOn, breakMins, focusMins]);

  const handleStartStop = useCallback(() => {
    if (phase === "complete") {
      setPhase("idle"); setMode("focus");
      setSecondsLeft(focusMins * 60); setTotalSeconds(focusMins * 60); return;
    }
    if (isRunning) { clearInterval(timerRef.current!); setPhase("idle"); }
    else {
      const mins = mode === "focus" ? focusMins : breakMins;
      const secs = mins * 60;
      if (secondsLeft === 0 || secondsLeft === totalSeconds) { setTotalSeconds(secs); setSecondsLeft(secs); }
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
  const startLabel = phase === "complete" ? "↺ New session"
    : isRunning ? "⏸ Pause"
    : phase === "idle" && secondsLeft < totalSeconds && secondsLeft > 0 ? "▶ Resume"
    : mode === "focus" ? "▶ Begin flow" : "▶ Start break";

  const orbBg = isRunning
    ? mode === "focus"
      ? "radial-gradient(circle at 35% 30%, rgba(221,238,255,0.95) 0%, rgba(232,225,255,0.85) 60%, rgba(255,248,235,0.7) 100%)"
      : "radial-gradient(circle at 35% 30%, rgba(232,225,255,0.95) 0%, rgba(255,232,214,0.8) 100%)"
    : phase === "complete"
    ? "radial-gradient(circle at 35% 30%, rgba(255,244,199,0.95) 0%, rgba(255,232,214,0.85) 100%)"
    : "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.92) 0%, rgba(232,225,255,0.75) 60%, rgba(221,238,255,0.65) 100%)";

  return (
    <div style={{ position: "relative" }}>
      {/* Orb */}
      <div className="flex flex-col items-center gap-1.5">
        <motion.button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label="Focus Beacon"
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            position: "relative", background: orbBg, overflow: "visible",
            border: isRunning
              ? mode === "focus" ? "1.5px solid rgba(174,208,240,0.65)" : "1.5px solid rgba(200,185,240,0.65)"
              : phase === "complete" ? "1.5px solid rgba(240,200,120,0.5)" : "1.5px solid rgba(200,196,220,0.5)",
            boxShadow: "0 2px 14px rgba(200,196,220,0.22)",
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          animate={isRunning
            ? { boxShadow: ["0 0 0 0px rgba(221,238,255,0.5)", "0 0 0 8px rgba(221,238,255,0.12)", "0 0 0 0px rgba(221,238,255,0.5)"] }
            : { y: [0, -4, 0] }
          }
          transition={isRunning
            ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
            : { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }
        >
          {/* highlight */}
          <div style={{ position: "absolute", top: "10%", left: "18%", width: "28%", height: "32%", borderRadius: "50%", background: "rgba(255,255,255,0.75)", filter: "blur(2px)", pointerEvents: "none" }} />

          {isRunning && <OrbParticles color={mode === "focus" ? "rgba(174,208,240,0.85)" : "rgba(184,169,232,0.85)"} />}

          {isRunning && (
            <div style={{ position: "absolute", inset: -3 }}>
              <FlowRing progress={progress} size={62} />
            </div>
          )}

          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <span style={{
              fontSize: isRunning ? 9 : 11, fontWeight: 500,
              color: isRunning ? (mode === "focus" ? "#5A8FBF" : "#8B7FCC") : phase === "complete" ? "#C4922A" : TEXT_SOFT,
              letterSpacing: isRunning ? "0.02em" : 0, lineHeight: 1, fontFamily: "sans-serif",
            }}>
              {isRunning ? fmtTime(secondsLeft) : phase === "complete" ? "✦" : "Flow"}
            </span>
            {isRunning && (
              <span style={{ fontSize: 7, color: TEXT_SOFT, letterSpacing: "0.06em", fontFamily: "sans-serif", opacity: 0.6 }}>
                {mode}
              </span>
            )}
          </div>
        </motion.button>
        <span className="text-xs text-ink-soft">Focus</span>
      </div>

      {/* Portal modal */}
      {mounted && (
        <AnimatePresence>
          {expanded && (
            <PomoModal
              phase={phase} mode={mode} progress={progress}
              secondsLeft={secondsLeft} totalSeconds={totalSeconds} currentMins={currentMins}
              isRunning={isRunning} shortBreakOn={shortBreakOn} sessionsDone={sessionsDone}
              startLabel={startLabel}
              onClose={() => setExpanded(false)}
              onStartStop={handleStartStop}
              onReset={handleReset}
              onSwitchMode={switchMode}
              onAdjust={adjustTime}
              onToggleBreak={() => setShortBreakOn((v) => !v)}
            />
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
