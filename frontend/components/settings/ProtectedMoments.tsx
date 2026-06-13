"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import {
  PROTECTED_CATEGORY_INFO,
  type ProtectedBlock,
  type ProtectedCategory,
} from "@/types/settings";

interface ProtectedMomentsProps {
  blocks: ProtectedBlock[];
  onAdd: (block: ProtectedBlock) => void;
  onRemove: (id: string) => void;
}

const CATEGORIES = Object.keys(PROTECTED_CATEGORY_INFO) as ProtectedCategory[];
const HOURS = Array.from({ length: 25 }, (_, i) => i);

export default function ProtectedMoments({ blocks, onAdd, onRemove }: ProtectedMomentsProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<ProtectedCategory>("custom");
  const [customName, setCustomName] = useState("");
  const [draft, setDraft] = useState<{ start: number; end: number } | null>(null);
  const dragStartHour = useRef<number | null>(null);

  const hourFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    return Math.round(ratio * 24 * 4) / 4;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const hour = hourFromClientX(e.clientX);
    dragStartHour.current = hour;
    setDraft({ start: hour, end: hour });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartHour.current === null) return;
    const hour = hourFromClientX(e.clientX);
    const start = Math.min(dragStartHour.current, hour);
    const end = Math.max(dragStartHour.current, hour);
    setDraft({ start, end });
  };

  const handlePointerUp = () => {
    if (draft && draft.end - draft.start >= 0.25) {
      const label =
        category === "custom"
          ? customName.trim() || "Custom"
          : PROTECTED_CATEGORY_INFO[category].label;
      onAdd({
        id: `block-${Date.now()}`,
        category,
        label,
        startHour: draft.start,
        endHour: draft.end,
      });
    }
    dragStartHour.current = null;
    setDraft(null);
  };

  const renderSegments = (block: ProtectedBlock) => {
    if (block.endHour >= block.startHour) {
      return [{ left: block.startHour, width: block.endHour - block.startHour }];
    }
    return [
      { left: block.startHour, width: 24 - block.startHour },
      { left: 0, width: block.endHour },
    ];
  };

  return (
    <div className="glass rounded-glass p-5 sm:p-6">
      <h2 className="font-display text-lg font-medium text-ink">Protected Moments</h2>
      <p className="mb-3 text-xs text-ink-soft">
        Drag across the timeline to mark time Nagare should leave untouched.
      </p>

      <div className="mb-3 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            aria-pressed={category === cat}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition ${
              category === cat ? "bg-white/70 text-ink shadow-glow-lav" : "bg-white/30 text-ink-soft hover:bg-white/50"
            }`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: PROTECTED_CATEGORY_INFO[cat].color }}
              aria-hidden="true"
            />
            {PROTECTED_CATEGORY_INFO[cat].label}
          </button>
        ))}
      </div>

      {/* Custom name input */}
      {category === "custom" && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3"
        >
          <input
            type="text"
            placeholder="Name this block (e.g. Gym, Prayer, Commute)"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full rounded-xl border border-white/40 bg-white/40 px-4 py-2 text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-lavender/40 backdrop-blur-sm"
          />
        </motion.div>
      )}

      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          if (dragStartHour.current !== null) handlePointerUp();
        }}
        className="relative h-16 w-full cursor-crosshair touch-none rounded-2xl bg-white/30 select-none"
      >
        {HOURS.map((h) => (
          <span
            key={h}
            className="absolute top-0 h-full border-l border-white/40"
            style={{ left: `${(h / 24) * 100}%` }}
            aria-hidden="true"
          />
        ))}

        {blocks.map((block) =>
          renderSegments(block).map((seg, i) => (
            <div
              key={`${block.id}-${i}`}
              className="absolute top-1 bottom-1 flex items-center justify-end rounded-lg px-1"
              style={{
                left: `${(seg.left / 24) * 100}%`,
                width: `${(seg.width / 24) * 100}%`,
                backgroundColor: `${PROTECTED_CATEGORY_INFO[block.category].color}99`,
              }}
            >
              {i === 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(block.id);
                  }}
                  aria-label={`Remove ${block.label}`}
                  className="rounded-full bg-white/70 p-0.5 text-ink-soft hover:text-ink"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))
        )}

        {draft && (
          <motion.div
            className="absolute top-1 bottom-1 rounded-lg"
            style={{
              left: `${(draft.start / 24) * 100}%`,
              width: `${((draft.end - draft.start) / 24) * 100}%`,
              backgroundColor: `${PROTECTED_CATEGORY_INFO[category].color}66`,
            }}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0.8 }}
          />
        )}
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-ink-soft">
        <span>12am</span>
        <span>6am</span>
        <span>12pm</span>
        <span>6pm</span>
        <span>12am</span>
      </div>

      {blocks.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2 text-xs text-ink-soft">
          {blocks.map((block) => (
            <li key={block.id} className="rounded-full bg-white/35 px-3 py-1">
              {block.label}: {formatHour(block.startHour)} – {formatHour(block.endHour)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatHour(hour: number) {
  const h = Math.floor(hour) % 24;
  const m = Math.round((hour - Math.floor(hour)) * 60);
  const period = h < 12 ? "am" : "pm";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${displayHour}${period}` : `${displayHour}:${m.toString().padStart(2, "0")}${period}`;
}
