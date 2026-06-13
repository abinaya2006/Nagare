'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { TimelineAnswer } from '@/lib/onboardingData';

const COMMON_SLOTS = [
  { label: 'Morning class', start: '09:00', end: '11:00' },
  { label: 'Lunch', start: '13:00', end: '14:00' },
  { label: 'Evening workout', start: '18:00', end: '19:00' },
  { label: 'Sleep', start: '23:00', end: '07:00' },
];

interface TimelineBuilderProps {
  value: TimelineAnswer;
  onChange: (val: TimelineAnswer) => void;
  accentColor: string;
  accentBg: string;
}

export default function TimelineBuilder({ value, onChange, accentColor, accentBg }: TimelineBuilderProps) {
  const [label, setLabel] = useState('');
  const [start, setStart] = useState('09:00');
  const [end, setEnd]     = useState('10:00');
  const [error, setError] = useState('');

  function addSlot() {
    if (!label.trim()) { setError('Give this block a name.'); return; }
    setError('');
    onChange([...value, { label: label.trim(), start, end }]);
    setLabel('');
    setStart('09:00');
    setEnd('10:00');
  }

  function removeSlot(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function addPreset(preset: typeof COMMON_SLOTS[0]) {
    const exists = value.some(v => v.label === preset.label);
    if (!exists) onChange([...value, preset]);
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Preset suggestions */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-[#A09DB8] uppercase tracking-wide font-medium">
          Quick add
        </p>
        <div className="flex flex-wrap gap-2">
          {COMMON_SLOTS.map(p => (
            <button
              key={p.label}
              onClick={() => addPreset(p)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              style={{
                borderColor: 'rgba(28,26,46,0.12)',
                background: 'rgba(255,255,255,0.65)',
                color: '#4A4760',
              }}
            >
              + {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom block entry */}
      <div
        className="rounded-2xl p-4 flex flex-col gap-3"
        style={{ background: 'rgba(255,255,255,0.6)', border: '0.5px solid rgba(28,26,46,0.08)' }}
      >
        <input
          type="text"
          placeholder="Block name (e.g. Study session)"
          value={label}
          onChange={e => setLabel(e.target.value)}
          className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{
            background: 'rgba(28,26,46,0.04)',
            border: '0.5px solid rgba(28,26,46,0.12)',
            color: '#1C1A2E',
            fontFamily: 'inherit',
          }}
          onKeyDown={e => e.key === 'Enter' && addSlot()}
        />
        <div className="flex gap-3 items-center">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-[#A09DB8]">From</label>
            <input
              type="time"
              value={start}
              onChange={e => setStart(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm outline-none w-full"
              style={{
                background: 'rgba(28,26,46,0.04)',
                border: '0.5px solid rgba(28,26,46,0.12)',
                color: '#1C1A2E',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-[#A09DB8]">To</label>
            <input
              type="time"
              value={end}
              onChange={e => setEnd(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm outline-none w-full"
              style={{
                background: 'rgba(28,26,46,0.04)',
                border: '0.5px solid rgba(28,26,46,0.12)',
                color: '#1C1A2E',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <button
            onClick={addSlot}
            className="self-end px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-85"
            style={{ background: accentColor, marginTop: 18 }}
          >
            Add
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {/* Timeline segments */}
      <AnimatePresence>
        {value.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-[#A09DB8] uppercase tracking-wide font-medium">
              Your off-limits blocks
            </p>
            {value.map((slot, i) => (
              <motion.div
                key={`${slot.label}-${i}`}
                layout
                initial={{ opacity: 0, x: -12, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 12, scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className="flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{
                  background: accentBg,
                  border: `0.5px solid ${accentColor}40`,
                }}
              >
                {/* Color accent line */}
                <div
                  className="rounded-full flex-shrink-0"
                  style={{ width: 4, height: 32, background: accentColor, opacity: 0.7 }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1C1A2E] truncate">{slot.label}</p>
                  <p className="text-xs text-[#A09DB8]">{slot.start} → {slot.end}</p>
                </div>
                <button
                  onClick={() => removeSlot(i)}
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
                  aria-label={`Remove ${slot.label}`}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2l8 8M10 2l-8 8" stroke="#A09DB8" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {value.length === 0 && (
        <p className="text-sm text-[#A09DB8] text-center py-2">
          No blocks added yet — or skip if there are none.
        </p>
      )}
    </div>
  );
}
