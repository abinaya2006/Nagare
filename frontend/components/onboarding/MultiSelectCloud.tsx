'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface MultiSelectCloudProps {
  options: string[];
  selected: number[];
  onToggle: (index: number) => void;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  max?: number;
  hint?: string;
}

/**
 * Floating cloud of selectable chips.
 * Selected chips glow softly and show a checkmark.
 * Chips are laid out in a wrapping flex row.
 */
export default function MultiSelectCloud({
  options, selected, onToggle, accentColor, accentBg, accentBorder, max, hint,
}: MultiSelectCloudProps) {
  const atMax = max !== undefined && selected.length >= max;

  return (
    <div className="flex flex-col gap-3 w-full">
      {hint && (
        <p className="text-xs text-[#A09DB8] font-medium tracking-wide uppercase">
          {hint}{max ? ` · up to ${max}` : ''}
        </p>
      )}

      <div
        className="flex flex-wrap gap-2.5"
        role="group"
        aria-label="Select options"
      >
        {options.map((opt, i) => {
          const isSelected = selected.includes(i);
          const isDisabled = atMax && !isSelected;

          return (
            <motion.button
              key={i}
              role="checkbox"
              aria-checked={isSelected}
              aria-disabled={isDisabled}
              onClick={() => !isDisabled && onToggle(i)}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 6 }}
              animate={{
                opacity: isDisabled ? 0.4 : 1,
                scale: isSelected ? 1.03 : 1,
                y: 0,
              }}
              transition={{ type: 'spring', stiffness: 340, damping: 22, delay: i * 0.04 }}
              whileHover={!isDisabled ? { scale: isSelected ? 1.05 : 1.02, y: -1 } : {}}
              whileTap={!isDisabled ? { scale: 0.96 } : {}}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium cursor-pointer outline-none focus-visible:ring-2"
              style={{
                background: isSelected ? accentBg : 'rgba(255,255,255,0.72)',
                border: `0.5px solid ${isSelected ? accentBorder : 'rgba(28,26,46,0.12)'}`,
                color: isSelected ? '#1C1A2E' : '#4A4760',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: isSelected
                  ? `0 2px 12px ${accentColor}30, 0 0 0 1px ${accentColor}30`
                  : '0 1px 4px rgba(28,26,46,0.06)',
                transition: 'box-shadow 0.2s, background 0.2s, border-color 0.2s',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              <AnimatePresence mode="wait">
                {isSelected ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                    className="flex-shrink-0 rounded-full flex items-center justify-center"
                    style={{
                      width: 16, height: 16,
                      background: accentColor,
                    }}
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4l1.8 1.8L6.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.span>
                ) : (
                  <motion.div
                    key="dot"
                    className="flex-shrink-0 rounded-full"
                    style={{ width: 6, height: 6, background: 'rgba(28,26,46,0.18)' }}
                  />
                )}
              </AnimatePresence>
              {opt}
            </motion.button>
          );
        })}
      </div>

      {/* Selected count indicator */}
      {max && (
        <motion.p
          className="text-xs mt-1"
          style={{ color: selected.length === max ? accentColor : '#A09DB8' }}
          animate={{ opacity: selected.length > 0 ? 1 : 0 }}
        >
          {selected.length} of {max} chosen
        </motion.p>
      )}
    </div>
  );
}
