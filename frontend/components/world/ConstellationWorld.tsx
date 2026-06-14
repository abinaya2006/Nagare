"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import { ZoomIn, ZoomOut, Compass, Sparkles } from "lucide-react";

import EmotionalSky from "./EmotionalSky";
import DreamFog from "./DreamFog";
import Constellation from "./Constellation";
import LoreModal from "./LoreModal";
import DiscoveryReveal from "./DiscoveryReveal";
import NANIGuide from "./NANIGuide";
import FlowEnergyTracker from "./FlowEnergyTracker";

import { useConstellationProgress, type ConstellationProgress } from "@/hooks/useConstellationProgress";
import { useWorldUnlocks } from "@/hooks/useWorldUnlocks";
import { REGIONS, WORLD_SIZE } from "@/lib/world-data";

// ── Animal shape presets ──────────────────────────────────────────────────────
// Each preset remaps the star dx/dy offsets to form a rough animal silhouette.
// The user picks one; it's saved to localStorage and applied to all constellations.

export type AnimalShape = "default" | "bear" | "fox" | "whale" | "bird" | "wolf";

export const ANIMAL_SHAPES: { id: AnimalShape; label: string; emoji: string }[] = [
  { id: "default", label: "Classic",  emoji: "✦" },
  { id: "bear",    label: "Bear",     emoji: "🐻" },
  { id: "fox",     label: "Fox",      emoji: "🦊" },
  { id: "whale",   label: "Whale",    emoji: "🐋" },
  { id: "bird",    label: "Bird",     emoji: "🐦" },
  { id: "wolf",    label: "Wolf",     emoji: "🐺" },
];

const LS_KEY = "nagare-constellation-shape";

function loadShape(): AnimalShape {
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v && ANIMAL_SHAPES.some((s) => s.id === v)) return v as AnimalShape;
  } catch {}
  return "bear"; // default is bear
}

function saveShape(shape: AnimalShape) {
  try { localStorage.setItem(LS_KEY, shape); } catch {}
}

// Star offset modifiers per animal — multiplied onto the original dx/dy to
// skew the constellation into a rough silhouette shape.
const SHAPE_TRANSFORMS: Record<AnimalShape, (dx: number, dy: number, i: number, total: number) => { dx: number; dy: number }> = {
  default: (dx, dy) => ({ dx, dy }),
  bear: (dx, dy, i, total) => {
    // Bears are wide and hunched — squish Y, spread X
    const t = i / Math.max(total - 1, 1);
    return { dx: dx * 1.3, dy: dy * 0.6 + Math.sin(t * Math.PI) * -40 };
  },
  fox: (dx, dy, i, total) => {
    // Fox: tall triangle, pointy top
    const t = i / Math.max(total - 1, 1);
    return { dx: dx * 0.9, dy: dy * 1.2 - t * 30 };
  },
  whale: (dx, dy, i, total) => {
    // Whale: long horizontal sweep with a tail curve
    const t = i / Math.max(total - 1, 1);
    return { dx: dx * 1.8, dy: dy * 0.4 + Math.pow(t, 2) * 60 };
  },
  bird: (dx, dy, i) => {
    // Bird: two wings spread wide, dip in the middle
    const wing = i % 2 === 0 ? 1 : -1;
    return { dx: dx * 1.5 * wing, dy: dy * 0.7 - Math.abs(dx) * 0.15 };
  },
  wolf: (dx, dy, i, total) => {
    // Wolf: angular, lean forward
    const t = i / Math.max(total - 1, 1);
    return { dx: dx * 1.1 + t * 20, dy: dy * 1.1 - t * 25 };
  },
};

// ─────────────────────────────────────────────────────────────────────────────

interface ConstellationWorldProps {
  initialCompletedTasks?: number;
  onOpenNaniChat?: () => void;
}

const MIN_SCALE = 0.35;
const MAX_SCALE = 1.2;

