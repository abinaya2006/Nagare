"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  type PanInfo,
} from "framer-motion";
import { useState, useRef } from "react";

interface SwipeOptionProps {
  options: string[];
  selected: number | null;
  onSelect: (index: number) => void;
  accentColor: string;
  accentBg: string;
}

/**
 * Single-choice swipe carousel.
 * On mobile: drag left/right to navigate cards, tap to select.
 * On desktop: renders a scrollable horizontal list with click-to-select.
 * Selected card slides slightly right and glows.
 */
export default function SwipeOption({
  options,
  selected,
  onSelect,
  accentColor,
  accentBg,
}: SwipeOptionProps) {
  const [activeCard, setActiveCard] = useState(selected ?? 0);

  // On mobile, limit visible cards to 1 at a time; desktop shows 2.
  // We keep it simple: vertical list for predictability across screen sizes,
  // each option is a swipeable-feeling pill with spring physics on select.
  return (
    <div
      className="flex flex-col gap-3 w-full"
      role="listbox"
      aria-label="Select one option"
    >
      {options.map((opt, i) => (
        <OptionCard
          key={i}
          label={opt}
          index={i}
          isSelected={selected === i}
          accentColor={accentColor}
          accentBg={accentBg}
          onSelect={() => {
            setActiveCard(i);
            onSelect(i);
          }}
        />
      ))}
    </div>
  );
}

interface OptionCardProps {
  label: string;
  index: number;
  isSelected: boolean;
  accentColor: string;
  accentBg: string;
  onSelect: () => void;
}

function OptionCard({
  label,
  index,
  isSelected,
  accentColor,
  accentBg,
  onSelect,
}: OptionCardProps) {
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-40, 0, 40],
    [`${accentBg}`, "rgba(255,255,255,0.7)", `${accentBg}`],
  );

  function handleDragEnd(_: unknown, info: PanInfo) {
    // Any horizontal swipe > 30px is treated as a selection
    if (Math.abs(info.offset.x) > 30) {
      onSelect();
    }
  }

  return (
    <motion.button
      role="option"
      aria-selected={isSelected}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.25}
      onDragEnd={handleDragEnd}
      onClick={onSelect}
      className="relative flex items-center gap-3 w-full text-left rounded-2xl px-5 py-4 cursor-pointer outline-none focus-visible:ring-2"
      style={{
        x,
        background: isSelected ? accentBg : "rgba(255,255,255,0.72)",
        border: `0.5px solid ${isSelected ? accentColor + "80" : "rgba(28,26,46,0.10)"}`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: isSelected
          ? `0 4px 16px ${accentColor}22, 0 1px 4px rgba(0,0,0,0.05)`
          : "0 1px 6px rgba(28,26,46,0.05)",
        transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
      }}
    >
      {/* Selection indicator */}
      <motion.div
        className="flex-shrink-0 rounded-full flex items-center justify-center"
        animate={
          isSelected
            ? { background: accentColor, borderColor: accentColor, scale: 1.1 }
            : {
                background: "transparent",
                borderColor: "rgba(28,26,46,0.2)",
                scale: 1,
              }
        }
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
        style={{
          width: 20,
          height: 20,
          border: "1.5px solid rgba(28,26,46,0.2)",
        }}
      >
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="rounded-full bg-white"
            style={{ width: 8, height: 8 }}
          />
        )}
      </motion.div>

      <span
        className="text-sm font-medium leading-snug"
        style={{ color: isSelected ? "#1C1A2E" : "#4A4760" }}
      >
        {label}
      </span>

      {/* Drag ripple hint */}
      <motion.div
        className="absolute right-4 opacity-0 text-xs"
        style={{ color: accentColor }}
        animate={isSelected ? {} : { opacity: [0, 0.4, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
      >
        ←→
      </motion.div>
    </motion.button>
  );
}
