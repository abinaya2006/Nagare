'use client';

import { motion } from 'framer-motion';
import FlowOrb from './FlowOrb';
import type { OnboardingAnswers } from '@/lib/onboardingData';
import { QUESTIONS } from '@/lib/onboardingData';

interface CompletionScreenProps {
  answers: OnboardingAnswers;
  onContinue: () => void;
}

const SUMMARY_MAP: { key: string; label: string; optionsFallback?: string[] }[] = [
  {
    key: 'peak_time',
    label: 'Peak Energy',
    optionsFallback: ['Early morning', 'Afternoon', 'Evening', 'Late night', 'Mood-dependent'],
  },
  {
    key: 'focus_span',
    label: 'Focus Window',
    optionsFallback: ['15–25 min', '30–45 min', '45–60 min', '60–90 min', '90+ min'],
  },
  {
    key: 'break_preference',
    label: 'Break Style',
    optionsFallback: ['Every 25 min', 'At 45 min', 'After 1 hour', 'When tired', 'No breaks'],
  },
  {
    key: 'goals',
    label: 'Primary Goal',
  },
];

function getSummaryValue(key: string, answers: OnboardingAnswers): string {
  const q = QUESTIONS.find(q => q.id === key);
  const answer = answers[key];
  if (!q || answer === null || answer === undefined) return '—';

  if (key === 'goals') {
    if (q.type === 'goals' && Array.isArray(answer)) {
      return q.options[(answer as number[])[0]] ?? '—';
    }
    return '—';
  }

  if (typeof answer === 'number' && q.type === 'single') {
    return q.options[answer] ?? '—';
  }

  return '—';
}

export default function CompletionScreen({ answers, onContinue }: CompletionScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center w-full max-w-md mx-auto gap-6 pt-4 pb-8 px-4"
    >
      {/* Completed orb */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 18 }}
      >
        <FlowOrb progress={1} color="#AFA9EC" size={80} />
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="text-center"
      >
        <h1
          className="text-3xl font-medium leading-tight mb-2"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: '#1C1A2E', letterSpacing: '-0.025em' }}
        >
          Your rhythm has been discovered.
        </h1>
        <p className="text-sm text-[#A09DB8] leading-relaxed max-w-xs mx-auto">
          NANI now understands how your mind flows. Here is what we found.
        </p>
      </motion.div>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="w-full rounded-[24px] p-6"
        style={{
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '0.5px solid rgba(255,255,255,0.9)',
          boxShadow: '0 6px 32px rgba(28,26,46,0.07)',
        }}
      >
        <p className="text-xs text-[#A09DB8] uppercase tracking-widest font-medium mb-4">
          Your profile
        </p>
        <div className="grid grid-cols-2 gap-4">
          {SUMMARY_MAP.map(({ key, label }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex flex-col gap-1"
            >
              <span className="text-xs text-[#A09DB8] font-medium">{label}</span>
              <span className="text-sm font-semibold text-[#1C1A2E] leading-snug">
                {getSummaryValue(key, answers)}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        whileHover={{ scale: 1.02, boxShadow: '0 8px 28px rgba(123,110,232,0.35)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className="w-full py-4 rounded-2xl text-white font-medium text-base"
        style={{
          background: 'linear-gradient(135deg, #7B6EE8 0%, #85B7EB 100%)',
          boxShadow: '0 4px 20px rgba(123,110,232,0.28)',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Meet NANI
      </motion.button>
    </motion.div>
  );
}