export default function ConstellationWorld({ initialCompletedTasks = 0, onOpenNaniChat }: ConstellationWorldProps) {
  const [completedTasks, setCompletedTasks] = useState(Math.max(0, initialCompletedTasks));

  // Sync when prop updates (after API fetch in page)
  useEffect(() => {
    setCompletedTasks(Math.max(0, initialCompletedTasks));
  }, [initialCompletedTasks]);

  const constellationProgress = useConstellationProgress(completedTasks);
  const { regions, activeMilestone, dismissMilestone } = useWorldUnlocks(completedTasks);

  const [selected, setSelected] = useState<ConstellationProgress | null>(null);
  const [scale, setScale] = useState(0.55);
  const [shapePickerOpen, setShapePickerOpen] = useState(false);
  const [activeShape, setActiveShape] = useState<AnimalShape>("bear");

  useEffect(() => {
    setActiveShape(loadShape());
  }, []);

  const handleShapeSelect = (shape: AnimalShape) => {
    setActiveShape(shape);
    saveShape(shape);
    setShapePickerOpen(false);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Center on first region when container mounts
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    const firstLight = REGIONS[0].center;
    x.set(w / 2 - firstLight.x * scale);
    y.set(h / 2 - firstLight.y * scale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dragBounds = {
    left: -(WORLD_SIZE.width * scale),
    right: WORLD_SIZE.width * scale,
    top: -(WORLD_SIZE.height * scale),
    bottom: WORLD_SIZE.height * scale,
  };

  const adjustZoom = (delta: number) => {
    setScale((prev) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, +(prev + delta).toFixed(2))));
  };

  const recenter = () => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    const firstLight = REGIONS[0].center;
    x.set(w / 2 - firstLight.x * 0.55);
    y.set(h / 2 - firstLight.y * 0.55);
    setScale(0.55);
  };

  // Apply shape transform to constellation progress
  const shapedProgress = constellationProgress.map((p) => {
    const transform = SHAPE_TRANSFORMS[activeShape];
    const total = p.constellation.stars.length;
    return {
      ...p,
      constellation: {
        ...p.constellation,
        stars: p.constellation.stars.map((star, i) => {
          const { dx, dy } = transform(star.dx, star.dy, i, total);
          return { ...star, dx, dy };
        }),
      },
    };
  });

  return (
    // Fill whatever height the parent gives — no fixed vh here
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      <div ref={containerRef} className="absolute inset-0 overflow-hidden">
        <motion.div
          drag
          dragElastic={0.06}
          dragMomentum={false}
          dragConstraints={dragBounds}
          style={{
            x,
            y,
            scale,
            width: WORLD_SIZE.width,
            height: WORLD_SIZE.height,
            transformOrigin: "0 0",
          }}
          className="relative cursor-grab touch-none active:cursor-grabbing"
        >
          <EmotionalSky />
          <DreamFog regions={regions} />
          {shapedProgress.map((progress) => (
            <Constellation key={progress.constellation.id} progress={progress} onSelect={setSelected} />
          ))}
        </motion.div>
      </div>

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_120px_60px_rgba(255,255,255,0.45)]" />

      {/* Flow Energy — top left */}
      <div className="pointer-events-none absolute left-4 top-4 sm:left-5 sm:top-5">
        <FlowEnergyTracker
          completedTasks={completedTasks}
          starFragments={completedTasks}
          onAddEnergy={() => {}} // no manual add — driven by real tasks
        />
      </div>

      {/* Controls — top right */}
      <div className="pointer-events-auto absolute right-4 top-4 flex flex-col gap-2 sm:right-5 sm:top-5">
        <button
          type="button"
          onClick={() => adjustZoom(0.1)}
          aria-label="Zoom in"
          className="glass flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:shadow-glow-lav"
        >
          <ZoomIn size={15} />
        </button>
        <button
          type="button"
          onClick={() => adjustZoom(-0.1)}
          aria-label="Zoom out"
          className="glass flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:shadow-glow-lav"
        >
          <ZoomOut size={15} />
        </button>
        <button
          type="button"
          onClick={recenter}
          aria-label="Re-center sky"
          className="glass flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:shadow-glow-lav"
        >
          <Compass size={15} />
        </button>

        {/* Shape picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShapePickerOpen((v) => !v)}
            aria-label="Change constellation shape"
            title="Change constellation shape"
            className="glass flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:shadow-glow-lav"
          >
            <Sparkles size={15} />
          </button>

          {shapePickerOpen && (
            <motion.div
              initial={{ opacity: 0, x: 8, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.95 }}
              className="absolute right-11 top-0 z-50 flex flex-col gap-1 rounded-2xl border border-white/20 bg-white/80 p-2 backdrop-blur-md shadow-lg"
              style={{ minWidth: 120 }}
            >
              <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-widest text-ink/40">Shape</p>
              {ANIMAL_SHAPES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleShapeSelect(s.id)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-left text-xs transition ${
                    activeShape === s.id
                      ? "bg-lav/20 font-semibold text-lav"
                      : "text-ink hover:bg-black/5"
                  }`}
                >
                  <span>{s.emoji}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <NANIGuide onOpenChat={onOpenNaniChat} />
      <LoreModal progress={selected} onClose={() => setSelected(null)} />
      <DiscoveryReveal milestone={activeMilestone} onDismiss={dismissMilestone} />
    </div>
  );
}
