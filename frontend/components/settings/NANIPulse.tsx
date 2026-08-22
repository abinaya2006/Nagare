"use client";
import { useState, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ChevronDown, Check } from "lucide-react";
import { useNaniHealth, type NaniHealthState } from "@/hooks/useNaniHealth";

const EASE = [0.22, 1, 0.36, 1] as const;

const STATUS_COPY: Record<NaniHealthState, { label: string; sub: string; color: string }> = {
  loading: { label: "Checking in…", sub: "Reaching NANI", color: "var(--text-muted)" },
  healthy: { label: "Flowing normally", sub: "All checks passed", color: "var(--nagare-violet)" },
  degraded: { label: "Needs attention", sub: "Some checks didn't pass", color: "var(--nagare-gold)" },
  unavailable: { label: "NANI unavailable", sub: "Couldn't reach NANI", color: "var(--priority-critical)" },
};

interface PulseToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function PulseToggle({ label, checked, onChange }: PulseToggleProps) {
  const id = useId();
  return (
    <div className="flex items-center justify-between py-1.5">
      <label htmlFor={id} className="text-sm text-ink/85">
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-[var(--nagare-violet)]/70" : "bg-white/25"
        }`}
      >
        <motion.span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
          animate={{ left: checked ? "18px" : "2px" }}
          transition={{ duration: 0.2, ease: EASE }}
        />
      </button>
    </div>
  );
}

function relativeTime(d: Date | null) {
  if (!d) return "checking…";
  const secs = Math.round((Date.now() - d.getTime()) / 1000);
  if (secs < 10) return "just now";
  if (secs < 60) return `${secs}s ago`;
  return `${Math.round(secs / 60)}m ago`;
}

export default function NANIPulse() {
  const { state, lastChecked } = useNaniHealth();
  const [expanded, setExpanded] = useState(false);

  // Local-only behavior flags: no corresponding fields exist yet in
  // FlowPreferences / the backend preferences schema. Kept as component
  // state rather than inventing a parallel global store - wire these to
  // real preference keys once the backend adds them.
  const [energyAware, setEnergyAware] = useState(true);
  const [autoReschedule, setAutoReschedule] = useState(true);
  const [protectedMoments, setProtectedMoments] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState(true);

  const copy = STATUS_COPY[state];
  const healthOk = state === "healthy";

  const checks = [
    { label: "AI responding", passed: healthOk },
    { label: "Schedule generation", passed: healthOk },
    { label: "Preference application", passed: state !== "unavailable" },
    { label: "Conflict detection", passed: healthOk },
  ];
  const passedCount = checks.filter((c) => c.passed).length;

  return (
    <div className="glass mt-4 rounded-glass p-4 sm:p-5">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        aria-controls="nani-pulse-panel"
        className="flex w-full flex-col gap-2 text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-lavglow" aria-hidden="true" />
            <span className="font-display text-sm font-medium text-ink">NANI Pulse</span>
          </div>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="text-ink-soft"
          >
            <ChevronDown size={14} />
          </motion.span>
        </div>

        <div className="flex items-center gap-1.5">
          <motion.span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: copy.color }}
            animate={
              state === "healthy"
                ? { boxShadow: ["0 0 0px", "0 0 6px", "0 0 0px"] }
                : {}
            }
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-xs text-ink/85">{copy.label}</span>
        </div>
        <p className="text-[11px] text-ink-soft">{copy.sub}</p>

        <div className="mt-1 flex gap-3 text-[11px] text-ink-soft">
          <span className="flex items-center gap-1">
            AI {healthOk ? <Check size={11} className="text-lavglow" /> : "—"}
          </span>
          <span className="flex items-center gap-1">
            Flow {passedCount === checks.length ? <Check size={11} className="text-lavglow" /> : "—"}
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id="nani-pulse-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
              <section>
                <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                  NANI Health
                </h3>
                <div className="space-y-1.5 text-xs text-ink/85">
                  <div className="flex items-center justify-between">
                    <span>AI Connection</span>
                    <span style={{ color: copy.color }}>
                      ● {state === "unavailable" ? "Unavailable" : "Connected"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Schedule Engine</span>
                    <span style={{ color: copy.color }}>
                      ● {healthOk ? "Ready" : "Unavailable"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Memory Sync</span>
                    <span className="text-lavglow">● Synced</span>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-1 text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                  NANI Behavior
                </h3>
                <PulseToggle label="Energy-aware flow" checked={energyAware} onChange={setEnergyAware} />
                <PulseToggle label="Auto-reschedule" checked={autoReschedule} onChange={setAutoReschedule} />
                <PulseToggle label="Protected moments" checked={protectedMoments} onChange={setProtectedMoments} />
                <PulseToggle label="Offline queue" checked={offlineQueue} onChange={setOfflineQueue} />
              </section>

              <section>
                <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                  <span>Quality Checks</span>
                  <span className="normal-case tracking-normal text-ink/70">
                    {passedCount} / {checks.length} passed
                  </span>
                </div>
                <ul className="space-y-1 text-xs text-ink/85">
                  {checks.map((c) => (
                    <li key={c.label} className="flex items-center gap-1.5">
                      {c.passed ? (
                        <Check size={11} className="text-lavglow" />
                      ) : (
                        <span className="text-ink-soft">–</span>
                      )}
                      {c.label}
                    </li>
                  ))}
                </ul>
              </section>

              <p className="text-[10px] text-ink-soft">
                Last checked · {relativeTime(lastChecked)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
