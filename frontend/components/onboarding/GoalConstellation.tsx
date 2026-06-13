'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface GoalConstellationProps {
  options: string[];
  selected: number[];
  onToggle: (i: number) => void;
  accentColor: string;
  accentBg: string;
  max: number;
}

/**
 * Floating goal bubbles.
 * Selected bubbles orbit slowly around a central orb.
 * Unselected bubbles float gently in place.
 */
export default function GoalConstellation({
  options, selected, onToggle, accentColor, accentBg, max,
}: GoalConstellationProps) {
  const atMax = selected.length >= max;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#A09DB8] uppercase tracking-wide font-medium">
          Choose up to {max}
        </p>
        <motion.div
          className="flex gap-1.5 items-center"
          animate={{ opacity: selected.length > 0 ? 1 : 0 }}
        >
          {Array.from({ length: max }).map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              animate={{
                background: i < selected.length ? accentColor : 'rgba(28,26,46,0.12)',
                scale: i < selected.length ? 1.2 : 1,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{ width: 7, height: 7 }}
            />
          ))}
          <span className="text-xs ml-1" style={{ color: accentColor }}>
            {selected.length}/{max}
          </span>
        </motion.div>
      </div>

      {/* Goal bubbles grid */}
      <div className="flex flex-wrap gap-3" role="group" aria-label="Goal selection">
        {options.map((opt, i) => {
          const isSelected = selected.includes(i);
          const disabled = atMax && !isSelected;

          return (
            <GoalBubble
              key={i}
              label={opt}
              index={i}
              isSelected={isSelected}
              disabled={disabled}
              accentColor={accentColor}
              accentBg={accentBg}
              onToggle={() => !disabled && onToggle(i)}
            />
          );
        })}
      </div>

      {/* Orbit visualization — shows selected goals orbiting a center orb */}
      <AnimatePresence>
        {selected.length > 0 && (
          <OrbitDisplay
            selectedLabels={selected.map(i => options[i])}
            accentColor={accentColor}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function GoalBubble({
  label, index, isSelected, disabled, accentColor, accentBg, onToggle,
}: {
  label: string; index: number; isSelected: boolean; disabled: boolean;
  accentColor: string; accentBg: string; onToggle: () => void;
}) {
  return (
    <motion.button
      role="checkbox"
      aria-checked={isSelected}
      onClick={onToggle}
      layout
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{
        opacity: disabled ? 0.35 : 1,
        scale: isSelected ? 1.04 : 1,
        y: isSelected ? -2 : 0,
      }}
      transition={{ type: 'spring', stiffness: 340, damping: 22, delay: index * 0.05 }}
      whileHover={!disabled ? { scale: isSelected ? 1.06 : 1.03, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      className="relative px-4 py-3 rounded-2xl text-sm font-medium outline-none focus-visible:ring-2 select-none"
      style={{
        background: isSelected ? accentBg : 'rgba(255,255,255,0.7)',
        border: `0.5px solid ${isSelected ? accentColor + '70' : 'rgba(28,26,46,0.10)'}`,
        color: isSelected ? '#1C1A2E' : '#4A4760',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: isSelected
          ? `0 4px 20px ${accentColor}28, 0 0 0 1.5px ${accentColor}40`
          : '0 1px 6px rgba(28,26,46,0.05)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'box-shadow 0.25s, background 0.25s',
      }}
    >
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 30% 30%, ${accentColor}20 0%, transparent 65%)`,
            }}
          />
        )}
      </AnimatePresence>
      {label}
    </motion.button>
  );
}

function OrbitDisplay({ selectedLabels, accentColor }: { selectedLabels: string[]; accentColor: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative flex items-center justify-center mx-auto"
      style={{ width: 200, height: 90 }}
    >
      {/* Central orb */}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute rounded-full"
        style={{
          width: 28, height: 28,
          background: `radial-gradient(circle at 35% 35%, #fff, ${accentColor})`,
          boxShadow: `0 0 16px ${accentColor}60`,
          zIndex: 2,
        }}
      />

      {/* Orbiting labels */}
      {selectedLabels.slice(0, 3).map((label, i) => {
        const angle = (i / 3) * 360;
        const radius = 72;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * (radius * 0.4);

        return (
          <motion.div
            key={label}
            className="absolute text-xs font-medium px-2.5 py-1 rounded-full"
            style={{
              background: accentColor + '20',
              color: accentColor,
              border: `0.5px solid ${accentColor}40`,
              x: x - 32,
              y: y - 12,
              zIndex: 1,
            }}
            animate={{ x: [x - 32, x - 28, x - 32], y: [y - 12, y - 16, y - 12] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
          >
            {label.split(' ').slice(0, 2).join(' ')}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
