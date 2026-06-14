"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import { ZoomIn, ZoomOut, Compass } from "lucide-react";

import EmotionalSky from "./EmotionalSky";
import DreamFog from "./DreamFog";
import Constellation from "./Constellation";
import LoreModal from "./LoreModal";
import DiscoveryReveal from "./DiscoveryReveal";
import NANIGuide from "./NANIGuide";

import { useConstellationProgress, type ConstellationProgress } from "@/hooks/useConstellationProgress";
import { useWorldUnlocks } from "@/hooks/useWorldUnlocks";
import { REGIONS, WORLD_SIZE } from "@/lib/world-data";
import type { AnimalShape } from "./ConstellationShapes";

interface ConstellationWorldProps {
  completedTasks: number;
  animalShape?: AnimalShape;
  onOpenNaniChat?: () => void;
}

const MIN_SCALE = 0.3;
const MAX_SCALE = 1.6;

export default function ConstellationWorld({
  completedTasks,
  animalShape = "bear",
  onOpenNaniChat,
}: ConstellationWorldProps) {
  const constellationProgress = useConstellationProgress(completedTasks, animalShape);
  const { regions, activeMilestone, dismissMilestone } = useWorldUnlocks(completedTasks);

  const [selected, setSelected] = useState<ConstellationProgress | null>(null);
  const [scale, setScale] = useState(0.55);

  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Center the view on the first region on mount
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    const firstLight = REGIONS[0].center;
    x.set(w / 2 - firstLight.x * 0.55);
    y.set(h / 2 - firstLight.y * 0.55);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dragBounds = {
    left: -(WORLD_SIZE.width * scale - 100),
    right: 100,
    top: -(WORLD_SIZE.height * scale - 100),
    bottom: 100,
  };

  const adjustZoom = (delta: number) =>
    setScale((prev) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, +(prev + delta).toFixed(2))));

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

  return (
    // h-full: fills whatever the parent gives — page sets the height
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      <div ref={containerRef} className="absolute inset-0 overflow-hidden">
        <motion.div
          drag
          dragElastic={0.05}
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
          {constellationProgress.map((progress) => (
            <Constellation
              key={progress.constellation.id}
              progress={progress}
              onSelect={setSelected}
            />
          ))}
        </motion.div>
      </div>

      {/* Vignette — dark edges to frame the sky */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          boxShadow: "inset 0 0 140px 70px rgba(5,8,26,0.75)",
        }}
      />

      {/* Star count — top left, no button */}
      <div className="pointer-events-none absolute left-4 top-4 sm:left-6 sm:top-6">
        <div
          className="rounded-2xl px-4 py-3"
          style={{
            background: "rgba(10,14,40,0.65)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          <p className="font-display text-sm italic" style={{ color: "rgba(220,230,255,0.9)" }}>
            {completedTasks} star{completedTasks !== 1 ? "s" : ""} gathered
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "rgba(160,175,220,0.7)" }}>
            {completedTasks === 0
              ? "Complete tasks to light the sky."
              : `${(5 - (completedTasks % 5)) % 5 || 5} more until a new star appears.`}
          </p>
        </div>
      </div>

      {/* Zoom controls — dark glass on dark sky */}
      <div className="pointer-events-auto absolute right-4 top-4 flex flex-col gap-2 sm:right-6 sm:top-6">
        {[
          { label: "Zoom in",  icon: <ZoomIn size={16} />,  fn: () => adjustZoom(0.1) },
          { label: "Zoom out", icon: <ZoomOut size={16} />, fn: () => adjustZoom(-0.1) },
          { label: "Recenter", icon: <Compass size={16} />, fn: recenter },
        ].map(({ label, icon, fn }) => (
          <button
            key={label}
            type="button"
            onClick={fn}
            aria-label={label}
            className="flex h-10 w-10 items-center justify-center rounded-full transition"
            style={{
              background: "rgba(10,14,40,0.65)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              color: "rgba(200,215,255,0.85)",
            }}
          >
            {icon}
          </button>
        ))}
      </div>

      <NANIGuide onOpenChat={onOpenNaniChat} />
      <LoreModal progress={selected} onClose={() => setSelected(null)} />
      <DiscoveryReveal milestone={activeMilestone} onDismiss={dismissMilestone} />
    </div>
  );
}
