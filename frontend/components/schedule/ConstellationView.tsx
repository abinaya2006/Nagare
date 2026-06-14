"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task } from "@/types/task";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConstellationViewProps {
  tasks: Task[];
  isLoading?: boolean;
  onTaskSelect: (id: string) => void;
}

interface StarNode {
  id: string;
  task: Task;
  /** 0-1 normalised position on the canvas */
  nx: number;
  ny: number;
  /** actual canvas pixels (computed per render) */
  x: number;
  y: number;
  /** drift offsets for parallax */
  dx: number;
  dy: number;
  /** gentle float phase */
  phase: number;
  radius: number;
  group: ConstellationGroup;
}

interface ConstellationGroup {
  id: string;
  name: string;
  label: string;
  color: string;
  glowColor: string;
  /** normalised centroid */
  cx: number;
  cy: number;
}

// ─── Constellation definitions ────────────────────────────────────────────────

const CONSTELLATION_DEFS: ConstellationGroup[] = [
  {
    id: "scholar",
    name: "study",
    label: "The Scholar",
    color: "#a78bfa",
    glowColor: "rgba(167,139,250,0.55)",
    cx: 0.22,
    cy: 0.28,
  },
  {
    id: "builder",
    name: "project",
    label: "The Builder",
    color: "#60a5fa",
    glowColor: "rgba(96,165,250,0.55)",
    cx: 0.72,
    cy: 0.25,
  },
  {
    id: "dreamer",
    name: "creative",
    label: "The Dreamer",
    color: "#f9a8d4",
    glowColor: "rgba(249,168,212,0.55)",
    cx: 0.5,
    cy: 0.62,
  },
  {
    id: "explorer",
    name: "exploration",
    label: "The Explorer",
    color: "#34d399",
    glowColor: "rgba(52,211,153,0.55)",
    cx: 0.2,
    cy: 0.72,
  },
  {
    id: "guardian",
    name: "habit",
    label: "The Guardian",
    color: "#fbbf24",
    glowColor: "rgba(251,191,36,0.55)",
    cx: 0.78,
    cy: 0.7,
  },
];

// ─── Category → constellation mapping ────────────────────────────────────────

function getGroup(task: Task): ConstellationGroup {
  const cat = (task.category ?? "").toLowerCase();
  if (
    cat.includes("study") ||
    cat.includes("learn") ||
    cat.includes("dbms") ||
    cat.includes("dsa")
  )
    return CONSTELLATION_DEFS[0];
  if (
    cat.includes("project") ||
    cat.includes("build") ||
    cat.includes("code") ||
    cat.includes("auth") ||
    cat.includes("hack")
  )
    return CONSTELLATION_DEFS[1];
  if (
    cat.includes("creat") ||
    cat.includes("design") ||
    cat.includes("art") ||
    cat.includes("write")
  )
    return CONSTELLATION_DEFS[2];
  if (cat.includes("explor") || cat.includes("research"))
    return CONSTELLATION_DEFS[3];
  if (
    cat.includes("habit") ||
    cat.includes("routine") ||
    cat.includes("exercise") ||
    cat.includes("health")
  )
    return CONSTELLATION_DEFS[4];
  // default: distribute round-robin by task index for variety
  const idx = Math.abs(task.id.charCodeAt(0)) % CONSTELLATION_DEFS.length;
  return CONSTELLATION_DEFS[idx];
}

// ─── Seeded pseudo-random (stable per task id) ───────────────────────────────

function seededRand(seed: string, offset = 0): number {
  let h = offset * 2654435761;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
  }
  return (h >>> 0) / 0xffffffff;
}

// ─── Build star nodes from tasks ─────────────────────────────────────────────

function buildStars(tasks: Task[]): StarNode[] {
  return tasks.map((task, i) => {
    const group = getGroup(task);
    const angle = seededRand(task.id, 1) * Math.PI * 2;
    const radius = 0.09 + seededRand(task.id, 2) * 0.14;
    const nx = Math.max(
      0.06,
      Math.min(0.94, group.cx + Math.cos(angle) * radius),
    );
    const ny = Math.max(
      0.08,
      Math.min(0.88, group.cy + Math.sin(angle) * radius),
    );

    return {
      id: task.id,
      task,
      nx,
      ny,
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      phase: seededRand(task.id, 3) * Math.PI * 2,
      radius: 4 + seededRand(task.id, 4) * 3,
      group,
    };
  });
}

