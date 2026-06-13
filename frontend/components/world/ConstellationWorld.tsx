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
import FlowEnergyTracker from "./FlowEnergyTracker";

import { useFlowEnergy } from "@/hooks/useFlowEnergy";
import { useConstellationProgress, type ConstellationProgress } from "@/hooks/useConstellationProgress";
import { useWorldUnlocks } from "@/hooks/useWorldUnlocks";
import { REGIONS, WORLD_SIZE } from "@/lib/world-data";

interface ConstellationWorldProps {
  initialCompletedTasks?: number;
  onOpenNaniChat?: () => void;
}

const MIN_SCALE = 0.35;
const MAX_SCALE = 1;

/**
 * The Constellation World: a vast, pannable, zoomable emotional sky.
 * Everything here is driven by a single number - total completed tasks -
 * which slowly reveals stars, draws connections, clears fog, and unlocks
 * constellations and regions.
 */
export default function ConstellationWorld({ initialCompletedTasks = 0, onOpenNaniChat }: ConstellationWorldProps) {
  const { completedTasks, starFragments, addFlowEnergy } = useFlowEnergy(initialCompletedTasks);
  const constellationProgress = useConstellationProgress(completedTasks);
  const { regions, activeMilestone, dismissMilestone } = useWorldUnlocks(completedTasks);

  const [selected, setSelected] = useState<ConstellationProgress | null>(null);
  const [scale, setScale] = useState(0.5);

  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Center the initial view on the small, familiar patch of sky.
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
    x.set(w / 2 - firstLight.x * scale);
    y.set(h / 2 - firstLight.y * scale);
    setScale(0.5);
  };

  return (
    <div className="relative h-[calc(100vh-10rem)] w-full overflow-hidden rounded-glass sm:h-[calc(100vh-3rem)]">
      <div ref={containerRef} className="absolute inset-0 overflow-hidden">
        <motion.div
          drag
          dragElastic={0.08}
          dragMomentum={false}
          dragConstraints={dragBounds}
          style={{
            x,
            y,
            scale,
            width: WORLD_SIZE.width,
            height: WORLD_SIZE.height,
          }}
          className="relative cursor-grab touch-none active:cursor-grabbing"
        >
          <EmotionalSky />
          <DreamFog regions={regions} />
          {constellationProgress.map((progress) => (
            <Constellation key={progress.constellation.id} progress={progress} onSelect={setSelected} />
          ))}
        </motion.div>
      </div>

      {/* Soft edge vignette so the canvas doesn't feel like it abruptly cuts off */}
      <div className="pointer-events-none absolute inset-0 rounded-glass shadow-[inset_0_0_120px_60px_rgba(255,255,255,0.55)]" />

      {/* Overlay: Flow Energy */}
      <div className="pointer-events-none absolute left-4 top-4 sm:left-6 sm:top-6">
        <FlowEnergyTracker
          completedTasks={completedTasks}
          starFragments={starFragments}
          onAddEnergy={() => addFlowEnergy(1)}
        />
      </div>

      {/* Overlay: zoom controls */}
      <div className="pointer-events-auto absolute right-4 top-4 flex flex-col gap-2 sm:right-6 sm:top-6">
        <button
          type="button"
          onClick={() => adjustZoom(0.1)}
          aria-label="Zoom in"
          className="glass flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:shadow-glow-lav"
        >
          <ZoomIn size={16} />
        </button>
        <button
          type="button"
          onClick={() => adjustZoom(-0.1)}
          aria-label="Zoom out"
          className="glass flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:shadow-glow-lav"
        >
          <ZoomOut size={16} />
        </button>
        <button
          type="button"
          onClick={recenter}
          aria-label="Return to the familiar sky"
          className="glass flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:shadow-glow-lav"
        >
          <Compass size={16} />
        </button>
      </div>

      <NANIGuide onOpenChat={onOpenNaniChat} />
      <LoreModal progress={selected} onClose={() => setSelected(null)} />
      <DiscoveryReveal milestone={activeMilestone} onDismiss={dismissMilestone} />
    </div>
  );
}