// ─── Priority → star size multiplier ─────────────────────────────────────────

function priorityScale(priority?: string): number {
  if (priority === "critical") return 1.6;
  if (priority === "high") return 1.3;
  if (priority === "medium") return 1.0;
  return 0.8;
}

// ─── State label ─────────────────────────────────────────────────────────────

const STATE_LABEL: Record<string, string> = {
  pending: "Waiting",
  scheduled: "Flowing",
  completed: "Resolved",
  overdue: "Calling",
};

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export default function ConstellationView({
  tasks,
  isLoading,
  onTaskSelect,
}: ConstellationViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const starsRef = useRef<StarNode[]>([]);
  const timeRef = useRef(0);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    star: StarNode;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  // Build stars once when tasks change
  const stars = useMemo(() => buildStars(tasks), [tasks]);

  useEffect(() => {
    starsRef.current = stars.map((s) => ({ ...s }));
  }, [stars]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Canvas draw loop ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw(timestamp: number) {
      if (!canvas || !ctx) return;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      timeRef.current = timestamp * 0.001;
      const t = timeRef.current;

      // Mouse parallax strength
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const parallaxStr = 18;

      // Update star positions
      starsRef.current.forEach((star) => {
        const floatY = Math.sin(t * 0.4 + star.phase) * 3.5;
        const floatX = Math.cos(t * 0.25 + star.phase) * 2;
        star.dx = (mx - 0.5) * -parallaxStr * (star.nx - 0.5);
        star.dy = (my - 0.5) * -parallaxStr * (star.ny - 0.5);
        star.x = star.nx * W + star.dx + floatX;
        star.y = star.ny * H + star.dy + floatY;
      });

      ctx.clearRect(0, 0, W, H);

      // ── Draw constellation outlines (faint boundary arcs) ──────────────
      CONSTELLATION_DEFS.forEach((group) => {
        const groupStars = starsRef.current.filter(
          (s) => s.group.id === group.id,
        );
        if (groupStars.length < 2) return;

        // Draw lines between stars in same group
        for (let i = 0; i < groupStars.length - 1; i++) {
          for (let j = i + 1; j < groupStars.length; j++) {
            const a = groupStars[i];
            const b = groupStars[j];
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            if (dist > W * 0.28) continue; // don't connect distant stars

            const pulse = 0.12 + 0.06 * Math.sin(t * 0.6 + a.phase + b.phase);
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, group.color + "30");
            grad.addColorStop(
              0.5,
              group.color +
                Math.round(pulse * 255)
                  .toString(16)
                  .padStart(2, "0"),
            );
            grad.addColorStop(1, group.color + "30");

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });

      // ── Draw group label (centroid ghost text) ────────────────────────
      CONSTELLATION_DEFS.forEach((group) => {
        const groupStars = starsRef.current.filter(
          (s) => s.group.id === group.id,
        );
        if (groupStars.length === 0) return;

        // Compute actual centroid
        const cx =
          groupStars.reduce((s, st) => s + st.x, 0) / groupStars.length;
        const cy =
          groupStars.reduce((s, st) => s + st.y, 0) / groupStars.length - 28;

        ctx.save();
        ctx.font = "600 10px 'Inter', system-ui, sans-serif";
        ctx.letterSpacing = "0.12em";
        ctx.textAlign = "center";
        ctx.fillStyle = group.color + "55";
        ctx.fillText(group.label.toUpperCase(), cx, cy);
        ctx.restore();
      });

      // ── Draw stars ────────────────────────────────────────────────────
      starsRef.current.forEach((star) => {
        const isHovered = star.id === hoveredId;
        const scale = priorityScale(star.task.priority);
        const r = star.radius * scale;
        const pulse = isHovered
          ? 1.0
          : 0.6 + 0.4 * Math.sin(t * 1.2 + star.phase);

        // Outer glow
        const glowR = r * (isHovered ? 5 : 3.5);
        const glow = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          glowR,
        );
        glow.addColorStop(
          0,
          star.group.color +
            Math.round(pulse * 180)
              .toString(16)
              .padStart(2, "0"),
        );
        glow.addColorStop(1, star.group.color + "00");
        ctx.beginPath();
        ctx.arc(star.x, star.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Star core
        const core = ctx.createRadialGradient(
          star.x - r * 0.3,
          star.y - r * 0.3,
          0,
          star.x,
          star.y,
          r,
        );
        core.addColorStop(0, "#ffffff");
        core.addColorStop(0.4, star.group.color);
        core.addColorStop(1, star.group.color + "aa");
        ctx.beginPath();
        ctx.arc(star.x, star.y, r, 0, Math.PI * 2);
        ctx.fillStyle = core;
        ctx.fill();

        // Hovered ring
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, r + 5, 0, Math.PI * 2);
          ctx.strokeStyle = star.group.color + "cc";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Completed: draw faint cross-through
        if (star.task.state === "completed") {
          ctx.save();
          ctx.globalAlpha = 0.45;
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(star.x - r * 0.7, star.y);
          ctx.lineTo(star.x + r * 0.7, star.y);
          ctx.stroke();
          ctx.restore();
        }
      });

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [hoveredId]);

  // ── Mouse tracking ───────────────────────────────────────────────────────
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouseRef.current = { x, y };

      // Hit-test stars
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      let found: StarNode | null = null;
      for (const star of starsRef.current) {
        const dist = Math.hypot(star.x - px, star.y - py);
        if (dist < star.radius * priorityScale(star.task.priority) * 3.5 + 8) {
          found = star;
          break;
        }
      }
      if (found) {
        setHoveredId(found.id);
        setTooltip({ x: found.x, y: found.y, star: found });
      } else {
        setHoveredId(null);
        setTooltip(null);
      }
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: 0.5, y: 0.5 };
    setHoveredId(null);
    setTooltip(null);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      for (const star of starsRef.current) {
        const dist = Math.hypot(star.x - px, star.y - py);
        if (dist < star.radius * priorityScale(star.task.priority) * 3.5 + 8) {
          onTaskSelect(star.id);
          break;
        }
      }
    },
    [onTaskSelect],
  );

  // ── Empty state ──────────────────────────────────────────────────────────
  const isEmpty = !isLoading && tasks.length === 0;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="cv-root">
      {/* Legend row */}
      <div className="cv-legend">
        {CONSTELLATION_DEFS.map((g) => (
          <div key={g.id} className="cv-legend-item">
            <span
              className="cv-legend-dot"
              style={{ background: g.color, boxShadow: `0 0 6px ${g.color}` }}
            />
            <span className="cv-legend-label">{g.label}</span>
          </div>
        ))}
      </div>

      {/* Canvas sky */}
      <div className="cv-sky">
        {/* Loading shimmer */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="cv-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="cv-loading-orb" />
              <p className="cv-loading-text">The sky is waking…</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        <AnimatePresence>
          {isEmpty && !isLoading && (
            <motion.div
              className="cv-empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="cv-empty-headline">
                The sky awaits your first intention.
              </p>
              <p className="cv-empty-sub">
                Add a thought below and watch your constellation form.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <canvas
          ref={canvasRef}
          className="cv-canvas"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          aria-label="Constellation map of your tasks"
          role="img"
        />

        {/* Tooltip */}
        <AnimatePresence>
          {tooltip && (
            <motion.div
              key={tooltip.star.id}
              className="cv-tooltip"
              style={
                {
                  left: tooltip.x,
                  top: tooltip.y,
                  "--glow": tooltip.star.group.glowColor,
                  borderColor: tooltip.star.group.color + "44",
                } as React.CSSProperties
              }
              initial={{ opacity: 0, scale: 0.88, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 4 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Beam line from star to tooltip */}
              <div
                className="cv-tooltip-beam"
                style={{ background: tooltip.star.group.color }}
              />

              <p className="cv-tooltip-title">{tooltip.star.task.title}</p>
              <div className="cv-tooltip-meta">
                <span
                  className="cv-tooltip-badge"
                  style={{
                    background: tooltip.star.group.color + "22",
                    color: tooltip.star.group.color,
                    border: `1px solid ${tooltip.star.group.color}44`,
                  }}
                >
                  {tooltip.star.group.label}
                </span>
                <span className="cv-tooltip-state">
                  {STATE_LABEL[tooltip.star.task.state] ??
                    tooltip.star.task.state}
                </span>
              </div>
              {tooltip.star.task.deadline && (
                <p className="cv-tooltip-deadline">
                  {new Date(tooltip.star.task.deadline).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                    },
                  )}
                </p>
              )}
              <p className="cv-tooltip-tap">Tap to open</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Styles ───────────────────────────────────────────────────── */}
      <style jsx>{`
        .cv-root {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
        }

        /* ── Legend ── */
        .cv-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem 1.2rem;
          padding: 0 0.25rem;
        }

        .cv-legend-item {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .cv-legend-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .cv-legend-label {
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: rgba(203, 213, 255, 0.5);
        }

        /* ── Sky container ── */
        .cv-sky {
          position: relative;
          width: 100%;
          /* Tall enough to breathe */
          height: clamp(420px, 58vh, 680px);
          border-radius: 24px;
          overflow: hidden;
          background:
            radial-gradient(
              ellipse 70% 60% at 30% 20%,
              rgba(88, 28, 135, 0.22) 0%,
              transparent 70%
            ),
            radial-gradient(
              ellipse 55% 50% at 75% 75%,
              rgba(15, 23, 70, 0.45) 0%,
              transparent 70%
            ),
            linear-gradient(
              160deg,
              rgba(7, 5, 26, 0.95) 0%,
              rgba(10, 8, 35, 0.98) 100%
            );
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow:
            inset 0 0 80px rgba(88, 28, 135, 0.12),
            0 24px 60px rgba(0, 0, 0, 0.4);
        }

        /* ── Canvas ── */
        .cv-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          cursor: crosshair;
        }

        /* ── Loading ── */
        .cv-loading {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          z-index: 4;
          background: rgba(7, 5, 26, 0.6);
          backdrop-filter: blur(6px);
        }

        .cv-loading-orb {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(167, 139, 250, 0.8),
            rgba(96, 165, 250, 0.3)
          );
          animation: orb-pulse 2s ease-in-out infinite;
        }

        @keyframes orb-pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.18);
            opacity: 1;
          }
        }

        .cv-loading-text {
          font-size: 0.82rem;
          color: rgba(203, 213, 255, 0.55);
          font-style: italic;
          margin: 0;
          letter-spacing: 0.04em;
        }

        /* ── Empty ── */
        .cv-empty {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          z-index: 3;
          pointer-events: none;
          text-align: center;
          padding: 2rem;
        }

        .cv-empty-headline {
          font-size: 1.05rem;
          font-weight: 300;
          color: rgba(216, 180, 254, 0.6);
          margin: 0;
          letter-spacing: -0.01em;
        }

        .cv-empty-sub {
          font-size: 0.78rem;
          color: rgba(148, 163, 184, 0.45);
          margin: 0;
        }

        /* ── Tooltip ── */
        .cv-tooltip {
          position: absolute;
          transform: translate(-50%, calc(-100% - 20px));
          z-index: 10;
          pointer-events: none;

          background: rgba(10, 8, 35, 0.82);
          backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid;
          border-radius: 16px;
          padding: 0.9rem 1.1rem 0.75rem;
          min-width: 170px;
          max-width: 230px;

          box-shadow:
            0 0 24px var(--glow, rgba(167, 139, 250, 0.3)),
            0 8px 32px rgba(0, 0, 0, 0.5);
        }

        .cv-tooltip-beam {
          position: absolute;
          bottom: -13px;
          left: 50%;
          transform: translateX(-50%);
          width: 1.5px;
          height: 14px;
          opacity: 0.5;
          border-radius: 2px;
        }

        .cv-tooltip-title {
          font-size: 0.85rem;
          font-weight: 500;
          color: rgba(248, 245, 255, 0.92);
          margin: 0 0 0.5rem;
          line-height: 1.35;
        }

        .cv-tooltip-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 0.35rem;
        }

        .cv-tooltip-badge {
          font-size: 0.66rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.15rem 0.5rem;
          border-radius: 20px;
        }

        .cv-tooltip-state {
          font-size: 0.7rem;
          color: rgba(148, 163, 184, 0.6);
          font-style: italic;
        }

        .cv-tooltip-deadline {
          font-size: 0.72rem;
          color: rgba(203, 213, 255, 0.5);
          margin: 0 0 0.3rem;
        }

        .cv-tooltip-tap {
          font-size: 0.67rem;
          color: rgba(148, 163, 184, 0.38);
          margin: 0;
          letter-spacing: 0.04em;
        }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .cv-loading-orb {
            animation: none;
            opacity: 0.7;
          }
        }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .cv-sky {
            height: clamp(360px, 65vw, 480px);
            border-radius: 18px;
          }

          .cv-legend {
            gap: 0.4rem 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}
